"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { supabase } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/image-uploader';
import Link from 'next/link';
import Image from 'next/image';

interface SizeOption {
  size: string;
  price: number;
  edition_limit: number;
  editions_sold: number;
}

interface Collection {
  id: string;
  name: string;
}

interface Artwork {
  id: string;
  title: string;
  description: string;
  year: number;
  medium: string;
  collection_id: string | null;
  featured: boolean;
  images: { url: string, alt: string }[];
  sizes: SizeOption[];
  created_at: string;
}

/**
 * Edit Artwork Page
 * Allows admin to modify an existing artwork's details and images
 */
type PageParams = {
  id: string;
};

export default function EditArtwork({ params }: { params: PageParams }) {
  const router = useRouter();
  // Properly unwrap params using React.use() as recommended by Next.js
  const resolvedParams = use(params as unknown as Promise<PageParams>);
  const { id } = resolvedParams;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  // State to store the original artwork data for reference - used in the fetchData function
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [medium, setMedium] = useState('');
  const [collectionId, setCollectionId] = useState<string>('');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<{url: string, alt: string}[]>([]);
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  // Fetch artwork data and collections on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch artwork data
        const { data: artworkData, error: artworkError } = await supabase
          .from('artworks')
          .select('*')
          .eq('id', id)
          .single();

        if (artworkError) {
          throw artworkError;
        }

        if (!artworkData) {
          throw new Error('Artwork not found');
        }

        setArtwork(artworkData);
        
        // Set form state
        setTitle(artworkData.title);
        setDescription(artworkData.description || '');
        setYear(artworkData.year);
        setMedium(artworkData.medium || '');
        setCollectionId(artworkData.collection_id || '');
        setFeatured(artworkData.featured);
        setImages(artworkData.images || []);
        setSizes(artworkData.sizes || []);

        // Fetch collections for dropdown
        const { data: collectionsData, error: collectionsError } = await supabase
          .from('collections')
          .select('id, name')
          .order('name');

        if (collectionsError) {
          throw collectionsError;
        }

        setCollections(collectionsData || []);
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load artwork data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle image upload
  const handleImageUpload = (urls: string[]) => {
    const newImages = urls.map(url => ({ url, alt: title }));
    setImages([...images, ...newImages]);
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Update image alt text
  const updateImageAlt = (index: number, alt: string) => {
    const newImages = [...images];
    newImages[index].alt = alt;
    setImages(newImages);
  };

  // Update size option
  const updateSize = (index: number, field: keyof SizeOption, value: string | number) => {
    const newSizes = [...sizes];
    
    // Convert string values to numbers for numeric fields
    if (field === 'price' || field === 'edition_limit' || field === 'editions_sold') {
      newSizes[index][field] = Number(value);
    } else {
      // @ts-expect-error - TypeScript doesn't know we're only setting string fields with string values
      newSizes[index][field] = value;
    }
    
    setSizes(newSizes);
  };

  // Add new size option
  const addSize = () => {
    setSizes([...sizes, { size: '', price: 0, edition_limit: 0, editions_sold: 0 }]);
  };

  // Remove size option
  const removeSize = (index: number) => {
    const newSizes = [...sizes];
    newSizes.splice(index, 1);
    setSizes(newSizes);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (!title) {
      setError('Title is required');
      setSaving(false);
      return;
    }

    if (images.length === 0) {
      setError('At least one image is required');
      setSaving(false);
      return;
    }

    if (sizes.length === 0) {
      setError('At least one size option is required');
      setSaving(false);
      return;
    }

    // Validate sizes
    for (const size of sizes) {
      if (!size.size) {
        setError('All size options must have a name');
        setSaving(false);
        return;
      }
      if (size.price <= 0) {
        setError('All size options must have a price greater than 0');
        setSaving(false);
        return;
      }
      if (size.edition_limit <= 0) {
        setError('All size options must have an edition limit greater than 0');
        setSaving(false);
        return;
      }
      if (size.editions_sold < 0 || size.editions_sold > size.edition_limit) {
        setError('Editions sold must be between 0 and the edition limit');
        setSaving(false);
        return;
      }
    }

    try {
      // Update artwork in Supabase
      const { error: updateError } = await supabase
        .from('artworks')
        .update({
          title,
          description,
          year,
          medium,
          collection_id: collectionId || null,
          featured,
          images,
          sizes
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error updating artwork:', error);
      setError(error.message || 'Failed to update artwork');
    } finally {
      setSaving(false);
    }
  };

  // Handle artwork deletion
  const handleDelete = async () => {
    if (!deleteConfirmation) {
      setDeleteConfirmation(true);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Check if there are any orders with this artwork
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .like('items', `%${id}%`)
        .limit(1);

      if (ordersError) {
        throw ordersError;
      }

      if (orders && orders.length > 0) {
        throw new Error('Cannot delete artwork that has been ordered');
      }

      // Delete artwork
      const { error: deleteError } = await supabase
        .from('artworks')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Redirect to artworks list
      router.push('/admin/artworks');
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error deleting artwork:', error);
      setError(error.message || 'Failed to delete artwork');
      setDeleteConfirmation(false);
    } finally {
      setSaving(false);
    }
  };

  // Cancel delete confirmation
  const cancelDelete = () => {
    setDeleteConfirmation(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Edit Artwork</h1>
        <p className="text-gray-600">Update artwork details and manage editions</p>
      </header>

      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          Artwork updated successfully!
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmation && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Are you sure you want to delete this artwork?</p>
          <p className="mt-1">This action cannot be undone.</p>
          <div className="mt-3 flex space-x-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {saving ? 'Deleting...' : 'Confirm Delete'}
            </button>
            <button
              type="button"
              onClick={cancelDelete}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        {/* Basic Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium border-b pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Title */}
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <input
                type="number"
                id="year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1900}
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>

            {/* Medium */}
            <div>
              <label htmlFor="medium" className="block text-sm font-medium text-gray-700 mb-1">
                Medium
              </label>
              <input
                type="text"
                id="medium"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="e.g., Digital, Acrylic on canvas"
              />
            </div>

            {/* Collection */}
            <div>
              <label htmlFor="collection" className="block text-sm font-medium text-gray-700 mb-1">
                Collection
              </label>
              <select
                id="collection"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">None</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured */}
            <div>
              <div className="flex items-center h-full">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Feature this artwork on the home page
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium border-b pb-2">Images</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Artwork Images *
            </label>
            
            {/* Current images */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={image.url}
                        alt={image.alt}
                        className="object-cover w-full h-full"
                        width={200}
                        height={200}
                      />
                    </div>
                    <div className="mt-1">
                      <input
                        type="text"
                        value={image.alt}
                        onChange={(e) => updateImageAlt(index, e.target.value)}
                        className="w-full text-xs px-2 py-1 border border-gray-300 rounded-md"
                        placeholder="Alt text"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Image uploader */}
            <ImageUploader
              bucket="artworks"
              onUpload={handleImageUpload}
            />
            
            <p className="mt-2 text-sm text-gray-500">
              Upload high-quality images of your artwork. First image will be used as the main image.
            </p>
          </div>
        </div>

        {/* Size Options */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-medium">Size Options</h2>
            <button
              type="button"
              onClick={addSize}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Size
            </button>
          </div>
          
          <div className="space-y-4">
            {sizes.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded-md">
                <p className="text-gray-500">No size options yet. Add a size to continue.</p>
                <button
                  type="button"
                  onClick={addSize}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Size
                </button>
              </div>
            ) : (
              sizes.map((size, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size Name *
                    </label>
                    <input
                      type="text"
                      value={size.size}
                      onChange={(e) => updateSize(index, 'size', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="e.g., Small, A4, 8x10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (in cents) *
                    </label>
                    <input
                      type="number"
                      value={size.price}
                      onChange={(e) => updateSize(index, 'price', e.target.value)}
                      min={0}
                      step={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="e.g., 17500 for $175.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Edition Limit *
                    </label>
                    <input
                      type="number"
                      value={size.edition_limit}
                      onChange={(e) => updateSize(index, 'edition_limit', e.target.value)}
                      min={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Editions Sold
                      </label>
                      <input
                        type="number"
                        value={size.editions_sold}
                        onChange={(e) => updateSize(index, 'editions_sold', e.target.value)}
                        min={0}
                        max={size.edition_limit}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    {sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="ml-2 p-2 text-gray-400 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setDeleteConfirmation(true)}
            className="px-4 py-2 border border-red-300 rounded-md text-red-700 bg-white hover:bg-red-50"
          >
            Delete Artwork
          </button>
          
          <div className="flex space-x-4">
            <Link
              href="/admin/artworks"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}