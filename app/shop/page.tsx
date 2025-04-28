"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import ProductCard from '@/components/artwork/product-card';

interface Artwork {
  id: string;
  title: string;
  year: number;
  medium: string;
  images: { url: string; alt: string; type?: string }[];
  collection_id: string | null;
  sizes?: { size: string; price: number; edition_limit: number; editions_sold: number }[];
}

/**
 * Shop All Art Page
 * Displays a grid of all available artworks for purchase
 */
export default function ShopAllArtPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllArtworks = async () => {
      try {
        const { data, error } = await supabase
          .from('artworks')
          .select('id, title, year, medium, images, collection_id, sizes')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setArtworks(data || []);
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('Error fetching artworks:', error);
        setError(error.message || 'Failed to load artworks');
      } finally {
        setLoading(false);
      }
    };

    fetchAllArtworks();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-md mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-500">Something went wrong. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="text-3xl md:text-4xl font-serif mb-6 uppercase tracking-wider">SHOP ALL</h1>
        <div className="max-w-3xl mx-auto border-b border-gray-200 pb-8">
          <p className="text-gray-600 text-sm">
            Browse Spencer Grey&apos;s complete collection of limited edition art prints. 
            Each piece is printed on archival quality paper using eco-friendly inks.
          </p>
        </div>
      </div>

      {/* Artwork Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16">
        {artworks.map((artwork) => (
          <div key={artwork.id} className="artwork-item">
            <ProductCard
              id={artwork.id}
              title={artwork.title}
              images={artwork.images}
              price={artwork.sizes && artwork.sizes.length > 0 ? artwork.sizes[0].price : undefined}
              className="h-full"
            />
            <div className="mt-2 flex justify-between items-center">
              <p className="text-sm font-light">{artwork.title}</p>
              <p className="text-sm text-gray-500 font-light">
                {artwork.sizes && artwork.sizes.length > 0 && 
                  `from $${(artwork.sizes[0].price / 100).toFixed(2)}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Value Proposition Section */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-4 text-center border-t border-b border-gray-200 py-8">
        <div className="flex flex-col items-center p-4">
          <p className="text-xs uppercase tracking-wider">Certificate of Authenticity</p>
        </div>
        <div className="flex flex-col items-center p-4">
          <p className="text-xs uppercase tracking-wider">Cultural context included</p>
        </div>
        <div className="flex flex-col items-center p-4">
          <p className="text-xs uppercase tracking-wider">All prints are securely packaged</p>
        </div>
        <div className="flex flex-col items-center p-4">
          <p className="text-xs uppercase tracking-wider">Limited edition prints</p>
        </div>
      </div>
    </div>
  );
}