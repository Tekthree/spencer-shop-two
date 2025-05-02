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
 * Edit Collection Client Component
 * Allows admin to modify an existing collection
 */
export default function EditCollectionClient({ id }: { id: string }) {
  const router = useRouter();

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
    async function fetchCollection() {
      try {
        setLoading(true);
        
        // Fetch collection details
        const { data: collectionData, error: collectionError } = await supabase
          .from('collections')
          .select('*')
          .eq('id', id)
          .single();
        
        if (collectionError) throw collectionError;
        if (!collectionData) throw new Error('Collection not found');
        
        setCollection(collectionData);
        
        // Set form values
        reset({
          name: collectionData.name,
          description: collectionData.description || '',
          order: collectionData.order !== null ? collectionData.order : '',
          featured: collectionData.featured
        });
        
        // Set cover image preview if exists
        if (collectionData.cover_image) {
          setCoverImagePreview(collectionData.cover_image);
        }
        
        // Count artworks in this collection
        const { count, error: countError } = await supabase
          .from('artworks')
          .select('*', { count: 'exact', head: true })
          .eq('collection_id', id);
        
        if (countError) throw countError;
        setArtworkCount(count || 0);
        
      } catch (err) {
        console.error('Error fetching collection:', err);
        setError('Failed to load collection data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCollection();
  }, [id, reset]);

  /**
   * Handle file input change for cover image
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCoverImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Define interface for collection update data
   */
  interface CollectionUpdateData {
    name: string;
    description: string | null;
    featured: boolean;
    order: number | null;
    cover_image?: string;
  }

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CollectionFormValues) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Prepare update data
      const updateData: CollectionUpdateData = {
        name: data.name,
        description: data.description || null,
        featured: data.featured,
        order: data.order === '' ? null : Number(data.order)
      };
      
      // Handle image upload if new image selected
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `collections/${fileName}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, coverImage);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        updateData.cover_image = publicUrlData.publicUrl;
      }
      
      // Update collection in database
      const { error: updateError } = await supabase
        .from('collections')
        .update(updateData)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      setSuccess('Collection updated successfully');
      
      // Refresh collection data
      const { data: refreshedData, error: refreshError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!refreshError && refreshedData) {
        setCollection(refreshedData);
      }
      
    } catch (err) {
      console.error('Error updating collection:', err);
      setError('Failed to update collection');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle collection deletion
   */
  const handleDelete = async () => {
    // Prevent deletion if collection has artworks
    if (artworkCount > 0) {
      setError('Cannot delete collection with artworks. Remove artworks first.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Delete collection from database
      const { error: deleteError } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Redirect to collections list
      router.push('/admin/collections');
      
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError('Failed to delete collection');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Edit Collection</h1>
        <p className="text-gray-600">Update collection details or manage artworks</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Collection Name*
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                id="order"
                type="number"
                min="0"
                {...register('order')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              />
              {errors.order && (
                <p className="mt-1 text-sm text-red-600">{errors.order.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">Lower numbers appear first (0 is highest priority)</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  id="featured"
                  type="checkbox"
                  {...register('featured')}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Featured Collection
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">Featured collections appear on the homepage</p>
            </div>
          </div>
          
          <div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image
              </label>
              
              {coverImagePreview ? (
                <div className="mb-4">
                  <div className="relative w-full aspect-[3/2] bg-gray-100 rounded-md overflow-hidden">
                    <Image 
                      src={coverImagePreview} 
                      alt="Collection cover" 
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-4 w-full aspect-[3/2] bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">No cover image</p>
                </div>
              )}
              
              <label className="block w-full">
                <span className="sr-only">Choose file</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-black file:text-white
                    hover:file:bg-gray-800
                  "
                />
              </label>
              <p className="mt-1 text-sm text-gray-500">Recommended: 1200 × 800 pixels</p>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Collection Statistics</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{artworkCount}</span> artworks in this collection
              </p>
              
              {collection && (
                <div className="mt-4">
                  <Link
                    href={`/admin/artworks?collection=${collection.id}`}
                    className="text-sm text-black hover:underline"
                  >
                    Manage artworks in this collection →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-5 border-t border-gray-200 mt-8 flex justify-between">
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