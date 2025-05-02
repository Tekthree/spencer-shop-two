"use client";

import { ReactNode } from 'react';
import PageTransition from './page-transition';

interface PageWrapperProps {
  children: ReactNode;
}

/**
 * PageWrapper component
 * Wraps page content with the PageTransition component
 * This makes it easy to apply consistent transitions across all pages
 * @param children - The page content to be wrapped
 */
export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <PageTransition>
      <div className="w-full">
        {children}
      </div>
    </PageTransition>
  );
}
