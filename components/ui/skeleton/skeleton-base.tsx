'use client';

import { cn } from '@/lib/utils';

/**
 * Base skeleton component for loading states
 * @param className - Additional CSS classes
 * @param width - Width of the skeleton
 * @param height - Height of the skeleton
 * @param rounded - Border radius value
 * @returns A skeleton placeholder element
 */
interface SkeletonBaseProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

export function SkeletonBase({
  className,
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-md',
}: SkeletonBaseProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        width,
        height,
        rounded,
        className
      )}
    />
  );
}