"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { formatPrice, ensureNumericPrice } from '@/components/artwork/price-helper';

// Define a client-side artwork type that matches what we get from the home page client
type ClientArtwork = {
  id: string;
  title: string;
  price: string | number;
  images: {
    url: string;
    alt: string;
    type?: string;
  }[];
  sizes?: {
    size: string;
    price: number;
    dimensions?: string;
  }[];
  tag?: string;
  hidePrice?: boolean;
};

interface ArtworkGridProps {
  artworks: ClientArtwork[];
}

/**
 * ArtworkGrid component for displaying artworks in a simple 2x2 grid
 * 
 * @param artworks - Array of artwork objects to display
 * @returns Artwork grid component
 */
export default function ArtworkGrid({ artworks }: ArtworkGridProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: i * 0.1
      }
    })
  };

  // Ensure we have exactly 4 artworks to display
  const artworksToDisplay = artworks.slice(0, 4);
  
  // We'll use the imported formatPrice and ensureNumericPrice functions

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="artwork-grid-section"
    >
      <div className="container-spencer">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-16 lg:gap-20">
          {artworksToDisplay.map((artwork, index) => {
            // Get the main and hover images
            const images = artwork.images || [];
            const mainImage = images.find(img => img.type === 'main') || images[0] || { url: '', alt: artwork.title };
            const hoverImage = images.find(img => img.type === 'hover') || images[1] || mainImage;
            
            // Get price from first size or from artwork price
            const price = artwork.sizes && artwork.sizes.length > 0 
              ? artwork.sizes[0].price 
              : artwork.price;
            
            return (
              <motion.div 
                key={artwork.id}
                variants={itemVariants}
                custom={index}
                className="artwork-card"
              >
                <Link href={`/artwork/${artwork.id}`} className="block relative">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {/* Main Image */}
                    <Image 
                      src={mainImage.url} 
                      alt={mainImage.alt || artwork.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-opacity duration-300"
                    />
                    
                    {/* Hover Image */}
                    <Image 
                      src={hoverImage.url} 
                      alt={hoverImage.alt || `${artwork.title} - hover view`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover absolute top-0 left-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                  
                  {/* Title and Price */}
                  <div className="flex justify-between items-center mt-4">
                    <h3 className="font-serif text-lg">{artwork.title}</h3>
                    <p className="text-sm">{formatPrice(ensureNumericPrice(price))}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        
        {/* View All Button */}
        <motion.div 
          className="text-center mt-12 md:mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Link 
            href="/shop"
            className="shop-button inline-flex items-center gap-2"
            style={{ borderRadius: '6px' }}
            aria-label="View all artworks in the shop"
          >
            <span>View All Artworks</span>
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
