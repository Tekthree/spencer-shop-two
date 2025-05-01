"use client";

import React from 'react';
import { useCart } from '@/context/cart-context';

/**
 * CartOverlay Component
 * Creates a darkening overlay behind the cart drawer when it's open
 * Reason: Enhances focus on the cart by slightly dimming the background content
 */
export default function CartOverlay() {
  const { isOpen, closeCart } = useCart();
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-40 transition-opacity duration-300"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={closeCart}
      aria-hidden="true"
    />
  );
}
