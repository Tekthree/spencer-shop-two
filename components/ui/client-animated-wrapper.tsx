"use client";

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the AnimatedLayout component with ssr: false
// This is allowed here because we're in a Client Component
const AnimatedLayout = dynamic(() => import('./animated-layout'), {
  ssr: false
});

interface ClientAnimatedWrapperProps {
  children: ReactNode;
}

/**
 * ClientAnimatedWrapper component
 * A client component wrapper that uses dynamic import with ssr: false
 * This solves the Next.js 15 error with dynamic imports in Server Components
 * @param children - The page content to be animated
 */
export default function ClientAnimatedWrapper({ children }: ClientAnimatedWrapperProps) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
