import { Metadata } from 'next';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import ProductCard from '@/components/artwork/product-card';

// Define types for the content sections
interface ContentSection {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  order: number;
}

interface ArtworkImage {
  url: string;
  alt: string;
  type?: string;
}

interface Artwork {
  id: string;
  title: string;
  images: ArtworkImage[];
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
      return null;
    }

    return data as ContentSection[];
  } catch (err) {
    console.error('Error connecting to Supabase:', err);
    return null;
  }
}

/**
 * Fetches featured artworks for the shop section
 */
const getFeaturedArtworks = async () => {
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
    return data.map((artwork: any, index: number) => {
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
            formattedImages = artwork.images.map((img: any) => ({
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
          
          // If no specific main/hover, try to use any string values
          if (formattedImages.length === 0) {
            Object.entries(artwork.images).forEach(([key, value]: [string, any]) => {
              if (typeof value === 'string') {
                formattedImages.push({
                  url: value,
                  alt: artwork.title || `Artwork ${index + 1}`,
                  type: key === 'main' ? 'main' : key === 'hover' ? 'hover' : 'main'
                });
              }
            });
          }
        }
      }
      
      // If no images were found, add a placeholder
      if (formattedImages.length === 0) {
        formattedImages.push({
          url: '/placeholder.jpg',
          alt: artwork.title || `Artwork ${index + 1}`,
          type: 'main'
        });
      }
      
      return {
        id: artwork.id || `artwork-${index}`,
        title: artwork.title || `Artwork ${index + 1}`,
        images: formattedImages,
        price: prices[index % prices.length] * 100 // Multiply by 100 for cents as ProductCard expects
      };
    });
  } catch (err) {
    console.error('Error in getFeaturedArtworks:', err);
    return getFallbackArtworks();
  }
};

/**
 * Returns fallback artwork data when the database is not available
 */
const getFallbackArtworks = () => {
  // Use local placeholder images
  const fallbackImages = [
    '/placeholder.jpg',
    '/placeholder.jpg',
    '/placeholder.jpg',
    '/placeholder.jpg',
    '/placeholder.jpg'
  ];
  
  // Use fixed prices that match the screenshot
  const prices = [125, 150, 175, 200, 225];
  
  // Create both main and hover images for each artwork
  return fallbackImages.map((image, index) => {
    const title = index === 0 ? 'Dragon\'s Breath' : index === 1 ? 'Elements Collide' : `Abstract Artwork ${index + 1}`;
    
    // Create both main and hover images for better display
    const artworkImages = [
      {
        url: image,
        alt: title,
        type: 'main'
      },
      {
        url: image, // Using same image for hover effect
        alt: `${title} hover view`,
        type: 'hover'
      }
    ];
    
    return {
      id: `fallback-${index + 1}`,
      title: title,
      images: artworkImages,
      price: prices[index % prices.length] * 100 // Multiply by 100 for cents
    };
  });
};

