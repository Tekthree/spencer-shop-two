"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  featured: boolean;
  cover_image: string | null;
  order: number | null;
  created_at: string;
}

// Form validation schema
const collectionSchema = z.object({
  name: z.string().min(1, { message: 'Collection name is required' }),
  description: z.string().optional(),
  order: z.union([
    z.number().int().nonnegative({ message: 'Order must be a non-negative number' }),
    z.literal('')
  ]),
  featured: z.boolean()
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

/**
 * Edit Collection Page
 * Allows admin to modify an existing collection
 */
export default function EditCollection({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [artworkCount, setArtworkCount] = useState(0);
  
  // Form validation with react-hook-form and zod
  const { 
    register, 
    handleSubmit, 
    setValue, 
    formState: { errors },
    reset
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: '',
      description: '',
      order: '',
      featured: false
    }
  });

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
        // Set form values
        reset({
          name: data.name,
          description: data.description || '',
          order: data.order !== null ? data.order : '',
          featured: data.featured
        });
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
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching collection:', err);
        setError(err.message || 'Failed to load collection');
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id, reset]);

  /**
   * Handle image upload to Supabase storage
   */
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`; // Store directly in the collections bucket root

      const { error: uploadError } = await supabase.storage
        .from('collections') // Use the collections bucket, not images
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('collections') // Use the collections bucket here too
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image');
      return null;
    }
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CollectionFormValues) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare update data
      const updateData: any = {
        name: data.name,
        description: data.description || null,
        featured: data.featured,
        order: data.order === '' ? null : Number(data.order)
      };

      // Handle image upload if needed
      if (coverImage) {
        const newImageUrl = await uploadImage(coverImage);
        if (!newImageUrl) {
          throw new Error('Failed to upload image');
        }
        updateData.cover_image = newImageUrl;
      } else if (coverImagePreview === null && collection?.cover_image) {
        // If the preview is null but there was an image before, set to null in DB
        updateData.cover_image = null;
      }

      // Update the collection
      const { error: updateError } = await supabase
        .from('collections')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Show success message
      setSuccess('Collection updated successfully!');
      setSaving(false);
      
      // Wait 1.5 seconds before redirecting
      setTimeout(() => {
        router.push('/admin/collections');
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the collection');
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

    try {
      setSaving(true);
      setError(null);

      // Check if collection has artworks
      if (artworkCount > 0) {
        throw new Error(`Cannot delete collection with ${artworkCount} artworks. Please remove or reassign artworks first.`);
      }

      // Delete the collection
      const { error: deleteError } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Redirect to collections list
      router.push('/admin/collections');
    } catch (err: any) {
      console.error('Error deleting collection:', err);
      setError(err.message || 'Failed to delete collection');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
        <Link href="/admin/collections" className="text-black hover:underline">
          &larr; Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Collection</h1>
          <p className="mt-2 text-sm text-gray-500">
            This collection contains {artworkCount} artwork{artworkCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/collections"
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Collections
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Name field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Collection Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className={`mt-1 block w-full border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black focus:border-black'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Description field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  {...register('description')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Brief description of the collection
                </p>
              </div>

              {/* Order field */}
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                  Display Order
                </label>
                <input
                  type="number"
                  id="order"
                  min="0"
                  {...register('order')}
                  className={`mt-1 block w-full border ${errors.order ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black focus:border-black'} rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                />
                {errors.order && (
                  <p className="mt-1 text-sm text-red-600">{errors.order.message}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Lower numbers appear first. Leave blank for alphabetical ordering.
                </p>
              </div>

              {/* Featured checkbox */}
              <div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="featured"
                      type="checkbox"
                      {...register('featured')}
                      className="focus:ring-black h-4 w-4 text-black border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="featured" className="font-medium text-gray-700">
                      Featured Collection
                    </label>
                    <p className="text-gray-500">
                      Featured collections are highlighted on the homepage and collection pages
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover image */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cover Image
                </label>
                <div className="mt-1 flex items-center">
                  {coverImagePreview && (
                    <div className="relative w-32 h-32 mr-4 border border-gray-300 rounded-md overflow-hidden">
                      <Image
                        src={coverImagePreview}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    id="cover-image"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCoverImage(file);
                        setCoverImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <label
                    htmlFor="cover-image"
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
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Recommended: Square image, at least 800×800 pixels
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={artworkCount > 0 || saving}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${artworkCount > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'} disabled:opacity-50`}
          >
            {artworkCount > 0 ? 'Cannot Delete (Has Artworks)' : 'Delete Collection'}
          </button>
          
          <div className="flex">
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
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
