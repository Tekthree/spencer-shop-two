"use client";

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the StaticLayout component with ssr: false
// This maintains the same pattern but without animations
const StaticLayout = dynamic(() => import('./static-layout'), {
  ssr: false
});

interface ClientStaticWrapperProps {
  children: ReactNode;
}

/**
 * ClientStaticWrapper component
 * A client component wrapper without animations
 * This maintains the same pattern as before but removes animations
 * @param children - The page content
 */
export default function ClientStaticWrapper({ children }: ClientStaticWrapperProps) {
  return <StaticLayout>{children}</StaticLayout>;
}
