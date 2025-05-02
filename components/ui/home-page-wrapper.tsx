"use client";

import { ReactNode } from 'react';
import PageTransition from './page-transition';

interface HomePageWrapperProps {
  children: ReactNode;
}

/**
 * HomePageWrapper component
 * Client component wrapper for the home page to apply animations
 * @param children - The home page content
 */
export default function HomePageWrapper({ children }: HomePageWrapperProps) {
  return <PageTransition>{children}</PageTransition>;
}
