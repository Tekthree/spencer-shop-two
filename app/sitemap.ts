import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase/client';

/**
 * Generates a sitemap for the Spencer Grey artist website
 * This helps search engines discover and index all pages
 * @returns Sitemap configuration for Next.js
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  // Define static routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Fetch all artwork IDs and their last modified dates
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id, created_at')
    .order('created_at', { ascending: false });

  // Generate dynamic routes for artworks
  const artworkRoutes = artworks?.map((artwork) => ({
    url: `${baseUrl}/artwork/${artwork.id}`,
    lastModified: new Date(artwork.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  })) || [];

  // Fetch all collection IDs
  const { data: collections } = await supabase
    .from('collections')
    .select('id, created_at')
    .order('created_at', { ascending: false });

  // Generate dynamic routes for collections
  const collectionRoutes = collections?.map((collection) => ({
    url: `${baseUrl}/collections/${collection.id}`,
    lastModified: new Date(collection.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  })) || [];

  // Combine all routes
  return [...staticRoutes, ...artworkRoutes, ...collectionRoutes];
}