import { Metadata } from 'next';

/**
 * Generates metadata for the shop page
 * @returns Metadata for the shop page
 */
export function generateMetadata(): Metadata {
  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  return {
    title: 'Shop | Spencer Grey Art',
    description: 'Browse and purchase limited edition fine art prints by Spencer Grey. Each piece is printed on museum-quality paper and comes with a certificate of authenticity.',
    keywords: [
      'Spencer Grey', 
      'art shop', 
      'buy art prints', 
      'limited edition prints', 
      'fine art prints',
      'contemporary art',
      'art collection',
      'art for sale'
    ],
    openGraph: {
      title: 'Shop | Spencer Grey Art',
      description: 'Browse and purchase limited edition fine art prints by Spencer Grey. Each piece is printed on museum-quality paper and comes with a certificate of authenticity.',
      url: `${baseUrl}/shop`,
      siteName: 'Spencer Grey Art',
      images: [{
        url: `${baseUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Spencer Grey Art Shop',
      }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Shop | Spencer Grey Art',
      description: 'Browse and purchase limited edition fine art prints by Spencer Grey. Each piece is printed on museum-quality paper and comes with a certificate of authenticity.',
      images: [`${baseUrl}/images/og-image.jpg`],
      creator: '@spencergreyart',
    },
    alternates: {
      canonical: `${baseUrl}/shop`,
    },
  };
}