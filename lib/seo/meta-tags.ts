import { Metadata } from 'next';

/**
 * Utility for generating consistent meta tags across the Spencer Grey artist website
 * This ensures all pages have proper SEO metadata for search engines and social sharing
 */

/**
 * Generates consistent metadata for all pages
 * @param options - Metadata options
 * @returns Metadata object for Next.js
 */
export function generateMetaTags({
  title,
  description,
  path = '',
  images = [],
  keywords = [],
  type = 'website',
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  images?: string[];
  keywords?: string[];
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
}): Metadata {
  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  // Default keywords for the site
  const defaultKeywords = [
    'Spencer Grey',
    'fine art',
    'limited edition prints',
    'art prints',
    'minimalist art',
    'contemporary artist',
    'gallery prints',
    'art collection'
  ];
  
  // Default OG image
  const defaultOgImage = `/images/og-image.jpg`;
  
  // Format OG images
  const ogImages = images.length > 0 
    ? images.map(img => ({
        url: img.startsWith('http') ? img : `${baseUrl}${img}`,
        width: 1200,
        height: 630,
        alt: title,
      }))
    : [
        {
          url: `${baseUrl}${defaultOgImage}`,
          width: 1200,
          height: 630,
          alt: title || 'Spencer Grey Art',
        },
      ];

  // Format canonical URL
  const canonical = path ? `${baseUrl}${path}` : baseUrl;

  return {
    title: title.includes('Spencer Grey') ? title : `${title} | Spencer Grey Art`,
    description,
    keywords: [...defaultKeywords, ...keywords],
    openGraph: {
      title: title.includes('Spencer Grey') ? title : `${title} | Spencer Grey Art`,
      description,
      url: canonical,
      siteName: 'Spencer Grey Art',
      images: ogImages,
      locale: 'en_US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: title.includes('Spencer Grey') ? title : `${title} | Spencer Grey Art`,
      description,
      images: ogImages.map(img => img.url),
      creator: '@spencergreyart',
    },
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical,
    },
  };
}