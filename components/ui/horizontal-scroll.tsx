"use client";

import { useRef, useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  scrollbarClassName?: string;
  scrollbarTrackClassName?: string;
  scrollbarThumbClassName?: string;
}

/**
 * HorizontalScroll component
 * Creates a horizontally scrollable container with custom scrollbar
 */
export default function HorizontalScroll({
  children,
  className = '',
  scrollbarClassName = '',
  scrollbarTrackClassName = '',
  scrollbarThumbClassName = ''
}: HorizontalScrollProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(20);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);

  // Calculate the thumb width and scroll percentage
  useEffect(() => {
    const updateScrollbar = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } = scrollContainerRef.current;
        
        // Calculate thumb width as a percentage of the visible area
        const calculatedThumbWidth = (clientWidth / scrollWidth) * 100;
        setThumbWidth(Math.max(calculatedThumbWidth, 10)); // Minimum thumb width of 10%
        
        // Calculate scroll position as a percentage
        const maxScroll = scrollWidth - clientWidth;
        const percentage = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
        setScrollPercentage(percentage);
      }
    };

    // Initial update
    updateScrollbar();

    // Update on scroll
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateScrollbar);
    }

    // Update on resize
    window.addEventListener('resize', updateScrollbar);

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updateScrollbar);
      }
      window.removeEventListener('resize', updateScrollbar);
    };
  }, []);

  // Handle scrollbar thumb drag
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    if (scrollContainerRef.current) {
      setStartScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  };

  // Handle mouse move while dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current) return;
      
      const x = e.clientX;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      
      scrollContainerRef.current.scrollLeft = Math.max(
        0,
        Math.min(startScrollLeft + walk, maxScroll)
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, startScrollLeft]);

  return (
    <div className="relative">
      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className={`flex overflow-x-auto scrollbar-hide ${className}`}
        style={{ scrollBehavior: 'smooth' }}
      >
        {children}
      </div>
      
      {/* Custom scrollbar */}
      <div className={`mt-4 relative h-2 ${scrollbarClassName || 'w-full'}`}>
        <div 
          className={`absolute h-full rounded-full custom-scrollbar-track ${scrollbarTrackClassName || 'bg-gray-200'}`} 
          style={{ width: '100%' }}
        />
        <motion.div
          className={`absolute h-full rounded-full cursor-pointer ${scrollbarThumbClassName || 'bg-indigo-500 hover:bg-indigo-600'}`}
          style={{ 
            width: `${thumbWidth}%`,
            left: `${scrollPercentage * (100 - thumbWidth) / 100}%`
          }}
          animate={{ x: 0 }}
          onMouseDown={handleThumbMouseDown}
        />
      </div>
    </div>
  );
}

// Note: scrollbar-hide utility class is defined in globals.css
