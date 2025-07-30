"use client";

import React from "react";
import clsx from "clsx";
import Image from "next/image";

interface MarqueeHeadingProps {
  children: React.ReactNode;
  className?: string;
  speed?: "slow" | "normal" | "fast";
}

/**
 * MarqueeHeading component - Creates an infinite horizontal scrolling heading
 * @param children - The heading text content
 * @param className - Optional additional classes
 * @param speed - Animation speed: "slow", "normal", or "fast"
 * @returns A marquee heading component with seamless infinite loop animation
 */
export function MarqueeHeading({
  children,
  className = "", 
  speed = "normal" 
}: MarqueeHeadingProps) {
  // Generate a timestamp for cache busting
  const timestamp = Date.now();
  
  // Array of artwork URLs for easier management
  const artworkUrls = [
    "https://udanlcylpsvxqlihcppb.supabase.co/storage/v1/object/public/artworks/cb0297d0-831a-48a8-8798-d47ead272408.jpg",
    "https://udanlcylpsvxqlihcppb.supabase.co/storage/v1/object/public/artworks/69a4d340-a0f1-4f79-98ba-3b9de0e5de0e.jpg",
    "https://udanlcylpsvxqlihcppb.supabase.co/storage/v1/object/public/artworks/2d93b43e-3a24-42e8-83f9-bc38f0627bea.jpg",
    "https://udanlcylpsvxqlihcppb.supabase.co/storage/v1/object/public/artworks/f6f312b1-4f5b-4536-a264-10a3411950d8.jpg"
  ];

  // Determine speed class based on prop
  let speedClass = "";
  if (speed === "slow") speedClass = "marquee-track-slow";
  if (speed === "fast") speedClass = "marquee-track-fast";
  
  // Create a single marquee item
  const createMarqueeItem = (url: string, index: number) => {
    // Calculate the real index for the artwork (0-3)
    const artworkIndex = index % artworkUrls.length;
    
    return (
      <div 
        key={`marquee-content-${index}`} 
        className="marquee-content" 
        style={{ 
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0',
          margin: '0'
        }} 
        aria-hidden={index >= artworkUrls.length} // Only first set for screen readers
      >
        <h1 className={clsx("marquee-heading text-[#020312] my-0", className)} data-component-name="MarqueeHeading">
          {children}
        </h1>
        <div className="marquee-dot-wrapper" style={{ margin: '0 3rem' }}>
          <div className="marquee-artwork-dot" data-index={artworkIndex}>
            <Image 
              src={`${url}?t=${timestamp}-${index}`}
              alt={`Spencer Grey artwork ${artworkIndex + 1}`}
              width={60}
              height={60}
              className="rounded-full object-cover"
              unoptimized={true}
              priority={index === 0} // Only prioritize the first image
              loading={index === 0 ? "eager" : "lazy"} // Load first image eagerly, others lazily
            />
          </div>
        </div>
      </div>
    );
  };
  
  // Create all marquee items - we need exactly 2 sets for perfect looping
  const marqueeItems = [];
  
  // First set
  for (let i = 0; i < artworkUrls.length; i++) {
    marqueeItems.push(createMarqueeItem(artworkUrls[i], i));
  }
  
  // Second set (duplicate)
  for (let i = 0; i < artworkUrls.length; i++) {
    marqueeItems.push(createMarqueeItem(artworkUrls[i], i + artworkUrls.length));
  }
  
  return (
    <div className="marquee-container" style={{ 
      overflow: 'hidden', 
      whiteSpace: 'nowrap',
      width: '100%'
    }}>
      <div 
        className={clsx("marquee-track", speedClass)} 
        style={{ 
          display: 'inline-flex', 
          width: 'fit-content'
        }}
      >
        {marqueeItems}
      </div>
    </div>
  );
}
