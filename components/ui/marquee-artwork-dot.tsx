'use client';

import Image from 'next/image';

/**
 * MarqueeArtworkDot component - Displays a circular artwork image in place of a dot
 * @param index - The index of the dot (0-3) to determine which image to show
 * @returns A circular artwork image component
 */
export function MarqueeArtworkDot({ index = 0 }: { index?: number }) {
  // Define local image paths for the framed-for-mar images
  // Each image is completely different to ensure visual variety
  const image0 = '/images/framed-for-mar.gif';
  const image1 = '/images/framed-for-mar-two.gif';
  const image2 = '/images/framed-for-mar-three.gif';
  const image3 = '/images/framed-for-mar-four.gif';
  
  // Directly determine which image to use based on index
  // No array indexing or complex logic that could cause confusion
  let imageUrl = '';
  if (index === 0) imageUrl = image0;
  else if (index === 1) imageUrl = image1;
  else if (index === 2) imageUrl = image2;
  else if (index === 3) imageUrl = image3;
  else imageUrl = image0; // Fallback
  
  // Create a unique identifier for each dot instance
  const uniqueId = `artwork-dot-${index}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Create a descriptive alt text for accessibility
  const imageAlt = `Spencer Grey artwork ${index + 1}`;
  
  // Add detailed console logging to help troubleshoot
  console.log(`MarqueeArtworkDot [${uniqueId}] - Index: ${index}, Image: ${imageUrl.split('/').pop()?.split('.')[0]}`);


  // Local images don't need cache-busting parameters
  const uniqueUrl = imageUrl;
  
  return (
    <div className="marquee-artwork-dot" data-index={index}>
      <Image
        src={uniqueUrl}
        alt={imageAlt}
        width={60} /* Larger dimensions for better quality */
        height={60}
        className="rounded-full object-cover"
        // Use a completely unique key for each instance
        key={uniqueId}
        // Disable Next.js image optimization to prevent caching issues
        unoptimized={true}
        // Ensure proper loading behavior
        priority={true}
        // Add loading eager to ensure immediate loading
        loading="eager"
      />
    </div>
  );
}
