"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import ProductCard from './product-card';

interface Artwork {
  id: string;
  title: string;
  year: number;
  medium: string;
  images: { url: string; alt: string; type?: string }[];
  collection_id: string | null;
  sizes?: { size: string; price: number; edition_limit: number; editions_sold: number }[];
}

interface RelatedArtworksProps {
  currentArtworkId: string;
  collectionId?: string | null;
  limit?: number;
}

/**
 * Related Artworks Component
 * Displays a grid of related artworks based on collection or other criteria
 * @param currentArtworkId - ID of the current artwork to exclude from results
 * @param collectionId - Optional collection ID to filter by
 * @param limit - Maximum number of artworks to display
 */
export default function RelatedArtworks({
  currentArtworkId,
  collectionId = null,
  limit = 4
}: RelatedArtworksProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedArtworks = async () => {
      try {
        let query = supabase
          .from('artworks')
          .select('id, title, year, medium, images, collection_id, sizes')
          .neq('id', currentArtworkId)
          .order('created_at', { ascending: false })
          .limit(limit);

        // If collection ID is provided, filter by that collection
        if (collectionId) {
          query = query.eq('collection_id', collectionId);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // If we don't have enough artworks from the same collection,
        // fetch more artworks regardless of collection
        if (data.length < limit && collectionId) {
          const { data: moreData, error: moreError } = await supabase
            .from('artworks')
            .select('id, title, year, medium, images, collection_id, sizes')
            .neq('id', currentArtworkId)
            .neq('collection_id', collectionId)
            .order('created_at', { ascending: false })
            .limit(limit - data.length);

          if (moreError) {
            throw moreError;
          }

          setArtworks([...data, ...moreData]);
        } else {
          setArtworks(data || []);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('Error fetching related artworks:', error);
        setError(error.message || 'Failed to load related artworks');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedArtworks();
  }, [currentArtworkId, collectionId, limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: limit }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-md mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return null; // Don't show error state to users, just hide the component
  }

  if (artworks.length === 0) {
    return null; // Don't show empty state, just hide the component
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-serif mb-6">You may also like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {artworks.map((artwork) => (
          <ProductCard
            key={artwork.id}
            id={artwork.id}
            title={artwork.title}
            images={artwork.images}
            price={artwork.sizes && artwork.sizes.length > 0 ? artwork.sizes[0].price : undefined}
            className="h-full"
          />
        ))}
      </div>
    </div>
  );
}
