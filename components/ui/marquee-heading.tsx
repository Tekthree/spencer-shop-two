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
 * @returns A marquee heading component with seamless infinite loop animation
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
  
  return (
    <div className="marquee-container">
      <div className={clsx("marquee-track", speedClass)}>
        {/* Create 4 copies of the content for smoother animation */}
        <div className="marquee-content">
          <h1 className={clsx("marquee-heading text-[#020312] my-0", className)}>{children}</h1>
          <div className="marquee-dot-wrapper">
            <span className="marquee-dot">•</span>
          </div>
        </div>
        <div className="marquee-content" aria-hidden="true">
          <h1 className={clsx("marquee-heading text-[#020312] my-0", className)}>{children}</h1>
          <div className="marquee-dot-wrapper">
            <span className="marquee-dot">•</span>
          </div>
        </div>
        <div className="marquee-content" aria-hidden="true">
          <h1 className={clsx("marquee-heading text-[#020312] my-0", className)}>{children}</h1>
          <div className="marquee-dot-wrapper">
            <span className="marquee-dot">•</span>
          </div>
        </div>
        <div className="marquee-content" aria-hidden="true">
          <h1 className={clsx("marquee-heading text-[#020312] my-0", className)}>{children}</h1>
          <div className="marquee-dot-wrapper">
            <span className="marquee-dot">•</span>
          </div>
        </div>
      </div>
    </div>
  );
}
