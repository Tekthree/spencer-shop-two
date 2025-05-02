import { supabase } from "@/lib/supabase/client";
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
  title: string;
  price: string;
  images: ArtworkImage[];
  sizes: ArtworkSize[];
}

export default async function Home() {
  try {
    // Fetch featured artworks from Supabase
    const { data: featuredArtworksData } = await supabase
      .from('artworks')
      .select('id, title, images, sizes, featured')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(2);

    // Fetch recent artworks from Supabase
    const { data: recentArtworksData } = await supabase
      .from('artworks')
      .select('id, title, images, sizes')
      .order('created_at', { ascending: false })
      .limit(4);

    // Format the featured artworks data
    const formattedFeaturedArtworks: FormattedArtwork[] = featuredArtworksData?.map((artwork: Artwork) => ({
      id: artwork.id,
      title: artwork.title,
      price: artwork.sizes && artwork.sizes.length > 0 
        ? `from ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(artwork.sizes[0].price / 100)}` 
        : 'Price on request',
      // Ensure all images have an alt text to match ProductCard expectations
      images: (artwork.images || []).map(img => ({
        url: img.url,
        alt: img.alt || artwork.title, // Use title as fallback if alt is missing
        type: img.type
      })),
      sizes: artwork.sizes || []
    })) || [];

    // Tags for recent artworks
    const tags = ["Just Dropped", "Newest Addition", "Most Popular", "Must-Have"];

    // Format the recent artworks data
    const formattedRecentArtworks = recentArtworksData?.map((artwork: Artwork, index) => ({
      id: artwork.id,
      title: artwork.title,
      // Ensure all images have an alt text to match ProductCard expectations
      images: (artwork.images || []).map(img => ({
        url: img.url,
        alt: img.alt || artwork.title, // Use title as fallback if alt is missing
        type: img.type
      })),
      sizes: artwork.sizes || [],
      tag: tags[index % tags.length],
      hidePrice: true
    })) || [];

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
