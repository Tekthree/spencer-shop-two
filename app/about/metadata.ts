import { Metadata } from 'next';
import { supabase } from '@/lib/supabase/client';

/**
 * Generates metadata for the about page
 * @returns Metadata for the about page
 */
export async function generateMetadata(): Promise<Metadata> {
  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  // Try to fetch the artist statement from the database for a more personalized description
  let description = 'Learn about Spencer Grey, a contemporary artist creating minimalist fine art prints with a focus on quality and sustainability.';
  
  try {
    const { data } = await supabase
      .from('page_content')
      .select('content')
      .eq('page', 'about')
      .eq('section', 'artist_statement')
      .single();
    
    if (data?.content) {
      // Use the first 160 characters of the artist statement as the description
      description = data.content.substring(0, 160) + (data.content.length > 160 ? '...' : '');
    }
  } catch (error) {
    console.error('Error fetching about page content for metadata:', error);
  }
  
  return {
    title: 'About | Spencer Grey Art',
    description,
    keywords: [
      'Spencer Grey', 
      'artist biography', 
      'contemporary artist', 
      'art philosophy', 
      'artist statement',
      'fine art prints',
      'artist background',
      'art inspiration'
    ],
    openGraph: {
      title: 'About Spencer Grey | Contemporary Fine Art Prints',
      description,
      url: `${baseUrl}/about`,
      siteName: 'Spencer Grey Art',
      images: [{
        url: `${baseUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Spencer Grey - Artist',
      }],
      locale: 'en_US',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About Spencer Grey | Contemporary Fine Art Prints',
      description,
      images: [`${baseUrl}/images/og-image.jpg`],
      creator: '@spencergreyart',
    },
    alternates: {
      canonical: `${baseUrl}/about`,
    },
  };
}