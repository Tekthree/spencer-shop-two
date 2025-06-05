"use client";

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * Marquee component for infinite scrolling content
 * @param children - Content to scroll
 * @param direction - Direction to scroll (left or right)
 * @param speed - Speed of scrolling (lower is faster)
 * @param pauseOnHover - Whether to pause scrolling on hover
 * @param className - Additional CSS classes
 */
export default function Marquee({
  children,
  direction = 'left',
  speed = 20,
  pauseOnHover = true,
  className = '',
}: MarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = React.useState(0);
  const [duplicates, setDuplicates] = React.useState(2);

  useEffect(() => {
    if (!marqueeRef.current) return;
    
    const calculateWidth = () => {
      if (!marqueeRef.current) return;
      const marqueeWidth = marqueeRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      
      // Calculate how many duplicates we need to fill the screen
      const duplicatesNeeded = Math.max(2, Math.ceil((viewportWidth * 2) / marqueeWidth));
      setDuplicates(duplicatesNeeded);
      setContentWidth(marqueeWidth);
    };

    calculateWidth();
    window.addEventListener('resize', calculateWidth);
    
    return () => {
      window.removeEventListener('resize', calculateWidth);
    };
  }, [children]);

  return (
    <div 
      className={`overflow-hidden whitespace-nowrap ${className}`}
      style={{ width: '100%' }}
    >
      <motion.div
        ref={marqueeRef}
        className="inline-block"
        animate={{
          x: direction === 'left' 
            ? [-contentWidth, 0] 
            : [0, -contentWidth]
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
        whileHover={pauseOnHover ? { animationPlayState: 'paused' } : undefined}
      >
        {children}
      </motion.div>
      
      {/* Duplicate the content to create seamless loop */}
      {Array.from({ length: duplicates }).map((_, i) => (
        <motion.div
          key={i}
          className="inline-block"
          animate={{
            x: direction === 'left' 
              ? [-contentWidth, 0] 
              : [0, -contentWidth]
          }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: speed,
          }}
          whileHover={pauseOnHover ? { animationPlayState: 'paused' } : undefined}
        >
          {children}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * MarqueeItem component for wrapping individual items in the marquee
 */
export function MarqueeItem({ 
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      {children}
    </div>
  );
}

/**
 * MarqueeArtwork component for displaying artwork in the marquee
 */
export function MarqueeArtwork({
  imageUrl,
  alt,
  width = 120,
  height = 120,
  className = '',
}: {
  imageUrl: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <div className={`mx-4 ${className}`}>
      <div className="relative overflow-hidden">
        <Image
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          className="object-cover rounded"
        />
      </div>
    </div>
  );
}
