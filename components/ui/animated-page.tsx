"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedPageProps {
  children: ReactNode;
}

/**
 * AnimatedPage component
 * A client component that adds subtle page transition animations
 * This can be used on individual pages without affecting the layout
 * @param children - The page content to be animated
 */
export default function AnimatedPage({ children }: AnimatedPageProps) {
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
