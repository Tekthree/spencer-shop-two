"use client";

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploaderProps {
  /** Allow multiple image uploads */
  multiple?: boolean;
  /** Label for the uploader */
  label?: string;
  /** Callback when images are uploaded successfully */
  onUpload?: (urls: string[]) => void;
  /** Bucket name in Supabase storage */
  bucket?: string;
  /** Folder path in the bucket */
  folderPath?: string;
}

/**
 * Reusable image uploader component
 * Supports drag and drop, preview, and deletion
 */
export default function ImageUploader({
  multiple = false,
  label = 'Upload Images',
  onUpload,
  bucket = 'artworks',
  folderPath = '',
}: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    processFiles(selectedFiles);
  };

  // Process selected files
  const processFiles = (selectedFiles: FileList) => {
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    // Convert FileList to array and filter for images
    Array.from(selectedFiles).forEach(file => {
      if (file.type.startsWith('image/')) {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    if (!multiple && newFiles.length > 0) {
      // If single file mode, replace existing files
      setFiles([newFiles[0]]);
      setPreviews([newPreviews[0]]);
    } else {
      // If multiple files mode, add to existing files
      setFiles(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Remove a file from the selection
  const removeFile = (index: number) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  // Trigger file input click
  const onButtonClick = () => {
    inputRef.current?.click();
  };

  // Upload files to Supabase storage
  const uploadFiles = async () => {
    if (files.length === 0) {
      setError('Please select at least one image to upload');
      return;
    }

    setUploading(true);
    setError(null);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        if (data) {
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

          uploadedUrls.push(urlData.publicUrl);
        }
      }

      // Clear files after successful upload
      setFiles([]);
      setPreviews([]);
      
      // Call the onUpload callback with the URLs
      if (onUpload) {
        onUpload(uploadedUrls);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Label */}
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      
      {/* Drag & Drop Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-black bg-gray-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="space-y-2">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48" 
            aria-hidden="true"
          >
            <path 
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
              strokeWidth={2} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          <div className="text-sm text-gray-600">
            <p className="font-medium">
              {uploading ? 'Uploading...' : 'Drag and drop images, or click to select'}
            </p>
            <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Selected Images</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                  <img 
                    src={preview} 
                    alt={`Preview ${index}`} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          type="button"
          onClick={uploadFiles}
          disabled={uploading}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
      )}
    </div>
  );
}
