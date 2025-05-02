"use client";

import React from 'react';
import { useCart } from '@/context/cart-context';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CartOverlay Component
 * Creates a darkening overlay behind the cart drawer when it's open
 * Reason: Enhances focus on the cart by slightly dimming the background content
 * Enhanced with Framer Motion animations for a smoother experience
 */
export default function CartOverlay() {
  const { isOpen, closeCart } = useCart();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={closeCart}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}
