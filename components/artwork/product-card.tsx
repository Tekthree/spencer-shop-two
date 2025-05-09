"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  title: string;
  images: { url: string; alt: string; type?: string }[];
  price?: number;
  className?: string;
}

/**
 * ProductCard component
 * Displays an artwork preview with hover image functionality
 * Used in "You may also like" sections and collection listings
 */
export default function ProductCard({ id, title, images, price, className = '' }: ProductCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  
  // Find main and hover images
  const mainImage = images.find(img => img.type === 'main') || images[0];
  const hoverImage = images.find(img => img.type === 'hover');
  
  // Format price for display if provided
  const formattedPrice = price 
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price / 100)
    : null;
  
  return (
    <Link href={`/artwork/${id}`}>
      <div 
        className={`group relative ${className}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Image container with hover effect */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#F6F4F0]">
          {/* Main Image */}
          {mainImage && (
            <div className={`absolute inset-0 transition-opacity duration-300 ${isHovering && hoverImage ? 'opacity-0' : 'opacity-100'}`}>
              <Image
                src={mainImage.url}
                alt={mainImage.alt || title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
          
          {/* Hover Image (only shown if available) */}
          {hoverImage && (
            <div className={`absolute inset-0 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
              <Image
                src={hoverImage.url}
                alt={hoverImage.alt || `${title} hover image`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
        
        {/* Title and price */}
        <div className="mt-3">
          <h3 className="text-sm font-medium text-[#020312]">{title}</h3>
          {formattedPrice && (
            <p className="mt-1 text-sm text-[#020312]/70">{formattedPrice}</p>
          )}
        </div>
      </div>
    </Link>
  );
}