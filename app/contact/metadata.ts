import { Metadata } from 'next';

/**
 * Generates metadata for the contact page
 * @returns Metadata for the contact page
 */
export function generateMetadata(): Metadata {
  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  return {
    title: 'Contact | Spencer Grey Art',
    description: 'Get in touch with Spencer Grey for inquiries about artwork, commissions, or any questions about purchasing limited edition fine art prints.',
    keywords: [
      'Spencer Grey', 
      'contact artist', 
      'art inquiries', 
      'commission artwork', 
      'art prints contact',
      'art customer service',
      'art questions'
    ],
    openGraph: {
      title: 'Contact | Spencer Grey Art',
      description: 'Get in touch with Spencer Grey for inquiries about artwork, commissions, or any questions about purchasing limited edition fine art prints.',
      url: `${baseUrl}/contact`,
      siteName: 'Spencer Grey Art',
      images: [{
        url: `${baseUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Contact Spencer Grey Art',
      }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Contact | Spencer Grey Art',
      description: 'Get in touch with Spencer Grey for inquiries about artwork, commissions, or any questions about purchasing limited edition fine art prints.',
      images: [`${baseUrl}/images/og-image.jpg`],
      creator: '@spencergreyart',
    },
    alternates: {
      canonical: `${baseUrl}/contact`,
    },
  };
}