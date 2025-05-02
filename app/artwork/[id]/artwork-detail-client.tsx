"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import RelatedArtworks from '@/components/artwork/related-artworks';

// Define TypeScript interfaces for our data models
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

interface Artwork {
  id: string;
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

interface ArtworkDetailClientProps {
  artwork: Artwork | null;
  error: string | null;
  formatPrice: (cents: number) => string;
  isAvailable: (size: SizeOption) => boolean;
  handleSizeSelect: (size: SizeOption) => void;
  handleAddToCart: () => void;
  selectedSize: SizeOption | null;
}

/**
 * Artwork Detail Client Component
 * Handles animations and rendering of the artwork detail page
 */
export default function ArtworkDetailClient({
  artwork,
  error,
  formatPrice,
  isAvailable,
  handleSizeSelect,
  handleAddToCart,
  selectedSize
}: ArtworkDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState<number>(0);

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

  // Image gallery animation variants
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  if (error) {
    return (
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        <p className="text-red-500">Something went wrong. Please try again later.</p>
        <Link href="/shop" className="mt-4 inline-block text-black underline">
          Return to Shop
        </Link>
      </motion.div>
    );
  }

  if (!artwork) {
    return (
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        <p>Artwork not found.</p>
        <Link href="/shop" className="mt-4 inline-block text-black underline">
          Return to Shop
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* Breadcrumbs */}
      <motion.div 
        className="mb-6 text-sm text-gray-500"
        variants={itemVariants}
      >
        <Link href="/shop" className="hover:text-black">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-black">{artwork.title}</span>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left column - Artwork images */}
        <motion.div 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main image */}
          <motion.div 
            className="relative aspect-[4/3] overflow-hidden bg-gray-100"
            variants={imageVariants}
            key={selectedImage}
            initial="hidden"
            animate="visible"
          >
            {artwork.images && artwork.images.length > 0 && (
              <Image
                src={artwork.images[selectedImage].url}
                alt={artwork.images[selectedImage].alt || artwork.title}
                fill
                className="object-contain"
              />
            )}
          </motion.div>

          {/* Thumbnail gallery */}
          {artwork.images && artwork.images.length > 1 && (
            <motion.div 
              className="grid grid-cols-5 gap-2"
              variants={containerVariants}
            >
              {artwork.images.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden border-2 ${
                    selectedImage === index ? 'border-black' : 'border-transparent'
                  }`}
                  variants={itemVariants}
                  custom={index as number}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `${artwork.title} - View ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Right column - Artwork details */}
        <motion.div 
          className="flex flex-col"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Title and collection */}
          <motion.div className="mb-6" variants={itemVariants}>
            <h1 className="text-3xl font-serif mb-2">{artwork.title}</h1>
            {artwork.collection_name && (
              <p className="text-gray-600">From the {artwork.collection_name} collection</p>
            )}
          </motion.div>

          {/* Artwork details */}
          <motion.div className="mb-8 text-gray-700 space-y-4" variants={itemVariants}>
            <p>{artwork.description}</p>
          </motion.div>

          {/* Size selection */}
          <motion.div className="mb-8" variants={itemVariants}>
            <h2 className="text-lg font-medium mb-3">Select Size</h2>
            <div className="grid grid-cols-2 gap-3">
              {artwork.sizes.map((size, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSizeSelect(size)}
                  disabled={!isAvailable(size)}
                  className={`border rounded-md py-3 px-4 flex flex-col items-center justify-center transition-colors ${
                    selectedSize === size
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${!isAvailable(size) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  variants={itemVariants}
                  custom={index as number}
                  whileHover={isAvailable(size) ? { y: -2, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" } : {}}
                  whileTap={isAvailable(size) ? { y: 0, boxShadow: "0 0px 0px rgba(0,0,0,0)" } : {}}
                >
                  <span className="font-medium">{size.size}</span>
                  <span className="text-gray-600 text-sm mt-1">
                    {formatPrice(size.price)}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {size.editions_sold} / {size.edition_limit} sold
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Price and add to cart */}
          <motion.div 
            className="border-t border-gray-200 pt-6"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-2xl font-medium">
                {selectedSize ? formatPrice(selectedSize.price) : 'Select a size'}
              </span>
              <span className="text-sm text-gray-600">
                Limited Edition Print
              </span>
            </div>

            <motion.button
              onClick={handleAddToCart}
              disabled={!selectedSize || !isAvailable(selectedSize)}
              className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={selectedSize && isAvailable(selectedSize) ? { scale: 1.02 } : {}}
              whileTap={selectedSize && isAvailable(selectedSize) ? { scale: 0.98 } : {}}
            >
              {!selectedSize
                ? 'Select a size'
                : !isAvailable(selectedSize)
                ? 'Sold out'
                : 'Add to Cart'}
            </motion.button>

            {/* Additional info */}
            <motion.div 
              className="mt-6 space-y-4 text-sm text-gray-600"
              variants={containerVariants}
            >
              <motion.div 
                className="flex items-start"
                variants={itemVariants}
                custom={0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>Free shipping on all orders</p>
              </motion.div>
              <motion.div 
                className="flex items-start"
                variants={itemVariants}
                custom={1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p>Certificate of authenticity included</p>
              </motion.div>
              <motion.div 
                className="flex items-start"
                variants={itemVariants}
                custom={2}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <p>Printed on archival quality paper using eco-friendly inks</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Related Artworks */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <RelatedArtworks 
          currentArtworkId={artwork.id} 
          collectionId={artwork.collection_id} 
          limit={4} 
        />
      </motion.div>
    </motion.div>
  );
}
