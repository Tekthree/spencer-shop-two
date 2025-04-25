"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';

interface Artwork {
  id: string;
  title: string;
  year: number;
  medium: string;
  images: { url: string; alt: string }[];
  collection_id: string | null;
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
          .select('id, title, year, medium, images, collection_id')
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
            .select('id, title, year, medium, images, collection_id')
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
          <Link 
            key={artwork.id} 
            href={`/artwork/${artwork.id}`}
            className="group"
          >
            <div className="aspect-square overflow-hidden rounded-md mb-3">
              {artwork.images && artwork.images.length > 0 ? (
                <Image
                  src={artwork.images[0].url}
                  alt={artwork.images[0].alt || artwork.title}
                  width={400}
                  height={400}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="font-medium text-gray-900 group-hover:text-black transition-colors">
              {artwork.title}
            </h3>
            <p className="text-sm text-gray-600">
              {artwork.year} • {artwork.medium}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
