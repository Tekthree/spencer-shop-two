import sql from '@/lib/db/client';
import ShopPageClient from './shop-page-client';

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

/**
 * Shop All Art Page
 * Displays a grid of all available artworks for purchase
 */
export default async function ShopAllArtPage() {
  try {
    const artworks = await sql`
      SELECT id, slug, title, year, medium, images, collection_id, sizes
      FROM artworks
      ORDER BY created_at DESC
    ` as Artwork[];

    return <ShopPageClient artworks={artworks} error={null} />;
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error('Error fetching artworks:', error);
    return <ShopPageClient artworks={[]} error={error.message || 'Failed to load artworks'} />;
  }
}
