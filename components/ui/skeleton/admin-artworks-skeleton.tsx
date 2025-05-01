'use client';

import { SkeletonBase } from './skeleton-base';
import { AdminBaseSkeleton } from './admin-skeleton';

/**
 * Skeleton loader for the admin artworks list page
 * @returns A skeleton placeholder for the admin artworks list
 */
export function AdminArtworksListSkeleton() {
  return (
    <AdminBaseSkeleton>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex justify-between items-center">
          <SkeletonBase height="h-8" width="w-1/4" />
          <SkeletonBase height="h-10" width="w-32" rounded="rounded-md" />
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <SkeletonBase height="h-10" width="w-full sm:w-1/3" rounded="rounded-md" />
          <div className="flex gap-2">
            <SkeletonBase height="h-10" width="w-32" rounded="rounded-md" />
            <SkeletonBase height="h-10" width="w-32" rounded="rounded-md" />
          </div>
        </div>
        
        {/* Artworks table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 5 }).map((_, index) => (
                  <th key={index} className="px-6 py-3 text-left">
                    <SkeletonBase height="h-5" width={index === 0 ? "w-8" : "w-24"} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      {colIndex === 0 ? (
                        <SkeletonBase width="w-12" height="h-12" rounded="rounded-sm" />
                      ) : (
                        <SkeletonBase 
                          height="h-4" 
                          width={colIndex === 4 ? "w-20" : "w-32"} 
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center">
          <SkeletonBase height="h-5" width="w-32" />
          <div className="flex gap-2">
            <SkeletonBase height="h-8" width="w-8" rounded="rounded-md" />
            <SkeletonBase height="h-8" width="w-8" rounded="rounded-md" />
            <SkeletonBase height="h-8" width="w-8" rounded="rounded-md" />
          </div>
        </div>
      </div>
    </AdminBaseSkeleton>
  );
}

/**
 * Skeleton loader for the admin artwork edit/create page
 * @returns A skeleton placeholder for the admin artwork edit/create form
 */
export function AdminArtworkFormSkeleton() {
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
        
        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic info section */}
          <div className="space-y-4">
            <SkeletonBase height="h-6" width="w-1/4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <SkeletonBase height="h-4" width="w-1/4" />
                <SkeletonBase height="h-10" rounded="rounded-md" />
              </div>
              <div className="space-y-2">
                <SkeletonBase height="h-4" width="w-1/4" />
                <SkeletonBase height="h-10" rounded="rounded-md" />
              </div>
            </div>
            
            <div className="space-y-2">
              <SkeletonBase height="h-4" width="w-1/4" />
              <SkeletonBase height="h-32" rounded="rounded-md" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <SkeletonBase height="h-4" width="w-1/2" />
                <SkeletonBase height="h-10" rounded="rounded-md" />
              </div>
              <div className="space-y-2">
                <SkeletonBase height="h-4" width="w-1/2" />
                <SkeletonBase height="h-10" rounded="rounded-md" />
              </div>
              <div className="space-y-2">
                <SkeletonBase height="h-4" width="w-1/2" />
                <SkeletonBase height="h-10" rounded="rounded-md" />
              </div>
            </div>
          </div>
          
          {/* Images section */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <SkeletonBase height="h-6" width="w-1/4" />
            
            {/* Image upload area */}
            <SkeletonBase 
              height="h-40" 
              rounded="rounded-md"
              className="border-2 border-dashed border-gray-300"
            />
            
            {/* Image preview grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="relative">
                  <SkeletonBase height="h-32" rounded="rounded-sm" />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <SkeletonBase width="w-6" height="h-6" rounded="rounded-full" />
                    <SkeletonBase width="w-6" height="h-6" rounded="rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sizes and editions section */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <SkeletonBase height="h-6" width="w-1/3" />
            
            {/* Size entries */}
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-md">
                  <div className="space-y-2">
                    <SkeletonBase height="h-4" width="w-1/2" />
                    <SkeletonBase height="h-10" rounded="rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <SkeletonBase height="h-4" width="w-1/2" />
                    <SkeletonBase height="h-10" rounded="rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <SkeletonBase height="h-4" width="w-1/2" />
                    <SkeletonBase height="h-10" rounded="rounded-md" />
                  </div>
                  <div className="flex items-end">
                    <SkeletonBase height="h-10" width="w-10" rounded="rounded-md" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add size button */}
            <SkeletonBase height="h-10" width="w-32" rounded="rounded-md" />
          </div>
          
          {/* Submit buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <SkeletonBase height="h-10" width="w-24" rounded="rounded-md" />
            <SkeletonBase height="h-10" width="w-24" rounded="rounded-md" />
          </div>
        </div>
      </div>
    </AdminBaseSkeleton>
  );
}