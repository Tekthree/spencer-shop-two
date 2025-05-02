"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * PageTransition component
 * Wraps page content with subtle animation effects
 * @param children - The page content to be animated
 */
export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] // Custom easing for subtle, elegant motion
      }}
    >
      {children}
    </motion.div>
  );
}
