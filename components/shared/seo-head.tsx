"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// No props needed for this component

/**
 * Component for adding additional SEO elements that can't be handled by Next.js metadata
 * @param props - SEO properties
 * @returns Head component with SEO elements
 */
export default function SEOHead() {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  // Default OG image for structured data
  const defaultOgImage = `${baseUrl}/images/og-image.jpg`;
  
  // Add structured data for local business
  const localBusinessStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Spencer Grey Art',
    'image': defaultOgImage,
    'url': baseUrl,
    'telephone': '',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '',
      'addressLocality': 'Seattle',
      'addressRegion': 'WA',
      'postalCode': '98101',
      'addressCountry': 'US'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 47.6062,
      'longitude': -122.3321
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday'
      ],
      'opens': '09:00',
      'closes': '17:00'
    },
    'sameAs': [
      'https://instagram.com/spencergreyart',
      'https://twitter.com/spencergreyart'
    ]
  };

  // Add structured data for breadcrumbs
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': baseUrl
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': pathname.split('/')[1] ? pathname.split('/')[1].charAt(0).toUpperCase() + pathname.split('/')[1].slice(1) : '',
        'item': `${baseUrl}/${pathname.split('/')[1]}`
      }
    ].filter(item => item.name !== '')
  };

  // Add link rel tags for better SEO
  useEffect(() => {
    // Add link rel="manifest" for PWA support
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    document.head.appendChild(manifestLink);
    
    // Add link rel="apple-touch-icon" for iOS devices
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = '/icons/apple-touch-icon.png';
    document.head.appendChild(appleTouchIcon);
    
    // Add link rel="icon" for favicon
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = '/favicon.ico';
    document.head.appendChild(favicon);
    
    // Cleanup function
    return () => {
      document.head.removeChild(manifestLink);
      document.head.removeChild(appleTouchIcon);
      document.head.removeChild(favicon);
    };
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessStructuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />
    </>
  );
}