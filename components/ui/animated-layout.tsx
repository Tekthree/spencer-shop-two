"use client";

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface AnimatedLayoutProps {
  children: ReactNode;
}

/**
 * AnimatedLayout component
 * Provides page transition animations for the entire site
 * Uses Framer Motion's AnimatePresence to handle exit animations
 * @param children - The page content to be animated
 */
export default function AnimatedLayout({ children }: AnimatedLayoutProps) {
  // Get the current pathname to use as a key for AnimatePresence
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
