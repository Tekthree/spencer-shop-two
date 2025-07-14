"use client";

import React from "react";
import clsx from "clsx";

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
 * @returns A marquee heading component
 */
export function MarqueeHeading({
  children,
  className = "", 
  speed = "normal" 
}: MarqueeHeadingProps) {
  // Determine speed class based on prop
  let speedClass = "";
  if (speed === "slow") speedClass = "marquee-track-slow";
  if (speed === "fast") speedClass = "marquee-track-fast";

  // We no longer need the formatHeadingText function as we're handling the formatting directly in JSX

  // Create the repeating content for the marquee
  const createMarqueeItem = () => {
    return (
      <div className="marquee-item">
        <div className="flex items-center">
          <h1 className={clsx("marquee-heading text-[#020312] my-0", className)}>{children}</h1>
          <div className="mx-16 flex items-center" style={{ height: '1em' }}>
            <span 
              className="text-[#020312]/30 text-3xl md:text-5xl lg:text-6xl" 
              style={{ 
                display: 'inline-block',
                verticalAlign: 'middle',
                position: 'relative',
                top: '-0.3em'
              }}
            >
              •
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={clsx("marquee-container", className)}>
      <div className={clsx("marquee-track", speedClass)}>
        {/* Repeat the content multiple times to ensure seamless looping */}
        {createMarqueeItem()}
        {createMarqueeItem()}
        {createMarqueeItem()}
        {createMarqueeItem()}
        {createMarqueeItem()}
        {createMarqueeItem()}
      </div>
    </div>
  );
}
