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
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'Spencer Grey Art',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/shop?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Creates organization structured data
 * @returns JSON-LD data for the organization
 */
export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  const logo = `${baseUrl}/images/og-image.jpg`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'Spencer Grey Art',
    url: baseUrl,
    logo,
    sameAs: [
      'https://instagram.com/spencergreyart',
      'https://twitter.com/spencergreyart',
      'https://www.facebook.com/SpencerGrey333',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@spencergrey.com',
        availableLanguage: ['English'],
        areaServed: 'Worldwide',
      },
    ],
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
  slug?: string;
  title: string;
  description?: string;
  images?: Array<{ url: string }> | { url: string }[] | string[] | string;
  sizes?: Array<{ price: number }>;
};

export function generateProductSchema(artwork: ArtworkData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  const slugOrId = artwork.slug || artwork.id;
  
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
    } else if (typeof artwork.images === 'object' && 'url' in artwork.images && typeof artwork.images.url === 'string') {
      imageUrl = artwork.images.url;
    }
  }
  
  // Format the absolute image URL
  const absoluteImageUrl = typeof imageUrl === 'string' && imageUrl.startsWith('http') 
    ? imageUrl 
    : `${baseUrl}${imageUrl}`;
  
  // Get the lowest price from available sizes
  const lowestPrice = artwork.sizes && artwork.sizes.length > 0
    ? Math.min(...artwork.sizes.map((size: { price: number }) => size.price))
    : 0;
  
  // Format price from cents to dollars
  const highestPrice = artwork.sizes && artwork.sizes.length > 0
    ? Math.max(...artwork.sizes.map((size: { price: number }) => size.price))
    : lowestPrice;
  const formattedPrice = (lowestPrice / 100).toFixed(2);
  const formattedHighPrice = (highestPrice / 100).toFixed(2);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/artwork/${slugOrId}#product`,
    name: artwork.title,
    image: absoluteImageUrl,
    description: artwork.description || `Limited edition fine art print by Spencer Grey: ${artwork.title}`,
    sku: `SGP-${artwork.id}`,
    mpn: `SGP-${artwork.id}`,
    brand: {
      '@type': 'Brand',
      '@id': `${baseUrl}/#organization`,
      name: 'Spencer Grey Art',
    },
    offers: {
      '@type': 'AggregateOffer',
      url: `${baseUrl}/artwork/${slugOrId}`,
      priceCurrency: 'USD',
      lowPrice: formattedPrice,
      highPrice: formattedHighPrice,
      offerCount: artwork.sizes && artwork.sizes.length ? artwork.sizes.length : 1,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Spencer Grey Art',
      },
    },
  };
}

/**
 * Creates breadcrumb structured data
 * @param items - The breadcrumb items
 * @returns JSON-LD data for breadcrumbs
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Creates FAQ structured data
 * @param questions - The FAQ questions and answers
 * @returns JSON-LD data for FAQs
 */
export function generateFAQSchema(questions: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

/**
 * Creates article structured data
 * @param article - The article data
 * @returns JSON-LD data for the article
 */
/**
 * Article data type
 */
type ArticleData = {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName: string;
};

/**
 * Creates article structured data
 * @param article - The article data
 * @returns JSON-LD data for the article
 */
export function generateArticleSchema(article: ArticleData) {
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
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: absoluteImageUrl,
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.authorName,
      '@id': `${baseUrl}/#person`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Spencer Grey Art',
      '@id': `${baseUrl}/#organization`,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/og-image.jpg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl,
    },
  };
}

/**
 * Creates local business structured data
 * @returns JSON-LD data for local business
 */
export function generateLocalBusinessSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/#studio`,
    name: 'Spencer Grey Art',
    image: `${baseUrl}/images/og-image.jpg`,
    url: baseUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Seattle',
      addressRegion: 'WA',
      addressCountry: 'US',
    },
    areaServed: 'Worldwide',
    sameAs: [
      'https://instagram.com/spencergreyart',
      'https://twitter.com/spencergreyart',
      'https://www.facebook.com/SpencerGrey333',
    ],
  };
}
