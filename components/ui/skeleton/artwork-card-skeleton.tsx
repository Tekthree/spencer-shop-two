'use client';

import { SkeletonBase } from './skeleton-base';

/**
 * Skeleton loader for artwork cards
 * @returns A skeleton placeholder for an artwork card
 */
export function ArtworkCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      {/* Artwork image placeholder */}
      <SkeletonBase 
        height="h-64 sm:h-80" 
        rounded="rounded-sm"
      />
      
      {/* Artwork title placeholder */}
      <SkeletonBase 
        height="h-5" 
        width="w-3/4"
      />
      
      {/* Artwork price placeholder */}
      <SkeletonBase 
        height="h-4" 
        width="w-1/4"
      />
    </div>
  );
}

/**
 * Grid of artwork card skeletons
 * @param count - Number of skeleton cards to display
 * @returns A grid of artwork card skeletons
 */
export function ArtworkGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ArtworkCardSkeleton key={index} />
      ))}
    </div>
  );
}