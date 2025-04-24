"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/image-uploader';

interface ImageFile {
  id: string;
  name: string;
  bucket: string;
  path: string;
  url: string;
  metadata: {
    size: number;
    mimetype: string;
    width?: number;
    height?: number;
  };
  created_at: string;
}

/**
 * Image Library page
 * Centralized management for all uploaded images
 */
export default function ImageLibrary() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [buckets, setBuckets] = useState<string[]>(['artworks', 'about', 'collections']);

  // Fetch images from Supabase Storage
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let allImages: ImageFile[] = [];
        
        // Fetch from each bucket
        for (const bucket of buckets) {
          const { data, error } = await supabase.storage.from(bucket).list();
          
          if (error) {
            console.error(`Error listing files in ${bucket}:`, error);
            continue;
          }
          
          if (data) {
            // Get public URL for each file
            const bucketImages = await Promise.all(
              data
                .filter(item => !item.id.endsWith('/')) // Filter out folders
                .map(async (item) => {
                  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(item.name);
                  
                  return {
                    id: `${bucket}/${item.name}`,
                    name: item.name,
                    bucket,
                    path: item.name,
                    url: publicUrlData.publicUrl,
                    metadata: {
                      size: item.metadata?.size || 0,
                      mimetype: item.metadata?.mimetype || 'unknown',
                    },
                    created_at: item.created_at,
                  };
                })
            );
            
            allImages = [...allImages, ...bucketImages];
          }
        }
        
        setImages(allImages);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Failed to load images. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchImages();
  }, [buckets]);

  // Handle image upload
  const handleImageUpload = (urls: string[]) => {
    // Refresh the image list after upload
    const fetchImages = async () => {
      setLoading(true);
      
      try {
        let allImages: ImageFile[] = [];
        
        // Fetch from each bucket
        for (const bucket of buckets) {
          const { data, error } = await supabase.storage.from(bucket).list();
          
          if (error) {
            console.error(`Error listing files in ${bucket}:`, error);
            continue;
          }
          
          if (data) {
            // Get public URL for each file
            const bucketImages = await Promise.all(
              data
                .filter(item => !item.id.endsWith('/')) // Filter out folders
                .map(async (item) => {
                  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(item.name);
                  
                  return {
                    id: `${bucket}/${item.name}`,
                    name: item.name,
                    bucket,
                    path: item.name,
                    url: publicUrlData.publicUrl,
                    metadata: {
                      size: item.metadata?.size || 0,
                      mimetype: item.metadata?.mimetype || 'unknown',
                    },
                    created_at: item.created_at,
                  };
                })
            );
            
            allImages = [...allImages, ...bucketImages];
          }
        }
        
        setImages(allImages);
      } catch (err) {
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchImages();
  };

  // Filter images based on selected bucket and search query
  const filteredImages = images.filter((image) => {
    const matchesBucket = selectedBucket === 'all' || image.bucket === selectedBucket;
    const matchesSearch = searchQuery === '' || 
      image.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesBucket && matchesSearch;
  });

  // Sort images
  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortBy === 'name_asc') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'name_desc') {
      return b.name.localeCompare(a.name);
    } else if (sortBy === 'size_asc') {
      return a.metadata.size - b.metadata.size;
    } else if (sortBy === 'size_desc') {
      return b.metadata.size - a.metadata.size;
    }
    return 0;
  });

  // Toggle image selection
  const toggleImageSelection = (imageId: string) => {
    if (selectedImages.includes(imageId)) {
      setSelectedImages(selectedImages.filter(id => id !== imageId));
    } else {
      setSelectedImages([...selectedImages, imageId]);
    }
  };

  // Select all visible images
  const selectAllImages = () => {
    if (selectedImages.length === sortedImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(sortedImages.map(image => image.id));
    }
  };

  // Delete selected images
  const deleteSelectedImages = async () => {
    if (selectedImages.length === 0) return;
    
    setIsDeleting(true);
    
    try {
      for (const imageId of selectedImages) {
        const [bucket, ...pathParts] = imageId.split('/');
        const path = pathParts.join('/');
        
        const { error } = await supabase.storage.from(bucket).remove([path]);
        
        if (error) {
          console.error(`Error deleting ${path} from ${bucket}:`, error);
        }
      }
      
      // Refresh image list
      setImages(images.filter(image => !selectedImages.includes(image.id)));
      setSelectedImages([]);
    } catch (err) {
      console.error('Error deleting images:', err);
      setError('Failed to delete one or more images. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Copy image URL to clipboard
  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // Could add a toast notification here
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Image Library</h1>
        <p className="text-gray-600">Manage all your uploaded images in one place</p>
      </header>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm mb-8">
        <h2 className="text-xl font-serif mb-6">Upload New Images</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ImageUploader 
              multiple={true}
              label="Upload Images"
              onUpload={handleImageUpload}
              bucket={selectedBucket === 'all' ? 'artworks' : selectedBucket}
            />
          </div>
          
          <div>
            <label htmlFor="bucket" className="block text-sm font-medium text-gray-700 mb-1">
              Select Bucket
            </label>
            <select
              id="bucket"
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Buckets</option>
              {buckets.map((bucket) => (
                <option key={bucket} value={bucket}>
                  {bucket.charAt(0).toUpperCase() + bucket.slice(1)}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Select a bucket to organize your uploads. Images will be stored in this bucket.
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="filter-bucket" className="sr-only">Filter by Bucket</label>
            <select
              id="filter-bucket"
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Buckets</option>
              {buckets.map((bucket) => (
                <option key={bucket} value={bucket}>
                  {bucket.charAt(0).toUpperCase() + bucket.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sort-by" className="sr-only">Sort By</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="size_asc">Size (Smallest)</option>
              <option value="size_desc">Size (Largest)</option>
            </select>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedImages.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-md flex justify-between items-center mb-4">
          <div className="text-sm text-gray-700">
            {selectedImages.length} {selectedImages.length === 1 ? 'image' : 'images'} selected
          </div>
          <button
            onClick={deleteSelectedImages}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Selected'}
          </button>
        </div>
      )}

      {/* Image Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square w-full bg-gray-200 rounded-md"></div>
              <div className="h-4 bg-gray-200 rounded mt-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mt-1 w-1/2"></div>
            </div>
          ))}
        </div>
      ) : sortedImages.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm text-center">
          <h3 className="text-lg font-medium mb-2">No images found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Try a different search term or filter.' : 'Upload some images to get started.'}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <button
              onClick={selectAllImages}
              className="text-sm text-gray-700 hover:text-black"
            >
              {selectedImages.length === sortedImages.length ? 'Deselect All' : 'Select All'}
            </button>
            <div className="text-sm text-gray-500">
              {sortedImages.length} {sortedImages.length === 1 ? 'image' : 'images'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedImages.map((image) => (
              <div 
                key={image.id} 
                className={`group relative bg-white rounded-md border overflow-hidden ${
                  selectedImages.includes(image.id) ? 'ring-2 ring-black' : ''
                }`}
              >
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(image.id)}
                    onChange={() => toggleImageSelection(image.id)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                </div>
                
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyImageUrl(image.url)}
                    className="p-1 bg-white rounded-full shadow-sm text-gray-600 hover:text-black"
                    title="Copy URL"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                
                <div className="aspect-square w-full overflow-hidden bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                <div className="p-2">
                  <div className="text-sm font-medium text-gray-900 truncate" title={image.name}>
                    {image.name}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatFileSize(image.metadata.size)}</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded-full">
                      {image.bucket}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
