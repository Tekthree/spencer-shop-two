"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Marquee, { MarqueeItem, MarqueeArtwork } from '@/components/ui/marquee';
import { Artwork, ArtworkImage } from '@/types/artwork';

interface HeroMarqueeProps {
  artworks: Artwork[];
  textSegments?: string[];
}

/**
 * HeroMarquee component for the home page
 * Features an infinitely scrolling header with artwork between text
 * @param artworks - Array of artworks to display in the marquee
 * @param textSegments - Optional array of text segments to display in the marquee
 */
export default function HeroMarquee({ artworks, textSegments: customTextSegments }: HeroMarqueeProps) {
  // Extract images from artworks
  const extractedImages: ArtworkImage[] = [];
  
  // Safely extract images from artworks
  artworks.forEach((artwork) => {
    if (artwork.images && Array.isArray(artwork.images) && artwork.images.length > 0) {
      // Try to find a main image first
      const mainImage = artwork.images.find((img) => img && typeof img === 'object' && img.type === 'main');
      
      // If main image found, use it; otherwise use the first image
      if (mainImage && typeof mainImage === 'object') {
        extractedImages.push(mainImage);
      } else if (artwork.images[0] && typeof artwork.images[0] === 'object') {
        extractedImages.push(artwork.images[0]);
      }
    }
  });
  
  // Default text segments if none provided
  const defaultTextSegments = [
    "LIMITED EDITION PRINTS",
    "MUSEUM QUALITY",
    "SUSTAINABLE ART",
    "SPENCER GREY",
    "CONTEMPORARY ART",
    "EXCLUSIVE COLLECTIONS"
  ];
  
  // Use custom text segments if provided, otherwise use defaults
  const textSegments = customTextSegments || defaultTextSegments;
  
  return (
    <section className="py-8 md:py-12 overflow-hidden">
      <div className="mb-8">
        <motion.h1 
          className="font-serif text-4xl md:text-6xl lg:text-7xl text-center mb-6 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Spencer Grey
        </motion.h1>
        <motion.p
          className="text-center text-lg md:text-xl text-[#020312]/70 max-w-2xl mx-auto px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Contemporary artist creating vibrant, limited edition prints
        </motion.p>
      </div>

      {/* First marquee - left to right */}
      <div className="mb-8">
        <Marquee direction="right" speed={30} className="py-4">
          {textSegments.map((text, index) => (
            <MarqueeItem key={`text-${index}`} className="mx-8">
              <span className="font-serif text-2xl md:text-3xl uppercase tracking-wider">{text}</span>
            </MarqueeItem>
          ))}
          {extractedImages.slice(0, 3).map((image, index) => (
            <MarqueeArtwork 
              key={`image-1-${index}`}
              imageUrl={typeof image.url === 'string' ? image.url : ''}
              alt={typeof image.alt === 'string' ? image.alt : 'Artwork'}
              width={180}
              height={180}
              className="mx-8"
            />
          ))}
        </Marquee>
      </div>

      {/* Second marquee - right to left */}
      <div>
        <Marquee direction="left" speed={25} className="py-4">
          {textSegments.slice(3).concat(textSegments.slice(0, 3)).map((text, index) => (
            <MarqueeItem key={`text-2-${index}`} className="mx-8">
              <span className="font-serif text-2xl md:text-3xl uppercase tracking-wider">{text}</span>
            </MarqueeItem>
          ))}
          {extractedImages.slice(3).concat(extractedImages.slice(0, Math.max(0, 3 - extractedImages.slice(3).length))).map((image, index) => (
            <MarqueeArtwork 
              key={`image-2-${index}`}
              imageUrl={typeof image.url === 'string' ? image.url : ''}
              alt={typeof image.alt === 'string' ? image.alt : 'Artwork'}
              width={180}
              height={180}
              className="mx-8"
            />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
