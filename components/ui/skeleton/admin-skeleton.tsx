'use client';

import { SkeletonBase } from './skeleton-base';

/**
 * Base skeleton loader for admin pages
 * @param children - Content to render in the main area
 * @returns A skeleton placeholder for admin pages
 */
export function AdminBaseSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200">
          {/* Logo area */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <SkeletonBase width="w-32" height="h-8" />
          </div>
          
          {/* Navigation links */}
          <div className="flex flex-col flex-grow px-4 space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBase 
                key={index}
                height="h-10" 
                rounded="rounded-md"
              />
            ))}
          </div>
          
          {/* User menu */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <SkeletonBase 
                width="w-10" 
                height="h-10" 
                rounded="rounded-full"
              />
              <SkeletonBase height="h-4" width="w-1/2" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <SkeletonBase height="h-8" width="w-1/3" />
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              <SkeletonBase 
                width="w-8" 
                height="h-8" 
                rounded="rounded-full"
              />
              <SkeletonBase 
                width="w-8" 
                height="h-8" 
                rounded="rounded-full"
              />
            </div>
          </div>
        </div>
        
        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}