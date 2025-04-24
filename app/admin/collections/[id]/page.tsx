"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  featured: boolean;
  cover_image: string | null;
  order: number | null;
  created_at: string;
}

/**
 * Edit Collection Page
 * Allows admin to modify an existing collection
 */
export default function EditCollection({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number | ''>('');
  const [featured, setFeatured] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artworkCount, setArtworkCount] = useState(0);

  /**
   * Fetch collection data on component mount
   */
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        // Fetch collection data
        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error('Collection not found');
        }

        setCollection(data);
        setName(data.name);
        setDescription(data.description || '');
        setOrder(data.order !== null ? data.order : '');
        setFeatured(data.featured);
        setCoverImagePreview(data.cover_image);

        // Count artworks in this collection
        const { data: artworksData, error: artworksError } = await supabase
          .from('artworks')
          .select('id')
          .eq('collection_id', id);

        if (artworksError) {
          throw artworksError;
        }

        setArtworkCount(artworksData?.length || 0);
      } catch (err: any) {
        console.error('Error fetching collection:', err);
        setError(err.message || 'Failed to load collection data');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id]);

  /**
   * Handle cover image selection
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
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
   * Upload image to Supabase storage
   */
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('collections')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('collections')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Upload cover image if a new one was selected
      let coverImageUrl = collection?.cover_image || null;
      if (coverImage) {
        const newImageUrl = await uploadImage(coverImage);
        if (!newImageUrl) {
          throw new Error('Failed to upload cover image');
        }
        coverImageUrl = newImageUrl;
      }

      // Update collection in database
      const { error: updateError } = await supabase
        .from('collections')
        .update({
          name,
          description: description || null,
          order: order !== '' ? Number(order) : null,
          featured,
          cover_image: coverImageUrl
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Redirect to collections list
      router.push('/admin/collections');
      router.refresh();
    } catch (err: any) {
      console.error('Error updating collection:', err);
      setError(err.message || 'Failed to update collection. Please try again.');
      setSaving(false);
    }
  };

  /**
   * Handle collection deletion
   */
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    if (artworkCount > 0) {
      if (!window.confirm(`This collection contains ${artworkCount} artworks. Deleting it will remove the collection association from these artworks. Continue?`)) {
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      // First update any artworks to remove the collection_id
      if (artworkCount > 0) {
        const { error: artworksError } = await supabase
          .from('artworks')
          .update({ collection_id: null })
          .eq('collection_id', id);

        if (artworksError) {
          throw artworksError;
        }
      }

      // Then delete the collection
      const { error: deleteError } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Redirect to collections list
      router.push('/admin/collections');
      router.refresh();
    } catch (err: any) {
      console.error('Error deleting collection:', err);
      setError(err.message || 'Failed to delete collection. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !collection) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
        <Link
          href="/admin/collections"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
        >
          Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif">Edit Collection</h1>
            <p className="text-gray-600 mt-1">
              {artworkCount} {artworkCount === 1 ? 'artwork' : 'artworks'} in this collection
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              Delete
            </button>
            <Link
              href="/admin/collections"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Cancel
            </Link>
          </div>
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
              <div className="flex-shrink-0 h-24 w-24 border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                {coverImagePreview ? (
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="h-24 w-24 object-cover"
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
                  {coverImagePreview ? 'Change Image' : 'Select Image'}
                </label>
                {coverImagePreview && (
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
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
