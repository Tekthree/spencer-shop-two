"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Artwork, ArtworkImage } from '@/types/artwork';

interface ProductDisplayProps {
  artwork: Artwork;
  tag?: string;
  tagColor?: string;
  isRightSide?: boolean;
  isLarge?: boolean;
}

/**
 * ProductDisplay component for showcasing artwork in a split grid layout
 * Inspired by the Roburico.com design
 * 
 * @param artwork - The artwork to display
 * @param tag - Optional tag to display (e.g., "Just Dropped", "Most Popular")
 * @param tagColor - Background color for the tag
 * @param isRightSide - Whether the product should be displayed on the right side
 * @param isLarge - Whether this is the large version of the product display
 */
export default function ProductDisplay({
  artwork,
  tag,
  tagColor = "#ff6724",
  isRightSide = false,
  isLarge = false,
}: ProductDisplayProps) {
  // Find main and hover images
  const artworkImages = artwork.images as ArtworkImage[];
  const mainImage = artworkImages.find((img: ArtworkImage) => img.type === 'main') || artworkImages[0];
  const hoverImage = artworkImages.find((img: ArtworkImage) => img.type === 'hover') || artworkImages[1] || artworkImages[0];
  
  // Get the base price from the first size option
  const basePrice = artwork.sizes && artwork.sizes.length > 0 
    ? artwork.sizes[0].price 
    : 0;
  
  // Format price with comma for thousands
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(basePrice).replace('$', '');

  return (
    <div className={`w-layout-grid products-split-grid ${isLarge ? '' : 'mb-8 md:mb-12'}`}>
      {/* Product Image and Info */}
      <div className={`product-split-grid-${isLarge ? 'large' : 'small'} ${isRightSide ? 'is-right-side' : ''}`}>
        <div className={isLarge ? '' : 'sticky-block'}>
          <Link href={`/products/${artwork.id}`} className="grid-product-image-wrapper block relative">
            {/* Tag */}
            {tag && (
              <div className="grid-product-tag-wrapper absolute top-4 left-4 z-10">
                <div className="product-tag" style={{ backgroundColor: tagColor }}>
                  <div className="px-3 py-1 text-white text-xs font-medium">{tag}</div>
                </div>
              </div>
            )}
            
            {/* Main Image */}
            <div className="relative">
              <Image 
                src={mainImage.url} 
                alt={mainImage.alt || artwork.title}
                width={isLarge ? 800 : 400}
                height={isLarge ? 800 : 400}
                className={`grid-product-image w-full ${isLarge ? 'is-ratio-4-5' : ''} transition-opacity duration-300`}
              />
              
              {/* Hover Image (positioned absolutely on top) */}
              <Image 
                src={hoverImage.url} 
                alt={hoverImage.alt || `${artwork.title} - hover view`}
                width={isLarge ? 800 : 400}
                height={isLarge ? 800 : 400}
                className="grid-hover-product-image w-full absolute top-0 left-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </Link>
          
          {/* Product Info (only shown for small version) */}
          {!isLarge && (
            <div className="grid-product-content-wrapper mt-6">
              <Link href={`/products/${artwork.id}`} className="grid-product-title-link block mb-3">
                <div className="product-title-text font-serif text-lg">{artwork.title}</div>
              </Link>
              <div className="grid-product-price flex items-center space-x-1">
                <div className="text-sm text-[#020312]/70">from</div>
                <div className="text-sm">${formattedPrice}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Only render the second part if this is a large product display */}
      {isLarge && (
        <div className={`product-split-grid-small ${!isRightSide ? 'is-right-side' : ''}`}>
          <div className="grid-product-content-wrapper mt-6">
            <Link href={`/products/${artwork.id}`} className="grid-product-title-link block mb-3">
              <div className="product-title-text font-serif text-lg">{artwork.title}</div>
            </Link>
            <div className="grid-product-price flex items-center space-x-1">
              <div className="text-sm text-[#020312]/70">from</div>
              <div className="text-sm">${formattedPrice}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
