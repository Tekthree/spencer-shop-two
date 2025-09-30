import { notFound } from 'next/navigation';

import ArtworkDetailClient from './artwork-detail-client';
import JsonLd, { breadcrumbJsonLd, productJsonLd } from '@/components/shared/json-ld';
import { supabase } from '@/lib/supabase/client';

interface SizeOption {
  size: string;
  price: number;
  edition_limit: number;
  editions_sold: number;
}

interface ArtworkImage {
  url: string;
  alt: string;
}

interface ArtworkRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  year: number;
  medium: string;
  collection_id: string | null;
  collection_name?: string | null;
  featured: boolean;
  images: Array<{ url?: string; alt?: string } | string> | string | null;
  sizes: SizeOption[] | null;
  created_at: string;
  collections?: {
    name?: string | null;
  } | null;
}

interface ArtworkData {
  id: string;
  slug: string;
  title: string;
  description: string;
  year: number;
  medium: string;
  collection_id: string | null;
  collection_name?: string;
  featured: boolean;
  images: ArtworkImage[];
  sizes: SizeOption[];
  created_at: string;
}

async function fetchArtworkBySlug(slug: string): Promise<{ artwork: ArtworkData | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*, collections(name)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Error fetching artwork', error);
      return { artwork: null, error: 'Failed to load artwork data.' };
    }

    if (!data) {
      return { artwork: null, error: 'Artwork not found.' };
    }

    const record = data as ArtworkRecord;

    const formattedImages: ArtworkImage[] = [];

    if (Array.isArray(record.images)) {
      record.images.forEach((image) => {
        if (typeof image === 'string') {
          formattedImages.push({ url: image, alt: record.title });
        } else if (image && typeof image === 'object') {
          formattedImages.push({
            url: image.url ?? '',
            alt: image.alt ?? record.title,
          });
        }
      });
    } else if (typeof record.images === 'string') {
      formattedImages.push({ url: record.images, alt: record.title });
    }

    const sanitizedImages = formattedImages.filter((image) => Boolean(image.url));

    if (sanitizedImages.length === 0) {
      sanitizedImages.push({ url: '/images/og-image.jpg', alt: record.title });
    }

    const formattedArtwork: ArtworkData = {
      id: record.id,
      slug: record.slug,
      title: record.title,
      description: record.description,
      year: record.year,
      medium: record.medium,
      collection_id: record.collection_id,
      collection_name: record.collection_name ?? record.collections?.name ?? undefined,
      featured: record.featured,
      images: sanitizedImages,
      sizes: record.sizes || [],
      created_at: record.created_at,
    };

    return { artwork: formattedArtwork, error: null };
  } catch (err) {
    console.error('Unexpected error fetching artwork', err);
    return { artwork: null, error: 'Unexpected error loading artwork.' };
  }
}

interface ArtworkPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArtworkDetailPage({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const { artwork, error } = await fetchArtworkBySlug(slug);

  if (!artwork && !error) {
    notFound();
  }

  const breadcrumbItems = artwork
    ? [
        { name: 'Home', url: '/' },
        { name: 'Shop', url: '/shop' },
        { name: artwork.title, url: `/artwork/${artwork.slug}` },
      ]
    : [];

  return (
    <>
      {artwork && (
        <>
          <JsonLd id={`product-${artwork.slug}`} data={productJsonLd(artwork)} />
          <JsonLd id={`breadcrumb-${artwork.slug}`} data={breadcrumbJsonLd(breadcrumbItems)} />
        </>
      )}
      <ArtworkDetailClient artwork={artwork} error={error} />
    </>
  );
}
