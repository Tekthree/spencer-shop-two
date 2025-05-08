/**
 * SEO configuration for the Spencer Grey artist website
 * This file contains common SEO settings used across the site
 */

// Base URL from environment variable or default
export const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';

// Default SEO metadata
export const defaultSEO = {
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
  ogImage: '/images/og-image.jpg',
  twitterHandle: '@spencergreyart',
  locale: 'en_US',
};

// Social media profiles
export const socialProfiles = {
  instagram: 'https://instagram.com/spencergreyart',
  twitter: 'https://twitter.com/spencergreyart',
  facebook: 'https://facebook.com/spencergreyart',
  pinterest: 'https://pinterest.com/spencergreyart',
};

// Structured data settings
export const structuredDataSettings = {
  organizationName: 'Spencer Grey Art',
  organizationLogo: `${baseUrl}/images/og-image.jpg`,
  siteType: 'WebSite',
};

// Google Analytics ID
export const googleAnalyticsId = 'G-XXXXXXXXXX';

// Verification IDs for search engines
export const siteVerification = {
  google: 'google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  bing: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  yandex: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
};