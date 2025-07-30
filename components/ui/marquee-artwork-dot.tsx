'use client';

import Image from 'next/image';

/**
 * MarqueeArtworkDot component - Displays a circular artwork image in place of a dot
 * @param index - The index of the dot (0-3) to determine which image to show
 * @returns A circular artwork image component
 */
export function MarqueeArtworkDot({ index = 0 }: { index?: number }) {
  // Define fixed image URLs directly in the component
  // Each image is completely different to ensure visual variety
  const image0 = 'https://udanlcylpsvxqlihcppb.supabase.co/storage/v1/object/public/artworks/cb0297d0-831a-48a8-8798-d47ead272408.jpg';
  const image1 = 'https://udanlcylpsvxqlihcppb.supabase.co/storage/v1/object/public/artworks/69a4d340-a0f1-4f79-98ba-3b9de0e5de0e.jpg';
  const image2 = 'https://udanlcylpsvxqlihcppb.supabase.co/storage/v1/object/public/artworks/2d93b43e-3a24-42e8-83f9-bc38f0627bea.jpg';
  const image3 = 'https://udanlcylpsvxqlihcppb.supabase.co/storage/v1/object/public/artworks/f6f312b1-4f5b-4536-a264-10a3411950d8.jpg';
  
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


  // Add a unique query parameter to completely defeat any caching
  const uniqueUrl = `${imageUrl}?dot=${index}&t=${uniqueId}`;
  
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
