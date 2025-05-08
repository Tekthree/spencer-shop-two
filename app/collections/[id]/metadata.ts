import { Metadata } from 'next';
import { supabase } from '@/lib/supabase/client';

/**
 * Generates metadata for collection pages
 * @param params - The route parameters
 * @returns Metadata for the collection page
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  try {
    // Fetch collection data
    const { data: collection } = await supabase
      .from('collections')
      .select('name, description')
      .eq('id', params.id)
      .single();
    
    if (!collection) {
      return {
        title: 'Collection Not Found',
        description: 'The requested collection could not be found.',
      };
    }
    
    // Create a detailed description
    const description = collection.description 
      ? collection.description.substring(0, 160) + (collection.description.length > 160 ? '...' : '')
      : `Explore the ${collection.name} collection by Spencer Grey - Limited edition fine art prints with a focus on quality and sustainability.`;
    
    // Generate keywords based on collection details
    const keywords = [
      'Spencer Grey',
      'fine art',
      'limited edition prints',
      collection.name,
      'art collection',
      'art prints',
      'contemporary art',
      'minimalist art'
    ].filter(Boolean);
    
    return {
      title: `${collection.name} Collection | Spencer Grey Art`,
      description,
      keywords,
      openGraph: {
        title: `${collection.name} Collection | Spencer Grey Art`,
        description,
        url: `${baseUrl}/collections/${params.id}`,
        siteName: 'Spencer Grey Art',
        images: [{
          url: `${baseUrl}/images/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${collection.name} Collection - Spencer Grey Art`,
        }],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${collection.name} Collection | Spencer Grey Art`,
        description,
        images: [`${baseUrl}/images/og-image.jpg`],
        creator: '@spencergreyart',
      },
      alternates: {
        canonical: `${baseUrl}/collections/${params.id}`,
      },
    };
  } catch (error) {
    console.error('Error generating collection metadata:', error);
    
    return {
      title: 'Collection | Spencer Grey Art',
      description: 'Explore art collections by Spencer Grey featuring limited edition fine art prints.',
    };
  }
}