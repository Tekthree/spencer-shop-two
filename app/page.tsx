import sql from "@/lib/db/client";
import HomePageClient from "./home-page-client";

/**
 * Home page for Spencer Grey Artist Website
 * Features a minimalist hero section and gallery grid inspired by Roburico.com
 * @returns Home page component
 */

// Define interfaces for type safety
interface ArtworkImage {
  url: string;
  alt: string; // Make alt required to match ProductCard expectations
  type?: string;
}

interface ArtworkSize {
  size: string;
  price: number;
  edition_limit: number;
  editions_sold: number;
}

interface Artwork {
  id: string;
  slug: string;
  title: string;
  description?: string;
  year?: number;
  medium?: string;
  featured?: boolean;
  images: ArtworkImage[];
  sizes: ArtworkSize[];
  created_at?: string;
}

interface FormattedArtwork {
  id: string;
  slug: string;
  title: string;
  price: number;
  images: ArtworkImage[];
  sizes: ArtworkSize[];
  tag?: string;
  hidePrice?: boolean;
}

export default async function Home() {
  try {
    // Fetch featured artworks from Neon
    const featuredArtworksData = await sql`
      SELECT id, slug, title, images, sizes, featured
      FROM artworks
      ORDER BY created_at DESC
      LIMIT 4
    ` as Artwork[];

    // Fetch recent artworks from Neon
    const recentArtworksData = await sql`
      SELECT id, slug, title, images, sizes
      FROM artworks
      ORDER BY created_at DESC
      LIMIT 5
    ` as Artwork[];

    // Format the featured artworks data
    const formattedFeaturedArtworks: FormattedArtwork[] = featuredArtworksData.map((artwork: Artwork) => ({
      id: artwork.id,
      slug: artwork.slug,
      title: artwork.title,
      price: artwork.sizes && artwork.sizes.length > 0 
        ? artwork.sizes[0].price
        : 0,
      // Ensure all images have an alt text to match ProductCard expectations
      images: (artwork.images || []).map(img => ({
        url: img.url,
        alt: img.alt || artwork.title, // Use title as fallback if alt is missing
        type: img.type
      })),
      sizes: artwork.sizes || []
    }));

    // Recent artworks don't need tags anymore

    // Format the recent artworks data
    const formattedRecentArtworks = recentArtworksData.map((artwork: Artwork) => ({
      id: artwork.id,
      slug: artwork.slug,
      title: artwork.title,
      // Add price property (required by Artwork type)
      price: artwork.sizes && artwork.sizes.length > 0 
        ? artwork.sizes[0].price
        : 0,
      // Ensure all images have an alt text to match ProductCard expectations
      images: (artwork.images || []).map(img => ({
        url: img.url,
        alt: img.alt || artwork.title, // Use title as fallback if alt is missing
        type: img.type
      })),
      sizes: artwork.sizes || [],
      hidePrice: true
    }));

    return <HomePageClient 
      featuredArtworks={formattedFeaturedArtworks} 
      recentArtworks={formattedRecentArtworks} 
    />;
  } catch (error) {
    console.error('Error loading home page:', error);
    
    // Return a simplified client component with error state
    return <HomePageClient 
      featuredArtworks={[]} 
      recentArtworks={[]} 
    />;
  }
}
