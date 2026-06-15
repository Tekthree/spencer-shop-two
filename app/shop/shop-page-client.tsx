"use client";

import { motion } from 'framer-motion';
import ProductCard from '@/components/artwork/product-card';

// Define types for artwork data
interface ArtworkImage {
  url: string;
  alt: string;
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
  slug: string;
  title: string;
  year: number;
  medium: string;
  images: ArtworkImage[];
  collection_id: string | null;
  sizes?: ArtworkSize[];
}

interface ShopPageClientProps {
  artworks: Artwork[];
  error: string | null;
}

/**
 * Shop Page Client Component
 * Handles animations and rendering of the shop page
 */
export default function ShopPageClient({ artworks, error }: ShopPageClientProps) {
  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  // Staggered animation variants for child elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
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
        delay: i * 0.08
      }
    })
  };

  if (error) {
    return (
      <motion.div 
        className="container mx-auto px-4 py-16 text-center bg-[#F6F4F0]"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        <p className="text-red-500">Something went wrong. Please try again later.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-12 md:py-24 max-w-[1440px] bg-[#F6F4F0]"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* Shop Header */}
      <motion.div
        className="mb-16 border-b border-[#020312]/10 pb-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          className="text-xs uppercase tracking-[0.2em] text-[#020312]/40 mb-4"
          variants={itemVariants}
        >
          Limited Edition
        </motion.p>
        <motion.h1
          className="font-serif text-5xl md:text-7xl text-[#020312] tracking-tight"
          variants={itemVariants}
        >
          The Prints
        </motion.h1>
        <motion.p
          className="text-[#020312]/60 mt-4 max-w-md text-sm leading-relaxed"
          variants={itemVariants}
        >
          Each piece is numbered and printed once. When 150 are sold, the edition closes permanently.
        </motion.p>
      </motion.div>

      {/* Artwork Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {artworks.map((artwork, index) => (
          <motion.div 
            key={artwork.slug} 
            className="artwork-item"
            variants={itemVariants}
            custom={index as number}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <ProductCard
              slug={artwork.slug}
              title={artwork.title}
              images={artwork.images}
              price={artwork.sizes && artwork.sizes.length > 0 ? artwork.sizes[0].price : undefined}
              className="h-full"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Value Proposition Section removed - now in footer */}
    </motion.div>
  );
}
