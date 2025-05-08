import { Metadata } from 'next';

/**
 * Generates metadata for the FAQ page
 * @returns Metadata for the FAQ page
 */
export function generateMetadata(): Metadata {
  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  return {
    title: 'Frequently Asked Questions | Spencer Grey Art',
    description: 'Find answers to common questions about Spencer Grey\'s limited edition art prints, shipping, returns, payment options, and product care.',
    keywords: [
      'Spencer Grey FAQ', 
      'art prints questions', 
      'limited edition print FAQ', 
      'art shipping information', 
      'art returns policy',
      'art payment options',
      'art print care',
      'art print sizes'
    ],
    openGraph: {
      title: 'Frequently Asked Questions | Spencer Grey Art',
      description: 'Find answers to common questions about Spencer Grey\'s limited edition art prints, shipping, returns, payment options, and product care.',
      url: `${baseUrl}/faq`,
      siteName: 'Spencer Grey Art',
      images: [{
        url: `${baseUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Spencer Grey Art FAQ',
      }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Frequently Asked Questions | Spencer Grey Art',
      description: 'Find answers to common questions about Spencer Grey\'s limited edition art prints, shipping, returns, payment options, and product care.',
      images: [`${baseUrl}/images/og-image.jpg`],
      creator: '@spencergreyart',
    },
    alternates: {
      canonical: `${baseUrl}/faq`,
    },
  };
}