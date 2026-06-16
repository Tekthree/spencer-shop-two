"use client";

import { ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

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
}: HorizontalScrollProps) {
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className={`flex ${className}`}>
        {children}
      </div>
    </div>
  );
}
