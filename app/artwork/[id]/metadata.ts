import { Metadata } from 'next';
import { supabase } from '@/lib/supabase/client';

/**
 * Generates metadata for artwork detail pages
 * @param params - The route parameters
 * @returns Metadata for the artwork page
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  try {
    // Fetch artwork data
    const { data: artwork } = await supabase
      .from('artworks')
      .select('*, collections(name)')
      .eq('id', params.id)
      .single();
    
    if (!artwork) {
      return {
        title: 'Artwork Not Found',
        description: 'The requested artwork could not be found.',
      };
    }
    
    // Get the first image URL or a placeholder
    const imageUrl = artwork.images && artwork.images.length > 0 
      ? artwork.images[0].url 
      : '/images/og-image.jpg';
    
    // Format the absolute image URL
    const absoluteImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${baseUrl}${imageUrl}`;
    
    // Format price from cents to dollars
    const lowestPrice = artwork.sizes && artwork.sizes.length > 0
      ? Math.min(...artwork.sizes.map((size: { price: number }) => size.price))
      : 0;
    
    const formattedPrice = (lowestPrice / 100).toFixed(2);
    
    // Create a detailed description
    const description = artwork.description 
      ? `${artwork.title} - ${artwork.description}`
      : `Limited edition fine art print by Spencer Grey: ${artwork.title}. ${artwork.medium || 'Fine art print'}, ${artwork.year || ''}.`;
    
    // Generate keywords based on artwork details
    const keywords = [
      'Spencer Grey',
      'fine art',
      'limited edition prints',
      artwork.title,
      artwork.medium || 'art print',
      artwork.collections?.name || 'art collection',
      `${artwork.year || ''} artwork`,
    ].filter(Boolean);
    
    return {
      title: artwork.title,
      description: description.substring(0, 160), // Limit to 160 characters for SEO
      keywords,
      openGraph: {
        title: `${artwork.title} | Spencer Grey Art`,
        description: description.substring(0, 160),
        url: `${baseUrl}/artwork/${params.id}`,
        siteName: 'Spencer Grey Art',
        images: [{
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: artwork.title,
        }],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${artwork.title} | Spencer Grey Art`,
        description: description.substring(0, 160),
        images: [absoluteImageUrl],
        creator: '@spencergreyart',
      },
      alternates: {
        canonical: `${baseUrl}/artwork/${params.id}`,
      },
      other: {
        'og:price:amount': formattedPrice,
        'og:price:currency': 'USD',
      },
    };
  } catch (error) {
    console.error('Error generating artwork metadata:', error);
    
    return {
      title: 'Artwork | Spencer Grey Art',
      description: 'Discover limited edition fine art prints by Spencer Grey.',
    };
  }
}