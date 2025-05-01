'use client';

import { SkeletonBase } from './skeleton-base';

/**
 * Skeleton loader for the Contact page
 * @returns A skeleton placeholder for the Contact page
 */
export function ContactSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page title */}
        <SkeletonBase 
          height="h-8" 
          width="w-1/3" 
          className="mx-auto mb-12"
        />
        
        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left column - Contact information */}
          <div className="space-y-8">
            {/* Section title */}
            <SkeletonBase height="h-6" width="w-1/2" />
            
            {/* Contact info blocks */}
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <SkeletonBase height="h-5" width="w-1/3" />
                  <SkeletonBase height="h-4" width="w-2/3" />
                </div>
              ))}
            </div>
            
            {/* FAQ reference section */}
            <div className="space-y-3 mt-12">
              <SkeletonBase height="h-5" width="w-2/3" />
              <SkeletonBase height="h-4" />
              <SkeletonBase height="h-4" width="w-5/6" />
              <SkeletonBase 
                height="h-10" 
                width="w-1/3" 
                rounded="rounded-md"
              />
            </div>
          </div>
          
          {/* Right column - Contact form */}
          <div className="space-y-6">
            <SkeletonBase height="h-6" width="w-1/2" />
            
            {/* Form fields */}
            <div className="space-y-4">
              {/* Name field */}
              <div className="space-y-1">
                <SkeletonBase height="h-4" width="w-1/6" />
                <SkeletonBase height="h-10" rounded="rounded-md" />
              </div>
              
              {/* Email field */}
              <div className="space-y-1">
                <SkeletonBase height="h-4" width="w-1/6" />
                <SkeletonBase height="h-10" rounded="rounded-md" />
              </div>
              
              {/* Subject field */}
              <div className="space-y-1">
                <SkeletonBase height="h-4" width="w-1/6" />
                <SkeletonBase height="h-10" rounded="rounded-md" />
              </div>
              
              {/* Message field */}
              <div className="space-y-1">
                <SkeletonBase height="h-4" width="w-1/6" />
                <SkeletonBase height="h-32" rounded="rounded-md" />
              </div>
              
              {/* Submit button */}
              <SkeletonBase 
                height="h-12" 
                width="w-1/3" 
                rounded="rounded-md"
                className="mt-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}