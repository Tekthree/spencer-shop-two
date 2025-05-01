'use client';

import { SkeletonBase } from './skeleton-base';
import { AdminBaseSkeleton } from './admin-skeleton';

/**
 * Skeleton loader for the admin about page editor
 * @returns A skeleton placeholder for the admin about page editor
 */
export function AdminAboutSkeleton() {
  return (
    <AdminBaseSkeleton>
      <div className="space-y-8">
        {/* Page header */}
        <div className="flex justify-between items-center">
          <SkeletonBase height="h-8" width="w-1/3" />
          <div className="flex gap-2">
            <SkeletonBase height="h-10" width="w-24" rounded="rounded-md" />
            <SkeletonBase height="h-10" width="w-24" rounded="rounded-md" />
          </div>
        </div>
        
        {/* About sections */}
        <div className="space-y-8">
          {/* Artist statement section */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-center">
              <SkeletonBase height="h-6" width="w-1/4" />
              <SkeletonBase width="w-8" height="h-8" rounded="rounded-md" />
            </div>
            
            <div className="space-y-2">
              <SkeletonBase height="h-4" width="w-1/4" />
              <SkeletonBase height="h-32" rounded="rounded-md" />
            </div>
          </div>
          
          {/* Main artist image section */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-center">
              <SkeletonBase height="h-6" width="w-1/4" />
              <SkeletonBase width="w-8" height="h-8" rounded="rounded-md" />
            </div>
            
            {/* Image upload area */}
            <SkeletonBase 
              height="h-40" 
              rounded="rounded-md"
              className="border-2 border-dashed border-gray-300"
            />
            
            {/* Image preview */}
            <div className="mt-4">
              <SkeletonBase height="h-64" width="w-full" rounded="rounded-sm" />
            </div>
          </div>
          
          {/* Main description section */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-center">
              <SkeletonBase height="h-6" width="w-1/4" />
              <SkeletonBase width="w-8" height="h-8" rounded="rounded-md" />
            </div>
            
            <div className="space-y-2">
              <SkeletonBase height="h-4" width="w-1/4" />
              <SkeletonBase height="h-48" rounded="rounded-md" />
            </div>
          </div>
          
          {/* Gallery image cluster section */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-center">
              <SkeletonBase height="h-6" width="w-1/3" />
              <SkeletonBase width="w-8" height="h-8" rounded="rounded-md" />
            </div>
            
            {/* Image upload area */}
            <SkeletonBase 
              height="h-40" 
              rounded="rounded-md"
              className="border-2 border-dashed border-gray-300"
            />
            
            {/* Image preview grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="relative">
                  <SkeletonBase height="h-48" rounded="rounded-sm" />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <SkeletonBase width="w-6" height="h-6" rounded="rounded-full" />
                    <SkeletonBase width="w-6" height="h-6" rounded="rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Secondary description section */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-center">
              <SkeletonBase height="h-6" width="w-1/3" />
              <SkeletonBase width="w-8" height="h-8" rounded="rounded-md" />
            </div>
            
            <div className="space-y-2">
              <SkeletonBase height="h-4" width="w-1/4" />
              <SkeletonBase height="h-32" rounded="rounded-md" />
            </div>
          </div>
          
          {/* Artist signature section */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-center">
              <SkeletonBase height="h-6" width="w-1/4" />
              <SkeletonBase width="w-8" height="h-8" rounded="rounded-md" />
            </div>
            
            {/* Image upload area */}
            <SkeletonBase 
              height="h-40" 
              rounded="rounded-md"
              className="border-2 border-dashed border-gray-300"
            />
            
            {/* Image preview */}
            <div className="mt-4">
              <SkeletonBase height="h-16" width="w-48" rounded="rounded-sm" />
            </div>
          </div>
          
          {/* Featured artworks section */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-center">
              <SkeletonBase height="h-6" width="w-1/3" />
              <SkeletonBase width="w-8" height="h-8" rounded="rounded-md" />
            </div>
            
            {/* Artworks selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-3 space-y-2">
                  <SkeletonBase height="h-40" rounded="rounded-sm" />
                  <SkeletonBase height="h-4" width="w-3/4" />
                  <div className="flex justify-between items-center">
                    <SkeletonBase height="h-4" width="w-1/4" />
                    <SkeletonBase width="w-6" height="h-6" rounded="rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add artwork button */}
            <SkeletonBase height="h-10" width="w-40" rounded="rounded-md" />
          </div>
        </div>
        
        {/* Submit buttons */}
        <div className="flex justify-end space-x-3">
          <SkeletonBase height="h-10" width="w-24" rounded="rounded-md" />
          <SkeletonBase height="h-10" width="w-24" rounded="rounded-md" />
        </div>
      </div>
    </AdminBaseSkeleton>
  );
}