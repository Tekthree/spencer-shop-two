"use client";

import { ReactNode } from 'react';
import PageTransitions from './page-transitions';

interface PageTransitionsWrapperProps {
  children: ReactNode;
}

/**
 * PageTransitionsWrapper component
 * Client component wrapper for page transitions
 * This component is imported directly in the layout without dynamic imports
 * @param children - The page content to be animated
 */
export default function PageTransitionsWrapper({ children }: PageTransitionsWrapperProps) {
  return <PageTransitions>{children}</PageTransitions>;
}
