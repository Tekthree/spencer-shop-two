"use client";

import { ReactNode } from 'react';

interface StaticLayoutProps {
  children: ReactNode;
}

/**
 * StaticLayout component
 * A simple wrapper with no animations
 * @param children - The page content
 */
export default function StaticLayout({ children }: StaticLayoutProps) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
