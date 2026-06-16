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

export default function HorizontalScroll({
  children,
  className = '',
  scrollbarClassName = '',
  scrollbarTrackClassName = '',
  scrollbarThumbClassName = '',
}: HorizontalScrollProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(20);

  // Content drag state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  // Scrollbar thumb drag state
  const [thumbDragging, setThumbDragging] = useState(false);
  const thumbStartX = useRef(0);
  const thumbStartScrollLeft = useRef(0);

  // Update scrollbar on scroll / resize
  useEffect(() => {
    const update = () => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const { scrollWidth, clientWidth, scrollLeft } = el;
      setThumbWidth(Math.max((clientWidth / scrollWidth) * 100, 10));
      const maxScroll = scrollWidth - clientWidth;
      setScrollPercentage(maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0);
    };
    update();
    const el = scrollContainerRef.current;
    el?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      el?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // ── Content drag (mouse) ──────────────────────────────────────
  const onContentMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    startScrollLeft.current = scrollContainerRef.current.scrollLeft;
    setGrabbing(true);
  };

  const onContentMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollContainerRef.current.scrollLeft = startScrollLeft.current - walk;
  };

  const onContentMouseUp = () => {
    isDragging.current = false;
    setGrabbing(false);
  };

  // ── Scrollbar thumb drag ──────────────────────────────────────
  const onThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setThumbDragging(true);
    thumbStartX.current = e.clientX;
    thumbStartScrollLeft.current = scrollContainerRef.current?.scrollLeft ?? 0;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!thumbDragging || !scrollContainerRef.current) return;
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const walk = (e.clientX - thumbStartX.current) * 2;
      scrollContainerRef.current.scrollLeft = Math.max(
        0,
        Math.min(thumbStartScrollLeft.current + walk, maxScroll)
      );
    };
    const onUp = () => setThumbDragging(false);
    if (thumbDragging) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [thumbDragging]);

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className={`flex overflow-x-auto scrollbar-hide select-none ${grabbing ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
        onMouseDown={onContentMouseDown}
        onMouseMove={onContentMouseMove}
        onMouseUp={onContentMouseUp}
        onMouseLeave={onContentMouseUp}
      >
        {children}
      </div>

      {/* Scrollbar */}
      <div className={`mt-4 relative h-[2px] ${scrollbarClassName || 'w-full'}`}>
        <div
          className={`absolute inset-0 rounded-full ${scrollbarTrackClassName || 'bg-gray-200'}`}
        />
        <motion.div
          className={`absolute h-full rounded-full cursor-pointer ${scrollbarThumbClassName || 'bg-[#020312]/40 hover:bg-[#020312]/70'}`}
          style={{
            width: `${thumbWidth}%`,
            left: `${(scrollPercentage * (100 - thumbWidth)) / 100}%`,
          }}
          onMouseDown={onThumbMouseDown}
        />
      </div>
    </div>
  );
}
