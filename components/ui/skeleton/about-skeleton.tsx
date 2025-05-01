'use client';

import { SkeletonBase } from './skeleton-base';

/**
 * Skeleton loader for the About page
 * @returns A skeleton placeholder for the About page
 */
export function AboutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Artist statement section */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <SkeletonBase height="h-6" width="w-1/2" className="mx-auto" />
        <div className="space-y-2">
          <SkeletonBase height="h-4" />
          <SkeletonBase height="h-4" />
          <SkeletonBase height="h-4" width="w-3/4" className="mx-auto" />
        </div>
      </div>
      
      {/* Main artist image */}
      <SkeletonBase 
        height="h-[400px] sm:h-[500px]" 
        rounded="rounded-sm"
        className="max-w-4xl mx-auto"
      />
      
      {/* Main description */}
      <div className="max-w-3xl mx-auto space-y-3">
        <SkeletonBase height="h-5" width="w-3/4" />
        <div className="space-y-2">
          <SkeletonBase height="h-4" />
          <SkeletonBase height="h-4" />
          <SkeletonBase height="h-4" />
          <SkeletonBase height="h-4" width="w-5/6" />
        </div>
      </div>
      
      {/* Gallery image cluster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBase 
            key={index}
            height="h-64 md:h-80" 
            rounded="rounded-sm"
          />
        ))}
      </div>
      
      {/* Secondary description */}
      <div className="max-w-3xl mx-auto space-y-3">
        <SkeletonBase height="h-5" width="w-2/3" />
        <div className="space-y-2">
          <SkeletonBase height="h-4" />
          <SkeletonBase height="h-4" />
          <SkeletonBase height="h-4" width="w-5/6" />
        </div>
      </div>
      
      {/* Artist signature */}
      <SkeletonBase 
        height="h-16" 
        width="w-48" 
        className="mx-auto"
      />
      
      {/* Featured artworks section */}
      <div className="space-y-6 mt-16">
        <SkeletonBase height="h-6" width="w-1/3" className="mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBase height="h-64" rounded="rounded-sm" />
              <SkeletonBase height="h-4" width="w-2/3" />
              <SkeletonBase height="h-3" width="w-1/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}