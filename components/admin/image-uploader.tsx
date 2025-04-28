"use client";

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

interface ImageUploaderProps {
  /** Callback when images are uploaded successfully */
  onUploadComplete: (urls: string[]) => void;
  /** Bucket name in Supabase storage */
  bucketName: string;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Folder path in the bucket */
  folderPath?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable image uploader component
 * Supports drag and drop and single image upload
 */
export default function ImageUploader({
  onUploadComplete,
  bucketName,
  multiple = true,
  folderPath = '',
  className = '',
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
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    // Process each selected file
    Array.from(selectedFiles).forEach(file => {
      if (file.type.startsWith('image/')) {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      setError(null);
    } else {
      setError('Please select at least one image file');
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    // Process each dropped file
    Array.from(droppedFiles).forEach(file => {
      if (file.type.startsWith('image/')) {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      setError(null);
    } else {
      setError('Please drop at least one image file');
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
        
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file);
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }
      
      // Call the callback with all URLs
      onUploadComplete(uploadedUrls);
      
      // Reset state
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Error uploading images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`${className}`}>
      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        
        <p className="mt-2 text-sm font-medium text-gray-900">
          {previews.length > 0 ? 'Add more images' : 'Upload images'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Drag and drop or click to select
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Selected Images ({previews.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                  <Image 
                    src={preview} 
                    alt={`Preview ${index + 1}`} 
                    className="h-full w-full object-cover"
                    width={200}
                    height={200}
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
          {uploading ? 'Uploading...' : `Upload ${files.length} Image${files.length !== 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
}
