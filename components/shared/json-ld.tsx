/**
 * Component for rendering JSON-LD structured data as part of the initial HTML response.
 * The script is rendered server-side so search engines receive the schema without waiting
 * for client-side hydration.
 */
type JsonLdData = Record<string, unknown>;

const jsonEncode = (data: JsonLdData) =>
  JSON.stringify(data, null, 0)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

export default function JsonLd({ data, id }: { data: JsonLdData; id?: string }) {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonEncode(data) }}
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
export function organizationJsonLd() {
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
    foundingLocation: {
      '@type': 'Place',
      name: 'Seattle, Washington',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Seattle',
        addressRegion: 'WA',
        addressCountry: 'US',
      },
    },
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
 * Creates person structured data describing the artist.
 */
export function artistJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  const image = `${baseUrl}/hero-spencer.jpg`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${baseUrl}/#person`,
    name: 'Spencer Grey',
    url: baseUrl,
    image,
    jobTitle: 'Visual Artist',
    worksFor: {
      '@id': `${baseUrl}/#organization`,
    },
    sameAs: [
      'https://instagram.com/spencergreyart',
      'https://twitter.com/spencergreyart',
      'https://www.facebook.com/SpencerGrey333',
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

export function productJsonLd(artwork: ArtworkData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spencergrey.com';
  const slugOrId = artwork.slug || artwork.id;

  let imageUrl = `${baseUrl}/images/og-image.jpg`;

  if (artwork.images) {
    if (Array.isArray(artwork.images) && artwork.images.length > 0) {
      const firstImage = artwork.images[0];
      if (typeof firstImage === 'string') {
        imageUrl = firstImage;
      } else if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
        imageUrl = String(firstImage.url);
      }
    } else if (typeof artwork.images === 'string') {
      imageUrl = artwork.images;
    } else if (typeof artwork.images === 'object' && 'url' in artwork.images) {
      const url = (artwork.images as { url?: string }).url;
      if (typeof url === 'string') {
        imageUrl = url;
      }
    }
  }

  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;

  const prices = artwork.sizes?.map((size) => size.price) || [];
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const highestPrice = prices.length > 0 ? Math.max(...prices) : lowestPrice;

  const formattedLowPrice = (lowestPrice / 100).toFixed(2);
  const formattedHighPrice = (highestPrice / 100).toFixed(2);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/artwork/${slugOrId}#product`,
    name: artwork.title,
    image: absoluteImageUrl,
    description:
      artwork.description || `Limited edition fine art print by Spencer Grey: ${artwork.title}`,
    sku: `SGP-${artwork.id}`,
    mpn: `SGP-${artwork.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Spencer Grey Art',
      '@id': `${baseUrl}/#organization`,
    },
    offers: {
      '@type': 'AggregateOffer',
      url: `${baseUrl}/artwork/${slugOrId}`,
      priceCurrency: 'USD',
      lowPrice: formattedLowPrice,
      highPrice: formattedHighPrice,
      offerCount: prices.length || 1,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Spencer Grey Art',
      },
    },
    isAccessoryOrSparePartFor: {
      '@type': 'CreativeWork',
      name: 'Limited edition fine art print',
    },
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
