import { Metadata } from 'next';

/**
 * Generates metadata for the home page
 * @returns Metadata for the home page
 */
export function generateMetadata(): Metadata {
  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  return {
    title: 'Spencer Grey | Limited Edition Fine Art Prints',
    description: 'Discover limited edition fine art prints by Spencer Grey. Clean, minimalist artwork with a focus on quality and sustainability.',
    keywords: [
      'Spencer Grey', 
      'fine art', 
      'limited edition prints', 
      'art prints', 
      'minimalist art',
      'contemporary artist',
      'gallery prints',
      'art collection'
    ],
    openGraph: {
      title: 'Spencer Grey | Limited Edition Fine Art Prints',
      description: 'Discover limited edition fine art prints by Spencer Grey. Clean, minimalist artwork with a focus on quality and sustainability.',
      url: baseUrl,
      siteName: 'Spencer Grey Art',
      images: [{
        url: `${baseUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Spencer Grey Art',
      }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Spencer Grey | Limited Edition Fine Art Prints',
      description: 'Discover limited edition fine art prints by Spencer Grey. Clean, minimalist artwork with a focus on quality and sustainability.',
      images: [`${baseUrl}/images/og-image.jpg`],
      creator: '@spencergreyart',
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}