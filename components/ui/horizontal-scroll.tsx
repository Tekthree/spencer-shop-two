"use client";

import { ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  /** Override the right-fade background colour (defaults to #F6F4F0) */
  fadeColor?: string;
  /** Pass scrollbarTrackClassName/scrollbarThumbClassName for backwards compat — unused */
  scrollbarTrackClassName?: string;
  scrollbarThumbClassName?: string;
}

export default function HorizontalScroll({
  children,
  className = '',
  fadeColor = '#F6F4F0',
}: HorizontalScrollProps) {
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  return (
    <div className="hs-root">
      <div ref={emblaRef} className="hs-viewport">
        {children}
      </div>

      {/* Right-edge fade — hints more content */}
      <div
        className="hs-fade"
        style={{ background: `linear-gradient(to right, transparent, ${fadeColor})` }}
      />

      <style>{`
        .hs-root { position: relative; overflow: visible; }
        .hs-viewport { overflow: hidden; cursor: grab; }
        .hs-viewport:active { cursor: grabbing; }
        .hs-fade {
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 80px;
          pointer-events: none;
          z-index: 2;
        }
      `}</style>
    </div>
  );
}
