"use client";

/**
 * SpencerLogo component for Spencer Grey Artist Website
 * Ensures consistent branding with Clandy font across the site
 */
import React from 'react';
import Link from 'next/link';

interface SpencerLogoProps {
  className?: string;
  linkTo?: string;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  marginBottom?: string;
  textColor?: string;
}

export default function SpencerLogo({ 
  className = "", 
  linkTo = "/", 
  size = "medium",
  marginBottom = "0",
  textColor = "#020312"
}: SpencerLogoProps) {
  // Determine text size based on the size prop
  const textSizeClass = {
    small: "text-xl",
    medium: "text-2xl",
    large: "text-3xl",
    'extra-large': "text-4xl"
  }[size];
  
  // Apply direct inline styles to ensure the font is applied
  const logoStyle = {
    fontFamily: 'Clandy, serif',
    fontWeight: 400,
    marginBottom: marginBottom,
  };
  
  // Wrap in Link if linkTo is provided, otherwise just render the text
  const content = (
    <span 
      className={`tracking-tight ${textSizeClass} ${className}`} 
      style={{...logoStyle, color: textColor}}
      data-component-name="SpencerLogo"
    >
      Spencer Grey
    </span>
  );
  
  return linkTo ? (
    <Link href={linkTo}>
      {content}
    </Link>
  ) : content;
}
