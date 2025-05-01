'use client';

import { SkeletonBase } from './skeleton-base';
import { AdminBaseSkeleton } from './admin-skeleton';

/**
 * Skeleton loader for the admin collections list page
 * @returns A skeleton placeholder for the admin collections list
 */
export function AdminCollectionsListSkeleton() {
  return (
    <AdminBaseSkeleton>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex justify-between items-center">
          <SkeletonBase height="h-8" width="w-1/4" />
          <SkeletonBase height="h-10" width="w-32" rounded="rounded-md" />
        </div>
        
        {/* Collections grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Collection image */}
              <SkeletonBase height="h-48" rounded="rounded-none" />
              
              {/* Collection details */}
              <div className="p-4 space-y-3">
                <SkeletonBase height="h-5" width="w-3/4" />
                <div className="space-y-2">
                  <SkeletonBase height="h-4" />
                  <SkeletonBase height="h-4" width="w-5/6" />
                </div>
                
                {/* Metadata */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <SkeletonBase height="h-4" width="w-1/3" />
                  <div className="flex space-x-2">
                    <SkeletonBase width="w-8" height="h-8" rounded="rounded-md" />
                    <SkeletonBase width="w-8" height="h-8" rounded="rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminBaseSkeleton>
  );
}

/**
 * Skeleton loader for the admin collection edit/create page
 * @returns A skeleton placeholder for the admin collection edit/create form
 */
export function AdminCollectionFormSkeleton() {
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <SkeletonBase height="h-4" width="w-1/3" />
                <SkeletonBase height="h-10" rounded="rounded-md" />
              </div>
              <div className="flex items-center space-x-2 h-full pt-6">
                <SkeletonBase width="w-5" height="h-5" rounded="rounded-sm" />
                <SkeletonBase height="h-4" width="w-1/2" />
              </div>
            </div>
          </div>
          
          {/* Cover image section */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <SkeletonBase height="h-6" width="w-1/4" />
            
            {/* Image upload area */}
            <SkeletonBase 
              height="h-40" 
              rounded="rounded-md"
              className="border-2 border-dashed border-gray-300"
            />
            
            {/* Image preview */}
            <div className="mt-4">
              <SkeletonBase height="h-48" width="w-64" rounded="rounded-sm" />
            </div>
          </div>
          
          {/* Associated artworks section */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <SkeletonBase height="h-6" width="w-1/3" />
            
            {/* Artworks table */}
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <th key={index} className="px-6 py-3 text-left">
                        <SkeletonBase height="h-5" width={index === 0 ? "w-8" : "w-24"} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: 4 }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {Array.from({ length: 4 }).map((_, colIndex) => (
                        <td key={colIndex} className="px-6 py-4">
                          {colIndex === 0 ? (
                            <SkeletonBase width="w-12" height="h-12" rounded="rounded-sm" />
                          ) : (
                            <SkeletonBase 
                              height="h-4" 
                              width={colIndex === 3 ? "w-20" : "w-32"} 
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Add artwork button */}
            <SkeletonBase height="h-10" width="w-40" rounded="rounded-md" />
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