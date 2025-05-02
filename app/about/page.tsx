import { Metadata } from 'next';
import { supabase } from '@/lib/supabase/client';
import { ArtworkImage } from '@/types/artwork';
import AboutPageClient from './about-page-client';

// Define types for the content sections
interface ContentSection {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  order: number;
}

interface AboutPageArtwork {
  id: string;
  title: string;
  images: {
    url: string;
    alt: string;
    type: string;
  }[];
  price?: number;
  featured?: boolean;
  tag?: string;
}

export const metadata: Metadata = {
  title: 'My Story | Spencer Grey',
  description: 'Learn about Spencer Grey, the artist behind the vibrant and expressive artwork.',
};

/**
 * Fetches about page content from Supabase
 */
async function getAboutContent() {
  try {
    const { data, error } = await supabase
      .from('page_content')
      .select('*')
      .eq('page', 'about')
      .order('order');

    if (error) {
      console.error('Error fetching about page content:', error);
      return getFallbackContentSections();
    }
    
    if (!data || data.length === 0) {
      console.log('No about page content found, using fallback content');
      return getFallbackContentSections();
    }

    return data as ContentSection[];
  } catch (err) {
    console.error('Error connecting to Supabase:', err);
    return getFallbackContentSections();
  }
}

/**
 * Returns fallback content sections when the database is not available
 */
const getFallbackContentSections = (): ContentSection[] => {
  return [
    {
      id: 'hero-1',
      title: 'Hero',
      content: "Hi, I'm Spencer Grey. I create vibrant, expressive artwork that captures the essence of emotion through color and form.",
      image_url: '/images/about/spencer-studio.jpg',
      order: 1
    },
    {
      id: 'artist-bio-1',
      title: 'Artist Bio',
      content: "My journey as an artist began over a decade ago, exploring the boundaries between abstract expressionism and figurative art. I draw inspiration from the natural world, human emotions, and the interplay of light and shadow. Each piece I create is a conversation between color, texture, and form—inviting viewers to find their own meaning within the layers.",
      image_url: '/images/about/artist-portrait.jpg',
      order: 2
    },
    {
      id: 'gallery-image-1',
      title: 'Gallery Image 1',
      content: '',
      image_url: '/images/about/gallery1.jpg',
      order: 3
    },
    {
      id: 'gallery-image-2',
      title: 'Gallery Image 2',
      content: '',
      image_url: '/images/about/gallery2.jpg',
      order: 4
    },
    {
      id: 'gallery-image-3',
      title: 'Gallery Image 3',
      content: '',
      image_url: '/images/about/gallery3.jpg',
      order: 5
    },
    {
      id: 'secondary-desc-1',
      title: 'Secondary Description',
      content: "My studio is located in the Pacific Northwest, where the ever-changing landscape and light inform my work. I believe art should be accessible and meaningful to everyone, which is why I offer limited edition prints alongside my original pieces.",
      image_url: '',
      order: 6
    },
    {
      id: 'signature-1',
      title: 'Signature',
      content: '',
      image_url: '/images/signature.png',
      order: 7
    }
  ];
}

/**
 * Fetches featured artworks for the shop section
 */
const getFeaturedArtworks = async (): Promise<AboutPageArtwork[]> => {
  try {
    // Get all artworks instead of just featured ones to display more in the Shop section
    const { data, error } = await supabase
      .from('artworks')
      .select('id, title, images')
      .order('created_at', { ascending: false })
      .limit(10); // Increased limit to show more artworks

    if (error) {
      console.error('Error fetching featured artworks:', error);
      return getFallbackArtworks();
    }

    // Format artworks for ProductCard component
    return data.map((artwork, index: number) => {
      // Set fixed prices that match the screenshot
      const prices = [125, 150, 175, 200, 225];
      
      // Format images for ProductCard component exactly as done in the home page
      let formattedImages: ArtworkImage[] = [];
      
      // Check if artwork has images in the expected format
      if (artwork.images) {
        // Handle different image formats from Supabase
        if (Array.isArray(artwork.images)) {
          // If images is an array of objects with url property
          if (typeof artwork.images[0] === 'object' && artwork.images[0].url) {
            formattedImages = artwork.images.map((img) => ({
              url: img.url,
              alt: img.alt || artwork.title || `Artwork ${index + 1}`,
              type: img.type || 'main'
            }));
          } 
          // If images is an array of strings
          else if (typeof artwork.images[0] === 'string') {
            formattedImages = artwork.images.map((url: string, i: number) => ({
              url: url,
              alt: artwork.title || `Artwork ${index + 1}`,
              type: i === 0 ? 'main' : 'hover'
            }));
          }
        } 
        // Handle case where images is a single string
        else if (typeof artwork.images === 'string') {
          formattedImages = [{
            url: artwork.images,
            alt: artwork.title || `Artwork ${index + 1}`,
            type: 'main'
          }];
        }
        // Handle case where images is an object with main property
        else if (typeof artwork.images === 'object') {
          // Try to extract main image
          if (artwork.images.main) {
            formattedImages.push({
              url: artwork.images.main,
              alt: artwork.title || `Artwork ${index + 1}`,
              type: 'main'
            });
          }
          
          // Try to extract hover image
          if (artwork.images.hover) {
            formattedImages.push({
              url: artwork.images.hover,
              alt: `${artwork.title || `Artwork ${index + 1}`} hover view`,
              type: 'hover'
            });
          }
          
          // Try to extract detail images
          if (artwork.images.details && Array.isArray(artwork.images.details)) {
            artwork.images.details.forEach((url: string, i: number) => {
              formattedImages.push({
                url: url,
                alt: `${artwork.title || `Artwork ${index + 1}`} detail view ${i + 1}`,
                type: 'detail'
              });
            });
          }
        }
      }
      
      // If no images were found, use a placeholder
      if (formattedImages.length === 0) {
        formattedImages = [{
          url: '/placeholder-artwork.jpg',
          alt: artwork.title || `Artwork ${index + 1}`,
          type: 'main'
        }];
      }
      
      // Return formatted artwork with a price from our fixed price array
      return {
        id: artwork.id,
        title: artwork.title,
        images: formattedImages,
        price: prices[index % prices.length] * 100, // Convert to cents as expected by ProductCard
        tag: index === 0 ? 'New' : index === 1 ? 'Popular' : undefined
      };
    });
  } catch (err) {
    console.error('Error fetching featured artworks:', err);
    return getFallbackArtworks();
  }
};

/**
 * Returns fallback artwork data when the database is not available
 */
const getFallbackArtworks = (): AboutPageArtwork[] => {
  // Create some placeholder artworks
  return Array(4).fill(null).map((_, index) => ({
    id: `fallback-${index + 1}`,
    title: `Artwork ${index + 1}`,
    images: [
      {
        url: '/placeholder-artwork.jpg',
        alt: `Artwork ${index + 1}`,
        type: 'main'
      }
    ],
    price: [125, 150, 175, 200][index % 4] * 100,
    tag: index === 0 ? 'New' : undefined
  }));
};

export default async function AboutPage() {
  // Fetch about page content
  const contentSections = await getAboutContent();
  
  // Content sections fetched successfully

  // Fetch featured artworks
  const featuredArtworks = await getFeaturedArtworks();

  // Use the client component to handle animations and rendering
  return <AboutPageClient contentSections={contentSections} featuredArtworks={featuredArtworks} />;
}
