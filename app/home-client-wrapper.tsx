"use client";

import { ReactNode } from 'react';
import AnimatedPage from "@/components/ui/animated-page";

interface HomeClientWrapperProps {
  children: ReactNode;
}

/**
 * HomeClientWrapper component
 * A client component wrapper for the home page to apply animations
 * This follows Next.js 15 best practices by keeping animations in client components
 * @param children - The home page content
 */
export default function HomeClientWrapper({ children }: HomeClientWrapperProps) {
  return <AnimatedPage>{children}</AnimatedPage>;
}
