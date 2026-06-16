"use client";

import { useState, useEffect } from 'react';
import ProductCard from './product-card';
import HorizontalScroll from '@/components/ui/horizontal-scroll';

interface Artwork {
  id: string;
  slug: string;
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

export default function RelatedArtworks({
  currentArtworkId,
  collectionId = null,
  limit = 6
}: RelatedArtworksProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedArtworks = async () => {
      try {
        const params = new URLSearchParams({
          currentId: currentArtworkId,
          limit: String(limit),
        });
        if (collectionId) {
          params.set('collectionId', collectionId);
        }

        const response = await fetch(`/api/artworks/related?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch related artworks');
        const data = await response.json() as Artwork[];
        setArtworks(data);
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
      <div className="mt-16 pb-16">
        <div className="h-6 w-40 bg-[#EDEAE4] animate-pulse mb-8" />
        <div className="flex gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[260px] animate-pulse">
              <div className="aspect-[3/4] bg-[#EDEAE4] mb-3" />
              <div className="h-4 bg-[#EDEAE4] w-3/4 mb-2" />
              <div className="h-3 bg-[#EDEAE4] w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || artworks.length === 0) return null;

  return (
    <div className="mt-16 pb-16">
      <h2 className="font-serif text-2xl text-[#020312] mb-8">You may also like</h2>
      <HorizontalScroll
        scrollbarTrackClassName="bg-[#020312]/10"
        scrollbarThumbClassName="bg-[#020312]/40 hover:bg-[#020312]/70"
      >
        <div className="flex gap-6 pb-2">
          {artworks.map((artwork) => (
            <div key={artwork.id} className="shrink-0 w-[240px] sm:w-[280px]">
              <ProductCard
                slug={artwork.slug}
                title={artwork.title}
                images={artwork.images}
                price={artwork.sizes?.[0]?.price}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </HorizontalScroll>
    </div>
  );
}
