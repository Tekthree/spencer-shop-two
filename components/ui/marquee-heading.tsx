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
  // No need for timestamp with local images
  
  // Array of local artwork paths for easier management
  const artworkUrls = [
    "/images/framed-for-mar.gif",
    "/images/framed-for-mar-two.gif",
    "/images/framed-for-mar-three.gif",
    "/images/framed-for-mar-four.gif"
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
        <div className="marquee-dot-wrapper sm:w-[120px] sm:h-[120px] w-[70px] h-[70px]" style={{ margin: '0 3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
          <div className="marquee-artwork-dot sm:w-[120px] sm:h-[120px] w-[70px] h-[70px]" data-index={artworkIndex} style={{ overflow: 'visible' }}>
            <Image 
              src={url}
              alt={`Spencer Grey artwork ${artworkIndex + 1}`}
              width={0}
              height={0}
              sizes="(max-width: 640px) 70px, 120px"
              className="object-contain w-full h-full"
              style={{ color: 'transparent' }}
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
