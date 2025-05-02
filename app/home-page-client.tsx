"use client";

import { motion } from 'framer-motion';
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/artwork/product-card";
import { ensureNumericPrice } from "@/components/artwork/price-helper";

// Define types for artwork data
type ArtworkImage = {
  url: string;
  alt: string;
  type?: string;
};

type ArtworkSize = {
  size: string;
  price: number;
  dimensions?: string;
};

type Artwork = {
  id: string;
  title: string;
  price: string | number;
  images: ArtworkImage[];
  sizes: ArtworkSize[];
  tag?: string;
  hidePrice?: boolean;
};

// Define the props interface for the client component
interface HomePageClientProps {
  featuredArtworks: Artwork[];
  recentArtworks: Artwork[];
}

/**
 * HomePageClient component
 * Client component for the home page with animations
 * This follows Next.js 15 best practices by keeping animations in client components
 */
export default function HomePageClient({ featuredArtworks, recentArtworks }: HomePageClientProps) {
  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.7, // Increased duration for more noticeable animation
        ease: [0.22, 1, 0.36, 1] // Custom easing for subtle, elegant motion
      }
    }
  };
  
  // Staggered animation variants for child elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Delay between each child animation
        delayChildren: 0.3 // Delay before starting child animations
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: i * 0.1
      }
    })
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="min-h-screen"
    >
      {/* Minimal Hero Section - "gallery vibes. at home." */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl mb-10 max-w-3xl">
            gallery vibes. at home.
          </h1>
          
          {/* Hero Image and Artist Statement */}
          <motion.div 
            className="mb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="relative w-full aspect-[16/9] mb-10 overflow-hidden"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="w-full h-full relative">
                  <Image
                    src="/hero-spencer.jpg"
                    alt="Spencer Grey with artwork"
                    fill
                    className="object-cover"
                  />
                  <motion.div 
                    className="absolute top-4 right-4 bg-white px-4 py-2 rounded-md shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href="/shop" className="text-sm font-medium flex items-center">
                      Shop the Art Prints
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            {/* Artist Statement */}
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              variants={itemVariants}
            >
              <p className="font-serif text-lg md:text-xl leading-relaxed">
                I create art that captures the essence of emotion through vibrant colors and expressive forms. 
                Each piece is a journey into the interplay between light, shadow, and the human experience.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Featured Artworks Section */}
      <section className="py-16 md:py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Featured Artworks</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore my latest creations, each one telling its own unique story through color and form.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {featuredArtworks.map((artwork, index) => (
              <motion.div 
                key={artwork.id}
                variants={itemVariants}
                custom={index as number}
              >
                <ProductCard 
                  id={artwork.id}
                  title={artwork.title}
                  price={ensureNumericPrice(artwork.price)}
                  images={artwork.images}
                />
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link 
              href="/shop"
              className="inline-block border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors"
            >
              View All Artworks
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Recent Artworks Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Latest Releases</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover my most recent work, fresh from the studio and ready to transform your space.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {recentArtworks.map((artwork, index) => (
              <motion.div 
                key={artwork.id}
                variants={itemVariants}
                custom={index as number}
                className="relative"
              >
                <ProductCard 
                  id={artwork.id}
                  title={artwork.title}
                  price={ensureNumericPrice(artwork.price)}
                  images={artwork.images}
                />
                {artwork.tag && (
                  <motion.div 
                    className="absolute top-4 left-4 bg-white px-3 py-1 text-xs font-medium"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                  >
                    {artwork.tag}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Three Column Feature Section */}
      <section className="py-16 md:py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Why Collect My Art</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each piece is crafted with care and attention to detail, ensuring you receive a work of art that will be treasured for generations.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div className="space-y-6" variants={itemVariants}>
              <motion.div 
                className="inline-flex items-center justify-center w-10 h-10 border border-black rounded-full"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-serif">1</span>
              </motion.div>
              <h3 className="font-serif text-xl">Limited Editions</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                All prints are produced in limited quantities, ensuring the value and exclusivity of your artwork. 
                Each piece is numbered and accompanied by a certificate of authenticity.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="inline-block"
              >
                <Link 
                  href="/shop"
                  className="inline-block border border-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors"
                >
                  Shop Now
                </Link>
              </motion.div>
            </motion.div>
            <motion.div className="space-y-6" variants={itemVariants}>
              <motion.div 
                className="inline-flex items-center justify-center w-10 h-10 border border-black rounded-full"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-serif">2</span>
              </motion.div>
              <h3 className="font-serif text-xl">Museum Quality</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Each print is crafted with the highest quality in mind. Using premium paper and the giclée printing process, 
                we guarantee rich, vibrant colors and a level of detail that will last for generations.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="inline-block"
              >
                <Link 
                  href="/shop"
                  className="inline-block border border-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors"
                >
                  Shop Now
                </Link>
              </motion.div>
            </motion.div>
            <motion.div className="space-y-6" variants={itemVariants}>
              <motion.div 
                className="inline-flex items-center justify-center w-10 h-10 border border-black rounded-full"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-serif">3</span>
              </motion.div>
              <h3 className="font-serif text-xl">Print To Order</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every print is made-to-order, meaning it&apos;s freshly printed once you place your order. 
                This allows us to minimize waste and stay true to our commitment to sustainability.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="inline-block"
              >
                <Link 
                  href="/shop"
                  className="inline-block border border-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors"
                >
                  Shop Now
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Artist Quote */}
      <section className="py-20 md:py-32 px-6">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed mb-6">
            &ldquo;My works explore the beauty of simplicity and the power of negative space. 
            I believe that art should create a moment of pause in our busy lives—a chance to 
            breathe and reflect on what truly matters.&rdquo;
          </blockquote>
          <motion.cite 
            className="text-sm font-medium not-italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Spencer Grey
          </motion.cite>
        </motion.div>
      </section>
    </motion.div>
  );
}