export default async function AboutPage() {
  const sections = await getAboutContent();
  const featuredArtworks = await getFeaturedArtworks();

  // For debugging purposes
  console.log('About page sections:', sections);

  // Create fallback content if no content is found in the database
  const fallbackSections = [
    {
      id: 'statement',
      title: 'Artist Statement',
      content: 'MY WORK IS AN ONGOING EXPLORATION OF THE SPACES WE INHABIT—BOTH PHYSICALLY AND EMOTIONALLY. THROUGH LIMITED EDITION PRINTS, I AIM TO CAPTURE MOMENTS OF QUIET CONTEMPLATION IN OUR INCREASINGLY CHAOTIC WORLD.',
      order: 0,
    },
    {
      id: 'main_image',
      title: 'Main Artist Image',
      content: '',
      image_url: 'https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07?q=80&w=2070&auto=format&fit=crop',
      order: 1,
    },
    {
      id: 'main_description',
      title: 'Main Description',
      content: 'From Seattle to New York, my artwork has been exhibited across the country. Each piece is meticulously printed on archival paper, ensuring rich colors and vibrant details that remain as unfaded passion, connected to fleeting moments and deeper stories.',
      order: 2,
    },
    {
      id: 'gallery_image_1',
      title: 'Gallery Image 1',
      content: '',
      image_url: 'https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=2065&auto=format&fit=crop',
      order: 3,
    },
    {
      id: 'gallery_image_2',
      title: 'Gallery Image 2',
      content: '',
      image_url: 'https://images.unsplash.com/photo-1576504677634-06b2130bd1f3?q=80&w=2070&auto=format&fit=crop',
      order: 4,
    },
    {
      id: 'gallery_image_3',
      title: 'Gallery Image 3',
      content: '',
      image_url: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=2070&auto=format&fit=crop',
      order: 5,
    },
    {
      id: 'secondary_description',
      title: 'Secondary Description',
      content: 'Fueled by my passion for capturing moments of tranquility, I\'ve been creating artwork for over a decade. Each piece represents a personal journey, and most of all, a chance to invite viewers to pause, observe, and be moved by the quiet spaces we often overlook.',
      order: 6,
    },
    {
      id: 'signature',
      title: 'Signature',
      content: '',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Signature_of_Thomas_Jefferson.svg',
      order: 7,
    }
  ];
  
  // Use the database content if available, otherwise use the fallback content
  const allSections = sections && sections.length > 0 ? sections : fallbackSections;

  // Get the main sections
  const statement = allSections.find(s => s.id === 'statement');
  const mainDescription = allSections.find(s => s.id === 'main_description');
  const secondaryDescription = allSections.find(s => s.id === 'secondary_description');
  const mainImage = allSections.find(s => s.id === 'main_image');
  const galleryImage1 = allSections.find(s => s.id === 'gallery_image_1');
  const galleryImage2 = allSections.find(s => s.id === 'gallery_image_2');
  const galleryImage3 = allSections.find(s => s.id === 'gallery_image_3');
  const signature = allSections.find(s => s.id === 'signature');
  
  // For debugging purposes
  console.log('Found sections:', {
    statement: statement?.content?.substring(0, 30),
    mainImage: mainImage?.image_url,
    mainDescription: mainDescription?.content?.substring(0, 30),
    galleryImage1: galleryImage1?.image_url,
    galleryImage2: galleryImage2?.image_url,
    galleryImage3: galleryImage3?.image_url,
    secondaryDescription: secondaryDescription?.content?.substring(0, 30),
    signature: signature?.image_url
  });

  return (
    <main className="container mx-auto px-4 max-w-5xl">
      {/* Artist Statement */}
      {statement && (
        <div className="py-8 md:py-12">
          <h1 className="text-xl md:text-2xl lg:text-3xl uppercase font-medium tracking-wide leading-tight mb-0">
            {statement.content}
          </h1>
        </div>
      )}

      {/* Main Artist Image */}
      {mainImage && (
        <div className="mb-16">
          <div className="aspect-video w-full relative">
            {mainImage.image_url ? (
              <Image
                src={mainImage.image_url}
                alt="Spencer Grey"
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">Artist image not available</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Description */}
      {mainDescription && (
        <div className="mb-12 max-w-2xl mx-auto">
          <h3 className="text-sm leading-relaxed text-center font-light">
            {mainDescription.content}
          </h3>
        </div>
      )}

      {/* Gallery Images */}
      <div className="grid grid-cols-3 gap-4 mb-16">
        {galleryImage1 && (
          <div className="relative">
            <div className="aspect-square relative">
              {galleryImage1.image_url ? (
                <Image
                  src={galleryImage1.image_url}
                  alt="Artwork 1"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Image 1</span>
                </div>
              )}
            </div>
          </div>
        )}
        {galleryImage2 && (
          <div className="relative">
            <div className="aspect-square relative">
              {galleryImage2.image_url ? (
                <Image
                  src={galleryImage2.image_url}
                  alt="Artwork 2"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Image 2</span>
                </div>
              )}
            </div>
          </div>
        )}
        {galleryImage3 && (
          <div className="relative">
            <div className="aspect-square relative">
              {galleryImage3.image_url ? (
                <Image
                  src={galleryImage3.image_url}
                  alt="Artwork 3"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Image 3</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Secondary Description */}
      {secondaryDescription && (
        <div className="mb-8 max-w-2xl mx-auto">
          <h3 className="text-sm leading-relaxed text-center font-light">
            {secondaryDescription.content}
          </h3>
        </div>
      )}

      {/* Signature */}
      {signature && (
        <div className="flex justify-center mb-16">
          <div className="w-24">
            {signature.image_url ? (
              <Image
                src={signature.image_url}
                alt="Spencer Grey signature"
                width={100}
                height={50}
                className="w-full h-auto"
              />
            ) : (
              <div className="w-full h-12 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-xs">Signature</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shop the art prints */}
      <div className="mb-16">
        <h2 className="text-lg font-light mb-4 border-t pt-4">Shop the art prints</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
          {featuredArtworks && featuredArtworks.map((artwork: Artwork) => {
            // Ensure we have a valid artwork with required properties
            if (!artwork || !artwork.id) return null;
            
            // Add tag badge if available
            return (
              <div key={artwork.id} className="relative">
                <ProductCard
                  id={artwork.id}
                  title={artwork.title}
                  images={artwork.images}
                  price={artwork.price}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Section */}
      <div className="text-center mb-16">
        <p className="text-sm mb-4">
          If you have any questions or comments, please don&apos;t hesitate to get in touch with me. I look forward to hearing from you!
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/faq" 
            className="inline-block px-6 py-2 border border-black text-sm hover:bg-black hover:text-white transition-colors duration-300"
          >
            JUMP TO FAQ
          </Link>
          <Link 
            href="/contact" 
            className="inline-block px-6 py-2 border border-black text-sm hover:bg-black hover:text-white transition-colors duration-300"
          >
            CONTACT ME
          </Link>
        </div>
      </div>
    </main>
  );
}