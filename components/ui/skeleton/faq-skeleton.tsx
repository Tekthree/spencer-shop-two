'use client';

import { SkeletonBase } from './skeleton-base';

/**
 * Skeleton loader for the FAQ page
 * @returns A skeleton placeholder for the FAQ page
 */
export function FAQSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page title */}
      <SkeletonBase 
        height="h-8" 
        width="w-1/3" 
        className="mx-auto mb-12"
      />
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar with numbered navigation */}
        <div className="lg:w-1/4 lg:sticky lg:top-24 lg:self-start">
          <SkeletonBase height="h-6" width="w-1/2" className="mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <SkeletonBase 
                  width="w-8" 
                  height="h-8" 
                  rounded="rounded-full"
                />
                <SkeletonBase height="h-5" width="w-3/4" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Main content with accordion sections */}
        <div className="lg:w-3/4 space-y-12">
          {/* Generate 5 FAQ sections */}
          {Array.from({ length: 5 }).map((_, sectionIndex) => (
            <div key={sectionIndex} className="space-y-6">
              {/* Section title */}
              <SkeletonBase height="h-6" width="w-1/2" />
              
              {/* FAQ items */}
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="border-b border-gray-200 pb-4 space-y-2">
                    {/* Question */}
                    <SkeletonBase height="h-5" width="w-5/6" />
                    
                    {/* Answer (hidden in collapsed state) */}
                    <div className="space-y-2 mt-3">
                      <SkeletonBase height="h-4" />
                      <SkeletonBase height="h-4" />
                      <SkeletonBase height="h-4" width="w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}