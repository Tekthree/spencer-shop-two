"use client";

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionsProps {
  children: ReactNode;
}

/**
 * PageTransitions component
 * Provides subtle page transition animations using Framer Motion
 * Uses the current pathname as a key for AnimatePresence to properly handle transitions
 * @param children - The page content to be animated
 */
export default function PageTransitions({ children }: PageTransitionsProps) {
  const pathname = usePathname();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ 
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1] // Custom easing for subtle, elegant motion
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
