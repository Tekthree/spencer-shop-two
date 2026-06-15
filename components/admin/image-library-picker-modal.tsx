"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import type { R2Image } from '@/lib/storage/r2';

interface ImageLibraryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: R2Image) => void;
  /**
   * Key prefixes to load (analogous to the old bucket names).
   * Each prefix is fetched as a separate /api/images?prefix=... request.
   */
  buckets?: string[];
  /** Prefix to highlight by default */
  initialBucket?: string;
}

const DEFAULT_BUCKETS = ['artworks', 'about', 'collections'];

/**
 * Lightweight modal that mirrors the media library so editors can reuse existing assets.
 * Now backed by R2 instead of Supabase Storage.
 */
export default function ImageLibraryPickerModal({
  isOpen,
  onClose,
  onSelect,
  buckets = DEFAULT_BUCKETS,
  initialBucket = 'about',
}: ImageLibraryPickerModalProps) {
  const [images, setImages] = useState<R2Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrefix, setSelectedPrefix] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results: R2Image[] = [];

      if (selectedPrefix === 'all') {
        // Fetch all prefixes in parallel
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
            console.error(`Error fetching prefix ${buckets[i]}:`, result.reason);
          }
        });
      } else {
        const data = await fetch(`/api/images?prefix=${encodeURIComponent(selectedPrefix)}`)
          .then(r => r.json() as Promise<R2Image[]>);
        if (Array.isArray(data)) {
          results.push(...data);
        }
      }

      setImages(results);
    } catch (err) {
      console.error('Error loading images from library:', err);
      setError('Unable to load images. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [buckets, selectedPrefix]);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedPrefix(initialBucket ?? 'all');
  }, [isOpen, initialBucket]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    loadImages().catch((err) => {
      if (!isMounted) return;
      console.error('Unexpected error loading images:', err);
      setError('Unable to load images. Please try again.');
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, loadImages]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  /** Derive a short display name from the R2 key (last path segment, no extension). */
  const displayName = (key: string) => key.split('/').pop() ?? key;

  /** Derive the prefix (first path segment) from the key. */
  const keyPrefix = (key: string) => key.split('/')[0] ?? '';

  const filteredImages = useMemo(() => {
    return images.filter((image) => {
      const matchesPrefix = selectedPrefix === 'all' || keyPrefix(image.key) === selectedPrefix;
      const name = displayName(image.key);
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        name.toLowerCase().includes(searchQuery.trim().toLowerCase());

      return matchesPrefix && matchesSearch;
    });
  }, [images, searchQuery, selectedPrefix]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex w-full max-w-5xl max-h-full flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold">Select Image</h2>
            <p className="text-sm text-gray-500">Choose an existing image from the media library.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
            aria-label="Close image library"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="bucket-filter" className="sr-only">
                Filter by prefix
              </label>
              <select
                id="bucket-filter"
                value={selectedPrefix}
                onChange={(event) => setSelectedPrefix(event.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">All</option>
                {buckets.map((bucket) => (
                  <option key={bucket} value={bucket}>
                    {bucket.charAt(0).toUpperCase() + bucket.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <label htmlFor="image-search" className="sr-only">
                Search images
              </label>
              <input
                id="image-search"
                type="search"
                placeholder="Search images"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>

          {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-square w-full rounded-md bg-gray-200" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-8 text-center">
              <h3 className="text-base font-medium text-gray-900">No images found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try a different search term or choose another folder.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredImages.map((image) => (
                <button
                  key={image.key}
                  type="button"
                  onClick={() => {
                    onSelect(image);
                    onClose();
                  }}
                  className="group relative overflow-hidden rounded-md border border-gray-200 text-left transition hover:border-black hover:shadow"
                >
                  <div className="relative aspect-square w-full bg-gray-100">
                    <Image
                      src={image.url}
                      alt={displayName(image.key)}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between px-2 py-2 text-xs text-gray-600">
                    <span className="truncate" title={displayName(image.key)}>
                      {displayName(image.key)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">
                      {keyPrefix(image.key)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <footer className="flex justify-end border-t border-gray-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}
