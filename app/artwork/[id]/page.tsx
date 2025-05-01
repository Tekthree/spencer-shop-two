"use client";

import { useState, useEffect } from 'react';
import { use } from 'react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
// No need for useRouter here
import RelatedArtworks from '@/components/artwork/related-artworks';
import { useCart } from '@/context/cart-context';
import { ArtworkDetailSkeleton } from '@/components/ui/skeleton';

// Define TypeScript interfaces for our data models
interface SizeOption {
  size: string;
  price: number;
  edition_limit: number;
  editions_sold: number;
}

interface Artwork {
  id: string;
  title: string;
  description: string;
  year: number;
  medium: string;
  collection_id: string | null;
  collection_name?: string;
  featured: boolean;
  images: { url: string, alt: string }[];
  sizes: SizeOption[];
  created_at: string;
}

type PageParams = {
  id: string;
};

/**
 * Artwork Detail Page
 * Displays detailed information about a specific artwork with scrollable images
 * and sticky product information for purchasing
 */
export default function ArtworkDetailPage({ params }: { params: PageParams }) {
  // Properly unwrap params using React.use() as recommended by Next.js
  const resolvedParams = use(params as unknown as Promise<PageParams>);
  const { id } = resolvedParams;

  // State variables
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [selectedImage, setSelectedImage] = useState<number>(0);

  // Fetch artwork data on component mount
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        // Fetch artwork data
        const { data, error: artworkError } = await supabase
          .from('artworks')
          .select('*, collections(name)')
          .eq('id', id)
          .single();

        if (artworkError) {
          throw artworkError;
        }

        if (!data) {
          throw new Error('Artwork not found');
        }

        // Format the data to include collection name
        const formattedArtwork: Artwork = {
          ...data,
          collection_name: data.collections?.name || null
        };

        setArtwork(formattedArtwork);
        
        // Set the first size as the default selected size if available
        if (formattedArtwork.sizes && formattedArtwork.sizes.length > 0) {
          setSelectedSize(formattedArtwork.sizes[0]);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('Error fetching artwork:', error);
        setError(error.message || 'Failed to load artwork data');
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  // Format price from cents to dollars
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Calculate if the selected size is available (not sold out)
  const isAvailable = (size: SizeOption) => {
    return size.editions_sold < size.edition_limit;
  };

  // Handle size selection
  const handleSizeSelect = (size: SizeOption) => {
    setSelectedSize(size);
  };

  // Get cart context
  const { addToCart } = useCart();

  // Handle add to cart
  const handleAddToCart = () => {
    if (!artwork || !selectedSize) return;
    
    // Get the first image URL or a placeholder
    const imageUrl = artwork.images && artwork.images.length > 0 
      ? artwork.images[0].url 
      : '/placeholder.jpg';
    
    // Add the item to the cart
    addToCart({
      id: artwork.id,
      title: artwork.title,
      size: selectedSize.size,
      sizeDisplay: selectedSize.size, // You could enhance this with unit conversion if needed
      price: selectedSize.price,
      quantity: 1,
      imageUrl: imageUrl
    });
  };

  if (loading) {
    return <ArtworkDetailSkeleton />;
  }

  if (error || !artwork) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error || 'Artwork not found'}
        </div>
        <Link href="/" className="text-black hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Scrollable images */}
        <div className="space-y-6 md:overflow-y-auto md:max-h-[calc(100vh-200px)]">
          {artwork.images.map((image, index) => (
            <div 
              key={index} 
              className="relative aspect-square w-full overflow-hidden rounded-md"
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={image.url}
                alt={image.alt || artwork.title}
                width={800}
                height={800}
                className={`object-cover w-full h-full transition-opacity duration-300 ${
                  selectedImage === index ? 'ring-2 ring-black' : ''
                }`}
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Right column - Sticky product info */}
        <div className="md:sticky md:top-24 md:self-start">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="hover:text-black">
                  Home
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              {artwork.collection_name && (
                <>
                  <li>
                    <Link 
                      href={`/collections/${artwork.collection_id}`} 
                      className="hover:text-black"
                    >
                      {artwork.collection_name}
                    </Link>
                  </li>
                  <li>
                    <span className="mx-2">/</span>
                  </li>
                </>
              )}
              <li className="text-black font-medium truncate">
                {artwork.title}
              </li>
            </ol>
          </nav>

          {/* Artwork info */}
          <h1 className="text-3xl font-serif mb-2">{artwork.title}</h1>
          <div className="flex items-center text-gray-600 mb-6">
            <span>{artwork.year}</span>
            <span className="mx-2">•</span>
            <span>{artwork.medium}</span>
          </div>

          {/* Description */}
          <div className="prose prose-sm mb-8">
            <p>{artwork.description}</p>
          </div>

          {/* Size selection */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-3">Select Size</h2>
            <div className="grid grid-cols-2 gap-3">
              {artwork.sizes.map((size, index) => (
                <button
                  key={index}
                  onClick={() => handleSizeSelect(size)}
                  disabled={!isAvailable(size)}
                  className={`border rounded-md py-3 px-4 flex flex-col items-center justify-center transition-colors ${
                    selectedSize === size
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${!isAvailable(size) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="font-medium">{size.size}</span>
                  <span className="text-gray-600 text-sm mt-1">
                    {formatPrice(size.price)}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {size.editions_sold} / {size.edition_limit} sold
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price and add to cart */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-2xl font-medium">
                {selectedSize ? formatPrice(selectedSize.price) : 'Select a size'}
              </span>
              <span className="text-sm text-gray-600">
                Limited Edition Print
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !isAvailable(selectedSize)}
              className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!selectedSize
                ? 'Select a size'
                : !isAvailable(selectedSize)
                ? 'Sold out'
                : 'Add to Cart'}
            </button>

            {/* Additional info */}
            <div className="mt-6 space-y-4 text-sm text-gray-600">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>Free shipping on all orders</p>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p>Certificate of authenticity included</p>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <p>Printed on archival quality paper using eco-friendly inks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Artworks */}
      <RelatedArtworks 
        currentArtworkId={id} 
        collectionId={artwork.collection_id} 
        limit={4} 
      />
    </div>
  );
}
