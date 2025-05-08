"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { ArtworkDetailSkeleton } from '@/components/ui/skeleton';
import ArtworkDetailClient from './artwork-detail-client';

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

/**
 * Artwork Detail Page
 * Displays detailed information about a specific artwork with scrollable images
 * and sticky product information for purchasing
 */
export default function ArtworkDetailPage() {
  // Get the id from the URL params using the useParams hook
  const params = useParams();
  const id = params.id as string;

  // State variables
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);

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

  // Check if artwork is a new release (within last 30 days)
  const isNewRelease = artwork ? (
    new Date().getTime() - new Date(artwork.created_at).getTime() < 30 * 24 * 60 * 60 * 1000
  ) : false;

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

  // Use the client component to handle animations and rendering
  return (
    <ArtworkDetailClient
      artwork={artwork}
      error={error}
      formatPrice={formatPrice}
      isAvailable={isAvailable}
      handleSizeSelect={handleSizeSelect}
      handleAddToCart={handleAddToCart}
      selectedSize={selectedSize}
      isNewRelease={isNewRelease}
    />
  );
}
