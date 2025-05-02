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
        className="container mx-auto px-4 py-16 text-center"
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
      className="container mx-auto px-4 py-8 md:py-16 max-w-7xl"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* Hero Section */}
      <motion.div 
        className="mb-16 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-3xl md:text-4xl font-serif mb-6 uppercase tracking-wider"
          variants={itemVariants}
        >
          SHOP ALL
        </motion.h1>
        <motion.div 
          className="max-w-3xl mx-auto border-b border-gray-200 pb-8"
          variants={itemVariants}
        >
          <p className="text-gray-600 text-sm">
            Browse Spencer Grey&apos;s complete collection of limited edition art prints. 
            Each piece is printed on archival quality paper using eco-friendly inks.
          </p>
        </motion.div>
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
            <motion.div 
              className="mt-2 flex justify-between items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
            >
              <p className="text-sm font-light">{artwork.title}</p>
              <p className="text-sm text-gray-500 font-light">
                {artwork.sizes && artwork.sizes.length > 0 && 
                  `from $${(artwork.sizes[0].price / 100).toFixed(2)}`}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Value Proposition Section */}
      <motion.div 
        className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-4 text-center border-t border-b border-gray-200 py-8"
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
          <p className="text-xs uppercase tracking-wider">Certificate of Authenticity</p>
        </motion.div>
        <motion.div 
          className="flex flex-col items-center p-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-wider">Cultural context included</p>
        </motion.div>
        <motion.div 
          className="flex flex-col items-center p-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-wider">All prints are securely packaged</p>
        </motion.div>
        <motion.div 
          className="flex flex-col items-center p-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-wider">Limited edition prints</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
