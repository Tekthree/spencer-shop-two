"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';

interface ArtworkHeroBannerProps {
  images: { url: string; alt: string }[];
  title?: string;
}

/**
 * ArtworkHeroBanner Component
 * Creates a full-width banner with two images at 50% width and a large heading overlay
 * Inspired by Roburico.com design
 */
export default function ArtworkHeroBanner({ images, title }: ArtworkHeroBannerProps) {
  // Ensure we have at least two images to display
  const displayImages = images.slice(0, 2);
  
  // If we don't have enough images, duplicate the first one
  if (displayImages.length === 1) {
    displayImages.push(displayImages[0]);
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden mb-16"
    >
      {/* Image Container */}
      <div className="flex h-full w-full">
        {/* Left Image */}
        <div className="w-1/2 h-full relative">
          <Image 
            src={displayImages[0].url}
            alt={displayImages[0].alt || title || "Artwork display"}
            fill
            sizes="50vw"
            priority
            className="object-cover"
          />
        </div>
        
        {/* Right Image */}
        <div className="w-1/2 h-full relative">
          <Image 
            src={displayImages[1].url}
            alt={displayImages[1].alt || title || "Artwork display"}
            fill
            sizes="50vw"
            priority
            className="object-cover"
          />
        </div>
      </div>
      
      {/* Overlay Text */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-white text-[8vw] md:text-[6vw] font-serif font-bold tracking-tight text-center px-4 uppercase"
          style={{ textShadow: "0px 2px 20px rgba(0, 0, 0, 0.3)" }}
        >
          {title || "Limited Edition Art"}
        </motion.h1>
      </div>
      
      {/* Subtle Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 z-0"></div>
    </motion.div>
  );
}
