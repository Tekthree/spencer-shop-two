import { MetadataRoute } from 'next';
import sql from '@/lib/db/client';

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
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  // Fetch dynamic routes — return empty arrays if DB is unreachable (e.g. build without DATABASE_URL)
  let artworkRoutes: MetadataRoute.Sitemap = [];
  let collectionRoutes: MetadataRoute.Sitemap = [];
  let blogRoutes: MetadataRoute.Sitemap = [];

  try {
    const artworks = await sql`
      SELECT id, slug, created_at FROM artworks ORDER BY created_at DESC
    ` as { id: string; slug: string; created_at: string }[];
    artworkRoutes = artworks.map((artwork) => ({
      url: `${baseUrl}/artwork/${artwork.slug || artwork.id}`,
      lastModified: new Date(artwork.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

    const collections = await sql`
      SELECT id, created_at FROM collections ORDER BY created_at DESC
    ` as { id: string; created_at: string }[];
    collectionRoutes = collections.map((collection) => ({
      url: `${baseUrl}/collections/${collection.id}`,
      lastModified: new Date(collection.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    const blogPosts = await sql`
      SELECT slug, published_at, updated_at FROM blog_posts
      WHERE status = 'published' AND published_at IS NOT NULL
      ORDER BY published_at DESC
    ` as { slug: string; published_at: string | null; updated_at: string | null }[];
    blogRoutes = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at ?? post.published_at ?? new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // DB unavailable at build time — sitemap will only include static routes
  }

  // Combine all routes
  return [...staticRoutes, ...artworkRoutes, ...collectionRoutes, ...blogRoutes];
}
