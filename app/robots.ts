import { MetadataRoute } from 'next';

/**
 * Generates robots.txt instructions for search engines
 * @returns Robots configuration for Next.js
 */
export default function robots(): MetadataRoute.Robots {
  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/checkout/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}