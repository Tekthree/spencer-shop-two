"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

// Define image type for better type safety
type ImageType = 'main' | 'hover' | 'detail' | undefined;

interface ArtworkImage {
  url: string;
  alt: string;
  type?: ImageType;
}

interface Artwork {
  id: string;
  title: string;
  description: string;
  year: number;
  medium: string;
  collection_id: string | null;
  featured: boolean;
  images: ArtworkImage[];
  sizes: SizeOption[];
  created_at: string;
}

/**
 * Edit Artwork Client Component
 * Allows admin to modify an existing artwork's details and images
 */
export default function EditArtworkClient({ id }: { id: string }) {
  const router = useRouter();

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
  const [images, setImages] = useState<ArtworkImage[]>([]);
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

  // Handle image upload completion
  const handleImageUpload = (urls: string[]) => {
    // Create new images with proper typing
    const newImages: ArtworkImage[] = urls.map((url, index) => ({
      url,
      alt: artwork?.title || '',  // Ensure alt is always a string, never undefined
      type: (!artwork?.images || artwork.images.length === 0) && index === 0 ? 'main' : undefined
    }));
    
    // Combine existing and new images with proper typing
    const updatedImages: ArtworkImage[] = [
      ...images,
      ...newImages
    ];
    
    setImages(updatedImages);
  };

  // Handle image alt text change
  const handleImageAltChange = (index: number, alt: string) => {
    const updatedImages = [...images];
    updatedImages[index].alt = alt;
    setImages(updatedImages);
  };

  // Handle image type change
  const handleImageTypeChange = (index: number, type: ImageType) => {
    // If setting a new main image, remove main from all other images
    if (type === 'main') {
      // Use type assertion to ensure TypeScript understands this is an ArtworkImage[]
      const updatedImages: ArtworkImage[] = images.map(img => ({
        ...img,
        type: undefined as ImageType
      }));
      updatedImages[index].type = 'main';
      setImages(updatedImages);
    } else {
      // Use type assertion to ensure TypeScript understands this is an ArtworkImage[]
      const updatedImages: ArtworkImage[] = [...images];
      updatedImages[index].type = type;
      setImages(updatedImages);
    }
  };

  // Remove an image
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    const removedImage = updatedImages.splice(index, 1)[0];
    
    // If removing the main image, set the first remaining image as main
    if (removedImage.type === 'main' && updatedImages.length > 0) {
      updatedImages[0].type = 'main' as ImageType;
    }
    
    setImages(updatedImages);
  };

  // Update size option
  const updateSize = (index: number, field: keyof SizeOption, value: string | number) => {
    const updatedSizes = [...sizes];
    
    // Convert string values to numbers for numeric fields
    if (field === 'price' || field === 'edition_limit' || field === 'editions_sold') {
      updatedSizes[index][field] = Number(value);
    } else {
      updatedSizes[index][field] = value as string;
    }
    
    setSizes(updatedSizes);
  };

  // Add new size option
  const addSize = () => {
    setSizes([...sizes, { size: '', price: 0, edition_limit: 1, editions_sold: 0 }]);
  };

  // Remove size option
  const removeSize = (index: number) => {
    const updatedSizes = [...sizes];
    updatedSizes.splice(index, 1);
    setSizes(updatedSizes);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Validate form
      if (!title) {
        throw new Error('Title is required');
      }
      
      if (images.length === 0) {
        throw new Error('At least one image is required');
      }
      
      if (sizes.length === 0) {
        throw new Error('At least one size option is required');
      }
      
      // Validate that there is a main image
      const mainImage = images.find(img => img.type === 'main');
      if (!mainImage) {
        // If no main image is set, set the first image as main
        const updatedImages = [...images];
        updatedImages[0] = { ...updatedImages[0], type: 'main' as const };
        setImages(updatedImages);
      }
      
      // Validate size options
      for (const size of sizes) {
        if (!size.size) {
          throw new Error('Size name is required for all size options');
        }
        if (size.price < 0) {
          throw new Error('Price cannot be negative');
        }
        if (size.edition_limit < 1) {
          throw new Error('Edition limit must be at least 1');
        }
        if (size.editions_sold < 0) {
          throw new Error('Editions sold cannot be negative');
        }
        if (size.editions_sold > size.edition_limit) {
          throw new Error('Editions sold cannot exceed edition limit');
        }
      }
      
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
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/artworks');
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error updating artwork:', error);
      setError(error.message || 'Failed to update artwork. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle artwork deletion
  const handleDelete = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // First check if the artwork has any sold editions
      let hasSoldEditions = false;
      for (const size of sizes) {
        if (size.editions_sold > 0) {
          hasSoldEditions = true;
          break;
        }
      }
      
      if (hasSoldEditions) {
        throw new Error('Cannot delete artwork with sold editions. This would affect order history.');
      }
      
      // Delete artwork from Supabase
      const { error: deleteError } = await supabase
        .from('artworks')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Redirect to artworks list
      router.push('/admin/artworks');
      router.refresh();
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error deleting artwork:', error);
      setError(error.message || 'Failed to delete artwork. Please try again.');
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
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !artwork) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Link href="/admin/artworks" className="mt-2 inline-block text-sm underline">
            Back to Artworks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif">Edit Artwork</h1>
          <Link
            href="/admin/artworks"
            className="text-gray-600 hover:text-black transition-colors"
          >
            Cancel
          </Link>
        </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-medium mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this artwork? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete Artwork'}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-medium mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
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
            
            <div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  id="year"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min={1900}
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              
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
                  placeholder="e.g., Digital Print, Giclee, etc."
                />
              </div>
              
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
            </div>
            
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
                  Feature this artwork on the home page
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-medium mb-4">Images</h2>
          
          <div className="mb-6">
            <ImageUploader 
              onUploadComplete={handleImageUpload}
              bucketName="artworks"
            />
          </div>
          
          {images.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Images</h3>
              <p className="text-xs text-gray-500 mb-4">
                Set one image as the main image. This will be used as the primary display image.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-3">
                    <div className="aspect-square w-full overflow-hidden bg-gray-100 mb-3 relative">
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={image.alt}
                          onChange={(e) => handleImageAltChange(index, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Image Type
                        </label>
                        <select
                          value={image.type || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Cast the value to ImageType or undefined
                            const imageType = value === '' ? undefined : 
                                              value === 'main' ? 'main' : 
                                              value === 'hover' ? 'hover' : 
                                              value === 'detail' ? 'detail' : undefined;
                            handleImageTypeChange(index, imageType);
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        >
                          <option value="">None</option>
                          <option value="main">Main</option>
                          <option value="hover">Hover</option>
                          <option value="detail">Detail</option>
                        </select>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="w-full px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Size Options */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Size Options</h2>
            <button
              type="button"
              onClick={addSize}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Size
            </button>
          </div>
          
          <div className="space-y-4">
            {sizes.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No size options added yet. Click &quot;Add Size&quot; to create your first size option.</p>
              </div>
            ) : (
              sizes.map((size, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size Name *
                    </label>
                    <input
                      type="text"
                      value={size.size}
                      onChange={(e) => updateSize(index, 'size', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="e.g., 8x10, Small, etc."
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
