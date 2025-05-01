'use client';

import { SkeletonBase } from './skeleton-base';

/**
 * Skeleton loader for the Checkout page
 * @returns A skeleton placeholder for the Checkout page
 */
export function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page title */}
      <SkeletonBase 
        height="h-8" 
        width="w-1/4" 
        className="mx-auto mb-8"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Checkout form (spans 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contact information */}
          <div className="space-y-4">
            <SkeletonBase height="h-6" width="w-1/3" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <SkeletonBase height="h-4" width="w-1/4" />
                <SkeletonBase height="h-12" rounded="rounded-md" />
              </div>
              <div className="space-y-2">
                <SkeletonBase height="h-4" width="w-1/4" />
                <SkeletonBase height="h-12" rounded="rounded-md" />
              </div>
            </div>
            
            <div className="space-y-2">
              <SkeletonBase height="h-4" width="w-1/4" />
              <SkeletonBase height="h-12" rounded="rounded-md" />
            </div>
          </div>
          
          {/* Shipping address */}
          <div className="space-y-4">
            <SkeletonBase height="h-6" width="w-1/3" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <SkeletonBase height="h-4" width="w-1/4" />
                <SkeletonBase height="h-12" rounded="rounded-md" />
              </div>
              <div className="space-y-2">
                <SkeletonBase height="h-4" width="w-1/4" />
                <SkeletonBase height="h-12" rounded="rounded-md" />
              </div>
            </div>
            
            <div className="space-y-2">
              <SkeletonBase height="h-4" width="w-1/4" />
              <SkeletonBase height="h-12" rounded="rounded-md" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <SkeletonBase height="h-4" width="w-1/2" />
                <SkeletonBase height="h-12" rounded="rounded-md" />
              </div>
              <div className="space-y-2">
                <SkeletonBase height="h-4" width="w-1/2" />
                <SkeletonBase height="h-12" rounded="rounded-md" />
              </div>
              <div className="space-y-2">
                <SkeletonBase height="h-4" width="w-1/2" />
                <SkeletonBase height="h-12" rounded="rounded-md" />
              </div>
            </div>
          </div>
          
          {/* Payment information */}
          <div className="space-y-4">
            <SkeletonBase height="h-6" width="w-1/3" />
            
            {/* Card element placeholder */}
            <SkeletonBase height="h-16" rounded="rounded-md" />
            
            {/* Billing address checkbox */}
            <div className="flex items-center space-x-2 mt-4">
              <SkeletonBase width="w-5" height="h-5" rounded="rounded-sm" />
              <SkeletonBase height="h-4" width="w-3/4" />
            </div>
          </div>
          
          {/* Submit button */}
          <SkeletonBase 
            height="h-12" 
            rounded="rounded-md"
            className="mt-8"
          />
        </div>
        
        {/* Right column - Order summary */}
        <div className="space-y-6 bg-gray-50 p-6 rounded-md h-fit">
          <SkeletonBase height="h-6" width="w-1/2" />
          
          {/* Order items */}
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex space-x-4">
                <SkeletonBase width="w-20" height="h-20" rounded="rounded-sm" />
                <div className="flex-1 space-y-2">
                  <SkeletonBase height="h-4" width="w-3/4" />
                  <SkeletonBase height="h-4" width="w-1/3" />
                  <SkeletonBase height="h-4" width="w-1/4" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Order totals */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <SkeletonBase height="h-4" width="w-1/4" />
              <SkeletonBase height="h-4" width="w-1/4" />
            </div>
            <div className="flex justify-between">
              <SkeletonBase height="h-4" width="w-1/4" />
              <SkeletonBase height="h-4" width="w-1/4" />
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
              <SkeletonBase height="h-5" width="w-1/4" />
              <SkeletonBase height="h-5" width="w-1/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}