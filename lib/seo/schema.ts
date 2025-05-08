/**
 * Schema.org structured data generators for SEO
 * These functions create structured data objects that help search engines
 * better understand the content of the Spencer Grey artist website
 */

/**
 * Creates website structured data
 * @returns JSON-LD data for the website
 */
export function generateWebsiteSchema() {
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
export function generateOrganizationSchema() {
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
export function generateProductSchema(artwork: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  // Get the first image URL or a placeholder
  const imageUrl = artwork.images && artwork.images.length > 0 
    ? artwork.images[0].url 
    : `${baseUrl}/images/og-image.jpg`;
  
  // Format the absolute image URL
  const absoluteImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : `${baseUrl}${imageUrl}`;
  
  // Get the lowest price from available sizes
  const lowestPrice = artwork.sizes && artwork.sizes.length > 0
    ? Math.min(...artwork.sizes.map((size: any) => size.price))
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
    "mpn": `SGP-${artwork.id}`,
    "brand": {
      "@type": "Brand",
      "name": "Spencer Grey Art"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": formattedPrice,
      "highPrice": artwork.sizes && artwork.sizes.length > 0
        ? ((Math.max(...artwork.sizes.map((size: any) => size.price))) / 100).toFixed(2)
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
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
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

/**
 * Creates FAQ structured data
 * @param questions - The FAQ questions and answers
 * @returns JSON-LD data for FAQs
 */
export function generateFAQSchema(questions: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  };
}

/**
 * Creates article structured data
 * @param article - The article data
 * @returns JSON-LD data for the article
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName: string;
  url: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  // Format the absolute image URL
  const absoluteImageUrl = article.image.startsWith('http') 
    ? article.image 
    : `${baseUrl}${article.image}`;
  
  // Format the absolute URL
  const absoluteUrl = article.url.startsWith('http') 
    ? article.url 
    : `${baseUrl}${article.url}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": absoluteImageUrl,
    "datePublished": article.publishedAt,
    "dateModified": article.modifiedAt || article.publishedAt,
    "author": {
      "@type": "Person",
      "name": article.authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "Spencer Grey Art",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/og-image.jpg`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": absoluteUrl
    }
  };
}

/**
 * Creates local business structured data
 * @returns JSON-LD data for local business
 */
export function generateLocalBusinessSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Spencer Grey Art",
    "image": `${baseUrl}/images/og-image.jpg`,
    "url": baseUrl,
    "telephone": "",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "",
      "addressLocality": "Seattle",
      "addressRegion": "WA",
      "postalCode": "98101",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 47.6062,
      "longitude": -122.3321
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "17:00"
    },
    "sameAs": [
      "https://instagram.com/spencergreyart",
      "https://twitter.com/spencergreyart"
    ]
  };
}