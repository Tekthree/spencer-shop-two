"use client";

import { useState, useEffect, useCallback } from 'react';
import type { R2Image } from '@/lib/storage/r2';
import ImageUploader from '@/components/admin/image-uploader';
import Image from 'next/image';

/**
 * Image Library page
 * Centralised management for all uploaded images, now backed by R2.
 */
export default function ImageLibrary() {
  const [images, setImages] = useState<R2Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrefix, setSelectedPrefix] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [buckets] = useState<string[]>(['artworks', 'about', 'collections']);

  const fetchAllImages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results: R2Image[] = [];

      const settled = await Promise.allSettled(
        buckets.map(prefix =>
          fetch(`/api/images?prefix=${encodeURIComponent(prefix)}`)
            .then(r => r.json() as Promise<R2Image[]>)
        )
      );

      settled.forEach((result, i) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          results.push(...result.value);
        } else if (result.status === 'rejected') {
          console.error(`Error listing prefix ${buckets[i]}:`, result.reason);
        }
      });

      setImages(results);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load images. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [buckets]);

  useEffect(() => {
    fetchAllImages();
  }, [fetchAllImages]);

  const handleImageUpload = () => {
    fetchAllImages();
  };

  /** Derive the prefix (first path segment) from the key. */
  const keyPrefix = (key: string) => key.split('/')[0] ?? '';

  /** Derive a short display name from the R2 key (last path segment). */
  const displayName = (key: string) => key.split('/').pop() ?? key;

  // Filter images
  const filteredImages = images.filter((image) => {
    const matchesPrefix = selectedPrefix === 'all' || keyPrefix(image.key) === selectedPrefix;
    const matchesSearch =
      searchQuery === '' ||
      displayName(image.key).toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPrefix && matchesSearch;
  });

  // Sort images
  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.lastModified.getTime() - a.lastModified.getTime();
    } else if (sortBy === 'oldest') {
      return a.lastModified.getTime() - b.lastModified.getTime();
    } else if (sortBy === 'name_asc') {
      return displayName(a.key).localeCompare(displayName(b.key));
    } else if (sortBy === 'name_desc') {
      return displayName(b.key).localeCompare(displayName(a.key));
    } else if (sortBy === 'size_asc') {
      return a.size - b.size;
    } else if (sortBy === 'size_desc') {
      return b.size - a.size;
    }
    return 0;
  });

  const toggleImageSelection = (key: string) => {
    if (selectedKeys.includes(key)) {
      setSelectedKeys(selectedKeys.filter(k => k !== key));
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
  };

  const selectAllImages = () => {
    if (selectedKeys.length === sortedImages.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(sortedImages.map(image => image.key));
    }
  };

  const deleteSelectedImages = async () => {
    if (selectedKeys.length === 0) return;

    setIsDeleting(true);

    try {
      await Promise.all(
        selectedKeys.map(key =>
          fetch('/api/images', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key }),
          }).then(r => {
            if (!r.ok) console.error(`Error deleting ${key}: ${r.status}`);
          })
        )
      );

      setImages(images.filter(image => !selectedKeys.includes(image.key)));
      setSelectedKeys([]);
    } catch (err) {
      console.error('Error deleting images:', err);
      setError('Failed to delete one or more images. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
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
              onUploadComplete={(urls) => {
                console.log('Uploaded images:', urls);
                handleImageUpload();
              }}
              bucketName={selectedPrefix === 'all' ? 'artworks' : selectedPrefix}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="bucket" className="block text-sm font-medium text-gray-700 mb-1">
              Select Folder
            </label>
            <select
              id="bucket"
              value={selectedPrefix}
              onChange={(e) => setSelectedPrefix(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Folders</option>
              {buckets.map((bucket) => (
                <option key={bucket} value={bucket}>
                  {bucket.charAt(0).toUpperCase() + bucket.slice(1)}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Select a folder to organise your uploads.
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
            <label htmlFor="filter-bucket" className="sr-only">Filter by Folder</label>
            <select
              id="filter-bucket"
              value={selectedPrefix}
              onChange={(e) => setSelectedPrefix(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Folders</option>
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
      {selectedKeys.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-md flex justify-between items-center mb-4">
          <div className="text-sm text-gray-700">
            {selectedKeys.length} {selectedKeys.length === 1 ? 'image' : 'images'} selected
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
              {selectedKeys.length === sortedImages.length ? 'Deselect All' : 'Select All'}
            </button>
            <div className="text-sm text-gray-500">
              {sortedImages.length} {sortedImages.length === 1 ? 'image' : 'images'}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedImages.map((image) => (
              <div
                key={image.key}
                className={`group relative bg-white rounded-md border overflow-hidden ${
                  selectedKeys.includes(image.key) ? 'ring-2 ring-black' : ''
                }`}
              >
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(image.key)}
                    onChange={() => toggleImageSelection(image.key)}
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

                <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
                  <Image
                    src={image.url}
                    alt={displayName(image.key)}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="p-2">
                  <div className="text-sm font-medium text-gray-900 truncate" title={displayName(image.key)}>
                    {displayName(image.key)}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatFileSize(image.size)}</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded-full">
                      {keyPrefix(image.key)}
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
