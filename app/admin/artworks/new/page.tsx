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

/**
 * Add New Artwork page
 * Form for creating a new art print with details and images
 */
export default function NewArtwork() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [medium, setMedium] = useState('');
  const [collectionId, setCollectionId] = useState<string>('');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<{url: string, alt: string, type?: string}[]>([]);
  const [sizes, setSizes] = useState<SizeOption[]>([
    { size: 'Small', price: 17500, edition_limit: 50, editions_sold: 0 },
    { size: 'Medium', price: 25000, edition_limit: 30, editions_sold: 0 },
    { size: 'Large', price: 35000, edition_limit: 20, editions_sold: 0 },
  ]);

  // Fetch collections for dropdown
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const { data, error } = await supabase
          .from('collections')
          .select('id, name')
          .order('name');

        if (error) {
          throw error;
        }

        setCollections(data || []);
      } catch (err) {
        console.error('Error fetching collections:', err);
      }
    };

    fetchCollections();
  }, []);

  // Handle image upload completion
  const handleImageUpload = (urls: string[]) => {
    const newImages = urls.map((url, index) => ({
      url,
      alt: title,
      type: images.length === 0 && index === 0 ? 'main' : undefined
    }));
    setImages([...images, ...newImages]);
  };

  // Handle image alt text change
  const handleImageAltChange = (index: number, alt: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], alt };
    setImages(updatedImages);
  };

  // Handle image type change
  const handleImageTypeChange = (index: number, type: string | undefined) => {
    const updatedImages = [...images];
    
    // If setting to 'main', remove 'main' from any other image
    if (type === 'main') {
      updatedImages.forEach((img, i) => {
        if (i !== index && img.type === 'main') {
          updatedImages[i] = { ...updatedImages[i], type: undefined };
        }
      });
    }
    
    updatedImages[index] = { ...updatedImages[index], type };
    setImages(updatedImages);
  };

  // Remove an image
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    const wasMain = images[index].type === 'main';
    updatedImages.splice(index, 1);
    
    // If we removed the main image and have other images, set the first one as main
    if (wasMain && updatedImages.length > 0) {
      updatedImages[0] = { ...updatedImages[0], type: 'main' };
    }
    
    setImages(updatedImages);
  };

  // This function is replaced by handleRemoveImage

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
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (!title) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (images.length === 0) {
      setError('At least one image is required');
      setLoading(false);
      return;
    }

    if (sizes.length === 0) {
      setError('At least one size option is required');
      setLoading(false);
      return;
    }

    // Validate sizes
    for (const size of sizes) {
      if (!size.size) {
        setError('All size options must have a name');
        setLoading(false);
        return;
      }
      if (size.price <= 0) {
        setError('All size options must have a price greater than 0');
        setLoading(false);
        return;
      }
      if (size.edition_limit <= 0) {
        setError('All size options must have an edition limit greater than 0');
        setLoading(false);
        return;
      }
      if (size.editions_sold < 0) {
        setError('Editions sold cannot be negative');
        setLoading(false);
        return;
      }
      if (size.editions_sold > size.edition_limit) {
        setError('Editions sold cannot exceed edition limit');
        setLoading(false);
        return;
      }
    }

    try {
      // Create artwork in database
      const { data, error } = await supabase
        .from('artworks')
        .insert([
          {
            title,
            description,
            year,
            medium,
            collection_id: collectionId || null,
            featured,
            images,
            sizes,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      setSuccess(true);
      
      // Reset form after successful submission
      if (data) {
        setTimeout(() => {
          router.push(`/admin/artworks/${data[0].id}`);
        }, 1500);
      } else {
        setTimeout(() => {
          router.push('/admin/artworks');
        }, 1500);
      }
    } catch (err) {
      console.error('Error creating artwork:', err);
      setError('Failed to create artwork. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center mb-2">
          <Link href="/admin/artworks" className="text-gray-500 hover:text-black mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="text-3xl font-serif">Add New Artwork</h1>
        </div>
        <p className="text-gray-600">Create a new art print with details and images</p>
      </header>

      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          Artwork created successfully! Redirecting...
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h2 className="text-xl font-serif mb-6">Artwork Details</h2>
          
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  id="year"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
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
                  placeholder="e.g., Digital Print on Fine Art Paper"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Featured on homepage
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Artwork Images</h2>
          <p className="text-sm text-gray-500 mb-4">
            Upload images of the artwork. The main image will be displayed as the primary image on all pages.
            Hover images will be shown when a user hovers over the main image in product cards.
          </p>
          
          <ImageUploader
            bucketName="artworks"
            onUploadComplete={handleImageUpload}
            className="mb-4"
          />
          
          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="border rounded-md p-4 relative">
                  <div className="relative h-40 mb-2">
                    <Image
                      src={image.url}
                      alt={image.alt || 'Artwork image'}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  
                  <div className="mb-2">
                    <label htmlFor={`alt-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      id={`alt-${index}`}
                      value={image.alt || ''}
                      onChange={(e) => handleImageAltChange(index, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Describe the image"
                    />
                  </div>
                  
                  <div className="mb-2">
                    <label htmlFor={`type-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Image Type
                    </label>
                    <select
                      id={`type-${index}`}
                      value={image.type || ''}
                      onChange={(e) => handleImageTypeChange(index, e.target.value || undefined)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">Regular Image</option>
                      <option value="main">Main Image</option>
                      <option value="hover">Hover Image</option>
                    </select>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  {image.type === 'main' && (
                    <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                      Main
                    </div>
                  )}
                  
                  {image.type === 'hover' && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Hover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Size Options */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif">Size Options & Editions</h2>
            <button
              type="button"
              onClick={addSize}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Size
            </button>
          </div>

          {sizes.map((size, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-100 rounded-md mb-4">
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
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Link
            href="/admin/artworks"
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Artwork'}
          </button>
        </div>
      </form>
    </div>
  );
}
