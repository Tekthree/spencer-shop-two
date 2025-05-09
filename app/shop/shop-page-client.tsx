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
      className="container mx-auto px-4 py-12 md:py-24 max-w-7xl bg-[#F6F4F0]"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* Hero Section */}
      <motion.div 
        className="mb-20 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-4xl md:text-5xl font-serif mb-6 text-[#020312]"
          variants={itemVariants}
        >
          Art Prints
        </motion.h1>
        <motion.p 
          className="text-[#020312]/70 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          Explore my collection of limited edition fine art prints. Each piece is meticulously crafted and individually numbered.
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
            key={artwork.id} 
            className="artwork-item"
            variants={itemVariants}
            custom={index as number}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <ProductCard
              id={artwork.id}
              title={artwork.title}
              images={artwork.images}
              price={artwork.sizes && artwork.sizes.length > 0 ? artwork.sizes[0].price : undefined}
              className="h-full"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Value Proposition Section */}
      <motion.div 
        className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-6 text-center border-t border-b border-[#020312]/10 py-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div 
          className="flex flex-col items-center p-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-wider font-medium text-[#020312]/80">Certificate of Authenticity</p>
        </motion.div>
        <motion.div 
          className="flex flex-col items-center p-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-wider font-medium text-[#020312]/80">Cultural context included</p>
        </motion.div>
        <motion.div 
          className="flex flex-col items-center p-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-wider font-medium text-[#020312]/80">All prints are securely packaged</p>
        </motion.div>
        <motion.div 
          className="flex flex-col items-center p-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-wider font-medium text-[#020312]/80">Limited edition prints</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
