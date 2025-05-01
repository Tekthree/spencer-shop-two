'use client';

import { SkeletonBase } from './skeleton-base';

/**
 * Skeleton loader for the artwork detail page
 * @returns A skeleton placeholder for an artwork detail page
 */
export function ArtworkDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Image */}
        <div className="space-y-4">
          <SkeletonBase 
            height="h-[500px]" 
            rounded="rounded-sm"
          />
          
          {/* Thumbnail images */}
          <div className="flex space-x-2 mt-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBase 
                key={index}
                width="w-20" 
                height="h-20" 
                rounded="rounded-sm"
              />
            ))}
          </div>
        </div>
        
        {/* Right column - Details */}
        <div className="space-y-6">
          {/* Title */}
          <SkeletonBase 
            height="h-8" 
            width="w-3/4"
          />
          
          {/* Price */}
          <SkeletonBase 
            height="h-6" 
            width="w-1/3"
          />
          
          {/* Description */}
          <div className="space-y-2">
            <SkeletonBase height="h-4" />
            <SkeletonBase height="h-4" />
            <SkeletonBase height="h-4" width="w-2/3" />
          </div>
          
          {/* Size options */}
          <div className="space-y-2">
            <SkeletonBase height="h-5" width="w-1/4" />
            <div className="flex space-x-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBase 
                  key={index}
                  width="w-20" 
                  height="h-10" 
                  rounded="rounded-md"
                />
              ))}
            </div>
          </div>
          
          {/* Add to cart button */}
          <SkeletonBase 
            height="h-12" 
            rounded="rounded-md"
          />
          
          {/* Additional info */}
          <div className="space-y-2 mt-8">
            <SkeletonBase height="h-4" width="w-full" />
            <SkeletonBase height="h-4" width="w-full" />
            <SkeletonBase height="h-4" width="w-3/4" />
          </div>
        </div>
      </div>
      
      {/* Related artworks section */}
      <div className="mt-16 space-y-4">
        <SkeletonBase height="h-6" width="w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBase height="h-48" rounded="rounded-sm" />
              <SkeletonBase height="h-4" width="w-2/3" />
              <SkeletonBase height="h-3" width="w-1/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}