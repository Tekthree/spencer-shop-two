"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductDisplay from './product-display';
import { Artwork as ArtworkType } from '@/types/artwork';
import { ArrowRight } from 'lucide-react';

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

interface FeaturedArtworkSectionProps {
  featuredArtworks: ClientArtwork[];
}

/**
 * FeaturedArtworkSection component for displaying featured artworks in a layout
 * similar to the provided example with split grids and product tags
 * 
 * @param featuredArtworks - Array of featured artwork objects to display
 * @returns Featured artwork section component
 */
export default function FeaturedArtworkSection({ featuredArtworks }: FeaturedArtworkSectionProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
        delay: i * 0.1
      }
    })
  };

  // Ensure we have at least 5 artworks to display
  const artworksToDisplay = featuredArtworks.slice(0, 5);
  
  // Function to adapt client artwork to the type expected by ProductDisplay
  const adaptArtwork = (artwork: ClientArtwork): ArtworkType => {
    // Ensure we have at least two images for main and hover
    const artworkImages = artwork.images || [];
    const mainImage = artworkImages.find(img => img.type === 'main') || artworkImages[0];
    const hoverImage = artworkImages.find(img => img.type === 'hover') || artworkImages[1] || artworkImages[0];
    
    // Make sure we have properly formatted images with required types
    const formattedImages = [
      {
        url: mainImage?.url || '',
        alt: mainImage?.alt || artwork.title,
        type: 'main' as const
      },
      {
        url: hoverImage?.url || mainImage?.url || '',
        alt: hoverImage?.alt || artwork.title,
        type: 'hover' as const
      }
    ];
    
    return {
      id: artwork.id,
      title: artwork.title,
      description: '', // Provide a default empty string for description
      images: formattedImages,
      sizes: artwork.sizes?.map(size => ({
        size: size.size,
        price: typeof size.price === 'string' ? parseFloat(size.price) : size.price,
        edition_limit: 0, // Default values
        editions_sold: 0  // Default values
      })) || [{
        size: 'Default',
        price: typeof artwork.price === 'string' ? parseFloat(artwork.price) : (artwork.price || 0),
        edition_limit: 0,
        editions_sold: 0
      }]
    };
  };
  
  // Define tags for each artwork position
  const tags = [
    { text: "JUST DROPPED", color: "#ff6724" },
    { text: "BEST SELLER", color: "#3a86ff" },
    { text: "LIMITED", color: "#8338ec" },
    { text: "EXCLUSIVE", color: "#fb5607" },
    { text: "FEATURED", color: "#06d6a0" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="featured-artwork-section"
    >
      {/* First row - Large image at top */}
      <section className="mb-8 md:mb-12">
        <div className="container-spencer">
          <div className="w-dyn-list">
            <div role="list" className="w-dyn-items">
              <div role="listitem" className="product-item w-dyn-item">
                {artworksToDisplay[0] && (
                  <motion.div variants={itemVariants} custom={0}>
                    <ProductDisplay
                      artwork={adaptArtwork(artworksToDisplay[0])}
                      tag={tags[0].text}
                      tagColor={tags[0].color}
                      isLarge={true}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Second row - Two small images side by side */}
      <section className="mb-8 md:mb-12">
        <div className="container-spencer">
          <div className="w-layout-grid products-grid">
            <div className="w-dyn-list">
              <div role="list" className="w-dyn-items">
                <div role="listitem" className="product-item w-dyn-item">
                  {artworksToDisplay[1] && (
                    <motion.div variants={itemVariants} custom={1}>
                      <ProductDisplay
                        artwork={adaptArtwork(artworksToDisplay[1])}
                        tag={tags[1].text}
                        tagColor={tags[1].color}
                        isLarge={false}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-dyn-list">
              <div role="list" className="w-dyn-items">
                <div role="listitem" className="product-item w-dyn-item">
                  {artworksToDisplay[2] && (
                    <motion.div variants={itemVariants} custom={2}>
                      <ProductDisplay
                        artwork={adaptArtwork(artworksToDisplay[2])}
                        tag={tags[2].text}
                        tagColor={tags[2].color}
                        isLarge={false}
                        isRightSide={true}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Third row - Small image on left */}
      <section className="mb-8 md:mb-12">
        <div className="container-spencer">
          <div className="w-layout-grid products-grid">
            <div className="w-dyn-list">
              <div role="list" className="w-dyn-items">
                <div role="listitem" className="product-item w-dyn-item">
                  {artworksToDisplay[3] && (
                    <motion.div variants={itemVariants} custom={3}>
                      <ProductDisplay
                        artwork={adaptArtwork(artworksToDisplay[3])}
                        tag={tags[3].text}
                        tagColor={tags[3].color}
                        isLarge={false}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Fourth row - Full width image at bottom */}
      <section className="mb-8 md:mb-12">
        <div className="container-spencer">
          <div className="w-dyn-list">
            <div role="list" className="w-dyn-items">
              <div role="listitem" className="product-item w-dyn-item">
                {artworksToDisplay[4] && (
                  <motion.div variants={itemVariants} custom={4}>
                    <ProductDisplay
                      artwork={adaptArtwork(artworksToDisplay[4])}
                      tag={tags[4].text}
                      tagColor={tags[4].color}
                      isLarge={true}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* View All Button */}
      <motion.div 
        className="container-spencer text-center mt-8 mb-8 md:mt-10 md:mb-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Link 
          href="/shop"
          className="shop-button inline-flex items-center gap-2"
          aria-label="View all artworks in the shop"
        >
          <span>View All Artworks</span>
          <ArrowRight size={18} />
        </Link>
      </motion.div>
    </motion.div>
  );
}
