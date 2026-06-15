"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

/**
 * New Collection Page
 * Allows admin to create a new collection
 */
export default function NewCollection() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number | ''>('');
  const [featured, setFeatured] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle cover image selection
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setCoverImage(null);
      setCoverImagePreview(null);
      return;
    }

    const file = e.target.files[0];
    setCoverImage(file);

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Upload image to R2 via /api/upload
   */
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prefix', 'collections');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Upload failed: ${res.status}`);
      }

      const { url } = await res.json() as { url: string };
      return url;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error uploading image';
      console.error('Error uploading image:', error);
      setError(errorMessage);
      return null;
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload cover image if selected
      let coverImageUrl = null;
      if (coverImage) {
        coverImageUrl = await uploadImage(coverImage);
        if (!coverImageUrl) {
          throw new Error('Failed to upload cover image');
        }
      }

      // Create collection in database
      const response = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          order: order !== '' ? Number(order) : null,
          featured,
          cover_image: coverImageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create collection');
      }

      // Redirect to collections list
      router.push('/admin/collections');
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create collection. Please try again.';
      console.error('Error creating collection:', err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif">New Collection</h1>
          <Link
            href="/admin/collections"
            className="text-gray-600 hover:text-black transition-colors"
          >
            Cancel
          </Link>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Collection Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Display Order */}
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              id="order"
              value={order}
              onChange={(e) => setOrder(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              min="0"
              placeholder="Lower numbers display first"
            />
            <p className="mt-1 text-sm text-gray-500">
              Collections are sorted by this number, then alphabetically. Lower numbers appear first.
            </p>
          </div>

          {/* Featured */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Feature this collection on the home page
              </label>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="flex-shrink-0 h-24 w-24 border border-gray-200 rounded-md overflow-hidden bg-gray-50 relative">
                {coverImagePreview ? (
                  <Image
                    src={coverImagePreview}
                    alt="Cover preview"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="coverImage"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="sr-only"
                />
                <label
                  htmlFor="coverImage"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black cursor-pointer"
                >
                  Select Image
                </label>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setCoverImagePreview(null);
                    }}
                    className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Remove
                  </button>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Recommended: Square image, at least 800×800 pixels
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="/admin/collections"
            className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Collection'}
          </button>
        </div>
      </form>
    </div>
  );
}
