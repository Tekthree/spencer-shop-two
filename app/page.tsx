import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import ProductCard from "@/components/artwork/product-card";

/**
 * Home page for Spencer Grey Artist Website
 * Features a minimalist hero section and gallery grid inspired by Roburico.com
 * @returns Home page component
 */

// Define interfaces for type safety
interface ArtworkImage {
  url: string;
  alt: string; // Make alt required to match ProductCard expectations
  type?: string;
}

interface ArtworkSize {
  size: string;
  price: number;
  edition_limit: number;
  editions_sold: number;
}

interface Artwork {
  id: string;
  title: string;
  description?: string;
  year?: number;
  medium?: string;
  featured?: boolean;
  images: ArtworkImage[];
  sizes: ArtworkSize[];
  created_at?: string;
}

interface FormattedArtwork {
  id: string;
  title: string;
  price: string;
  images: ArtworkImage[];
  sizes: ArtworkSize[];
}

export default async function Home() {
  try {
    // Fetch featured artworks from Supabase
    const { data: featuredArtworksData } = await supabase
      .from('artworks')
      .select('id, title, images, sizes, featured')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(2);

    // Fetch recent artworks from Supabase
    const { data: recentArtworksData } = await supabase
      .from('artworks')
      .select('id, title, images, sizes')
      .order('created_at', { ascending: false })
      .limit(4);

    // Format the featured artworks data
    const formattedFeaturedArtworks: FormattedArtwork[] = featuredArtworksData?.map((artwork: Artwork) => ({
      id: artwork.id,
      title: artwork.title,
      price: artwork.sizes && artwork.sizes.length > 0 
        ? `from ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(artwork.sizes[0].price / 100)}` 
        : 'Price on request',
      // Ensure all images have an alt text to match ProductCard expectations
      images: (artwork.images || []).map(img => ({
        url: img.url,
        alt: img.alt || artwork.title, // Use title as fallback if alt is missing
        type: img.type
      })),
      sizes: artwork.sizes || []
    })) || [];

    // Tags for recent artworks
    const tags = ["Just Dropped", "Newest Addition", "Most Popular", "Must-Have"];

    // Format the recent artworks data
    const formattedRecentArtworks = recentArtworksData?.map((artwork: Artwork, index) => ({
      id: artwork.id,
      title: artwork.title,
      // Ensure all images have an alt text to match ProductCard expectations
      images: (artwork.images || []).map(img => ({
        url: img.url,
        alt: img.alt || artwork.title, // Use title as fallback if alt is missing
        type: img.type
      })),
      sizes: artwork.sizes || [],
      tag: tags[index % tags.length],
    })) || [];

    return (
      <div className="min-h-screen">
        {/* Minimal Hero Section - "gallery vibes. at home." */}
        <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-serif text-5xl md:text-7xl mb-10 max-w-3xl">
              gallery vibes. at home.
            </h1>
            
            {/* Hero Image and Artist Statement */}
            <div className="mb-20">
              <div className="relative w-full aspect-[16/9] mb-10 overflow-hidden">
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="w-full h-full relative">
                    <Image
                      src="/hero-spencer.jpg"
                      alt="Spencer Grey with artwork"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-md shadow-sm">
                      <Link href="/shop" className="text-sm font-medium flex items-center">
                        SHOP THE ART PRINTS <span className="ml-1">+</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="max-w-4xl mx-auto text-center">
                <p className="font-serif text-xl md:text-2xl leading-relaxed">
                  Art transcends mere visual perception—it&apos;s about the emotions it evokes. 
                  I&apos;m Spencer Grey, an artist exploring the boundaries between chaos and order. 
                  Let&apos;s connect through bold strokes and vibrant worlds.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
              {formattedFeaturedArtworks && formattedFeaturedArtworks.length > 0 ? (
                formattedFeaturedArtworks.map((artwork) => (
                  <div key={artwork.id} className="space-y-3">
                    <ProductCard
                      id={artwork.id}
                      title={artwork.title}
                      images={artwork.images}
                      price={artwork.sizes && artwork.sizes.length > 0 ? artwork.sizes[0].price : undefined}
                      className="aspect-[4/5] h-full"
                    />
                  </div>
                ))
              ) : (
                // Fallback if no featured artworks are found
                Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <div className="aspect-[4/5] w-full bg-gray-100 flex items-center justify-center mb-6">
                      <span className="text-gray-400 font-serif italic">Coming Soon</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-serif text-xl">Featured Artwork</span>
                      <span className="text-sm">from $175.00</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Artist Statement Section */}
        <section className="py-20 md:py-32 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl leading-relaxed mb-12">
              Art transcends mere visual perception—it&apos;s about the emotions it evokes. I&apos;m Spencer Grey, 
              an artist focused on creating minimalist works that invite contemplation and connection.
            </h2>
            <Link href="/about" className="text-sm underline underline-offset-4">
              @spencergrey
            </Link>
          </div>
        </section>

        {/* Featured Works - Horizontal Scroll on Mobile */}
        <section className="py-20 md:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
              {formattedRecentArtworks && formattedRecentArtworks.length > 0 ? (
                formattedRecentArtworks.map((artwork) => (
                  <div key={artwork.id} className="space-y-4">
                    <ProductCard
                      id={artwork.id}
                      title={artwork.title}
                      images={artwork.images}
                      price={artwork.sizes && artwork.sizes.length > 0 ? artwork.sizes[0].price : undefined}
                    />
                    <div className="text-xs uppercase tracking-wider mb-1">{artwork.tag}</div>
                  </div>
                ))
              ) : (
                // Fallback if no recent artworks are found
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-4">
                    <div className="aspect-[4/5] w-full bg-gray-100 flex items-center justify-center mb-4">
                      <span className="text-gray-400 font-serif italic">Coming Soon</span>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider mb-1">{tags[index]}</div>
                      <span className="font-serif text-lg">New Artwork</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Three Value Propositions */}
        <section className="py-20 md:py-32 px-6 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-10 h-10 border border-black rounded-full">
                <span className="font-serif">1</span>
              </div>
              <h3 className="font-serif text-xl">Limited Prints</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Each piece of art is part of an exclusive, limited edition collection. 
                Once sold out, they will never be printed again, making every print a rare addition to your collection.
              </p>
              <Link 
                href="/shop"
                className="inline-block border border-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors"
              >
                Shop Now
              </Link>
            </div>
            
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-10 h-10 border border-black rounded-full">
                <span className="font-serif">2</span>
              </div>
              <h3 className="font-serif text-xl">Museum Quality</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Each print is crafted with the highest quality in mind. Using premium paper and the giclée printing process, 
                we guarantee rich, vibrant colors and a level of detail that will last for generations.
              </p>
              <Link 
                href="/shop"
                className="inline-block border border-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors"
              >
                Shop Now
              </Link>
            </div>
            
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-10 h-10 border border-black rounded-full">
                <span className="font-serif">3</span>
              </div>
              <h3 className="font-serif text-xl">Print To Order</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every print is made-to-order, meaning it&apos;s freshly printed once you place your order. 
                This allows us to minimize waste and stay true to our commitment to sustainability.
              </p>
              <Link 
                href="/shop"
                className="inline-block border border-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </section>

        {/* Artist Quote */}
        <section className="py-20 md:py-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed mb-6">
              &ldquo;My works explore the beauty of simplicity and the power of negative space. 
              I believe that art should create a moment of pause in our busy lives—a chance to 
              breathe and reflect on what truly matters.&rdquo;
            </blockquote>
            <cite className="text-sm font-medium not-italic">Spencer Grey</cite>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Error loading home page:', error);
    return (
      <div className="min-h-screen px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-3xl mb-6">Gallery coming soon</h1>
          <p>We&apos;re currently updating our artwork collection. Please check back later.</p>
        </div>
      </div>
    );
  }
}
