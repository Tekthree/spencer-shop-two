"use client";

import { motion } from 'framer-motion';
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/artwork/product-card";

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
  price: string;
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
              <p className="font-serif text-lg md:text-xl leading-relaxed text-gray-700">
                Spencer Grey creates minimalist art that explores the beauty of negative space. 
                Each limited edition print is crafted with museum-quality materials, 
                bringing gallery-worthy art into your home.
              </p>
            </motion.div>
          </motion.div>
          
          {/* Featured Artworks */}
          <motion.div 
            className="mb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 
              className="font-serif text-2xl mb-8"
              variants={itemVariants}
            >
              Featured Works
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredArtworks.map((artwork, index) => (
                <motion.div 
                  key={artwork.id}
                  variants={itemVariants}
                  custom={index as number}
                >
                  <ProductCard 
                    id={artwork.id}
                    title={artwork.title}
                    price={artwork.price}
                    images={artwork.images}
                    sizes={artwork.sizes}
                  />
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="mt-10 text-center"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="inline-block"
              >
                <Link 
                  href="/shop"
                  className="border border-black px-6 py-3 inline-block hover:bg-black hover:text-white transition-colors"
                >
                  View All Artworks
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Recent Artworks */}
          <motion.div 
            className="mb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 
              className="font-serif text-2xl mb-8"
              variants={itemVariants}
            >
              Recent Additions
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentArtworks.map((artwork, index) => (
                <motion.div 
                  key={artwork.id} 
                  className="relative"
                  variants={itemVariants}
                  custom={index as number}
                >
                  <ProductCard 
                    id={artwork.id}
                    title={artwork.title}
                    price={artwork.price}
                    images={artwork.images}
                    sizes={artwork.sizes}
                    hidePrice={artwork.hidePrice}
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Three Value Propositions */}
      <section className="py-20 md:py-32 px-6 bg-white">
        <motion.div 
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="space-y-6" variants={itemVariants}>
            <motion.div 
              className="inline-flex items-center justify-center w-10 h-10 border border-black rounded-full"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-serif">1</span>
            </motion.div>
            <h3 className="font-serif text-xl">Limited Prints</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Each piece of art is part of an exclusive, limited edition collection. 
              Once sold out, they will never be printed again, making every print a rare addition to your collection.
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
