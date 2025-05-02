"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ShopSkeleton } from '@/components/ui/skeleton';
import ShopPageClient from './shop-page-client';

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
    return <ShopSkeleton />;
  }

  // Use the client component to handle animations
  return <ShopPageClient artworks={artworks} error={error} />;
}