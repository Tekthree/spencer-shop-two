import { Metadata } from 'next';

/**
 * Generates consistent SEO metadata for all pages
 * @param title - Page title
 * @param description - Page description
 * @param images - OG images for social sharing
 * @param keywords - SEO keywords
 * @param noIndex - Whether to prevent indexing
 * @returns Metadata object for Next.js
 */
export function generateMetadata({
  title,
  description,
  images = [],
  keywords = [],
  noIndex = false,
}: {
  title: string;
  description: string;
  images?: string[];
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  // Base URL for absolute URLs
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
  const defaultOgImage = `${baseUrl}/images/og-image.jpg`;
  
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
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: 'Spencer Grey Art',
        },
      ];

  return {
    title: `${title} | Spencer Grey Art`,
    description,
    keywords: [...defaultKeywords, ...keywords],
    openGraph: {
      title: `${title} | Spencer Grey Art`,
      description,
      url: baseUrl,
      siteName: 'Spencer Grey Art',
      images: ogImages,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Spencer Grey Art`,
      description,
      images: ogImages.map(img => img.url),
      creator: '@spencergreyart',
    },
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: baseUrl,
    },
  };
}