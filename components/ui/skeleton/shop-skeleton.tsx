'use client';

import { SkeletonBase } from './skeleton-base';
import { ArtworkGridSkeleton } from './artwork-card-skeleton';

/**
 * Skeleton loader for the Shop page
 * @returns A skeleton placeholder for the Shop page
 */
export function ShopSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 bg-[#F6F4F0]">
      {/* Page title */}
      <div className="text-center mb-8">
        <SkeletonBase 
          height="h-8" 
          width="w-1/3" 
          className="mx-auto"
        />
        <div className="mt-4 max-w-2xl mx-auto">
          <SkeletonBase height="h-4" className="mx-auto" />
          <SkeletonBase height="h-4" width="w-5/6" className="mx-auto mt-2" />
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBase 
            key={index}
            width="w-24" 
            height="h-10" 
            rounded="rounded-full"
          />
        ))}
      </div>
      
      {/* Artwork grid */}
      <ArtworkGridSkeleton count={9} />
      
      {/* Pagination/Load more */}
      <div className="mt-12 flex justify-center">
        <SkeletonBase 
          width="w-32" 
          height="h-10" 
          rounded="rounded-md"
        />
      </div>
    </div>
  );
}