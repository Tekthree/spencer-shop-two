"use client";

import { useState } from 'react';
import Image from 'next/image';

interface HoverImageProps {
  mainImage: {
    url: string;
    alt: string;
  };
  hoverImage?: {
    url: string;
    alt: string;
  };
  className?: string;
}

/**
 * HoverImage component
 * Displays a main image that changes to a hover image on mouse over
 * Falls back to just displaying the main image if no hover image is provided
 */
export default function HoverImage({ mainImage, hoverImage, className = '' }: HoverImageProps) {
  const [isHovering, setIsHovering] = useState(false);
  
  // If no hover image is provided, just show the main image
  if (!hoverImage) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <Image
          src={mainImage.url}
          alt={mainImage.alt || 'Artwork image'}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
    );
  }
  
  return (
    <div 
      className={`relative w-full h-full ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Main Image */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          isHovering ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Image
          src={mainImage.url}
          alt={mainImage.alt || 'Artwork image'}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      
      {/* Hover Image */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Image
          src={hoverImage.url}
          alt={hoverImage.alt || 'Artwork hover image'}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );
}