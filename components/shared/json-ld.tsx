"use client";

import { useEffect, useState } from 'react';

/**
 * Component for rendering JSON-LD structured data
 * @param data - The structured data to render
 * @returns Script element with JSON-LD data
 */
// Define a type for JSON-LD structured data
type JsonLdData = Record<string, unknown>;

export default function JsonLd({ data }: { data: JsonLdData }) {
  // Use state to ensure this only runs on the client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Creates website structured data
 * @returns JSON-LD data for the website
 */
export function websiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Spencer Grey Art",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/shop?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Creates organization structured data
 * @returns JSON-LD data for the organization
 */
export function organizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Spencer Grey Art",
    "url": baseUrl,
    "logo": `${baseUrl}/images/og-image.jpg`,
    "sameAs": [
      "https://instagram.com/spencergreyart",
      "https://twitter.com/spencergreyart"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "",
      "contactType": "customer service",
      "email": "support@spencergrey.com",
      "availableLanguage": "English"
    }
  };
}

/**
 * Creates product structured data for artwork
 * @param artwork - The artwork data
 * @returns JSON-LD data for the product
 */
// Define a type for artwork data
type ArtworkData = {
  id: string;
  title: string;
  description?: string;
  images?: Array<{ url: string }> | { url: string }[] | string[] | string;
  sizes?: Array<{ price: number }>;
};

export function productJsonLd(artwork: ArtworkData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  // Get the first image URL or a placeholder
  let imageUrl = `${baseUrl}/images/og-image.jpg`;
  
  if (artwork.images) {
    if (Array.isArray(artwork.images) && artwork.images.length > 0) {
      const firstImage = artwork.images[0];
      if (typeof firstImage === 'string') {
        imageUrl = firstImage;
      } else if (typeof firstImage === 'object' && 'url' in firstImage) {
        imageUrl = firstImage.url;
      }
    } else if (typeof artwork.images === 'string') {
      imageUrl = artwork.images;
    } else if (typeof artwork.images === 'object' && 'url' in artwork.images) {
      const url = artwork.images.url;
      if (typeof url === 'string') {
        imageUrl = url;
      }
    }
  }
  
  // Format the absolute image URL
  const absoluteImageUrl = typeof imageUrl === 'string' && imageUrl.startsWith('http') 
    ? imageUrl 
    : `${baseUrl}${imageUrl}`;
  
  // Get the lowest price from available sizes
  const lowestPrice = artwork.sizes && artwork.sizes.length > 0
    ? Math.min(...artwork.sizes.map((size) => size.price))
    : 0;
  
  // Format price from cents to dollars
  const formattedPrice = (lowestPrice / 100).toFixed(2);
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": artwork.title,
    "image": absoluteImageUrl,
    "description": artwork.description || `Limited edition fine art print by Spencer Grey: ${artwork.title}`,
    "sku": `SGP-${artwork.id}`,
    "brand": {
      "@type": "Brand",
      "name": "Spencer Grey Art"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": formattedPrice,
      "highPrice": artwork.sizes && artwork.sizes.length > 0
        ? ((Math.max(...artwork.sizes.map((size: { price: number }) => size.price))) / 100).toFixed(2)
        : formattedPrice,
      "offerCount": artwork.sizes ? artwork.sizes.length : 1,
      "availability": "https://schema.org/InStock"
    }
  };
}

/**
 * Creates breadcrumb structured data
 * @param items - The breadcrumb items
 * @returns JSON-LD data for breadcrumbs
 */
export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}