"use client";

import React from 'react';
import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Cart Drawer Component
 * Displays a sliding drawer from the right side of the page with cart contents
 */
export default function CartDrawer() {
  const { 
    isOpen, 
    closeCart, 
    cartItems, 
    removeFromCart, 
    updateQuantity,
    subtotal 
  } = useCart();

  // Format price from cents to dollars
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30,
            mass: 1
          }}
          aria-hidden={!isOpen}
          role="dialog"
          aria-modal="true"
        >
        <div className="flex flex-col h-full">
          {/* Cart Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-2xl font-serif">My Cart</h2>
            <button 
              onClick={closeCart}
              className="text-gray-400 hover:text-black transition-colors"
              aria-label="Close cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <button 
                  onClick={closeCart}
                  className="text-sm underline text-gray-600 hover:text-black transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <motion.ul className="space-y-6">
                {cartItems.map((item) => (
                  <motion.li 
                    key={`${item.id}-${item.size}`} 
                    className="flex border-b border-gray-100 pb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 relative flex-shrink-0 border border-gray-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">Size: {item.sizeDisplay}</p>
                      <p className="font-medium">{formatPrice(item.price)}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center mt-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          −
                        </motion.button>
                        <motion.span 
                          key={item.quantity}
                          initial={{ opacity: 0.8, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-8 h-8 flex items-center justify-center border-t border-b border-gray-300"
                        >
                          {item.quantity}
                        </motion.span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          +
                        </motion.button>
                        
                        {/* Remove Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeFromCart(item.id, item.size)}
                          className="ml-auto text-sm text-gray-500 hover:text-black underline"
                          aria-label="Remove item"
                        >
                          REMOVE
                        </motion.button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-100 p-6">
              {/* Subtotal */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-xl font-medium">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-500 mb-4 text-center">
                (Shipping and taxes calculated at checkout)
              </p>

              {/* Checkout Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Link 
                  href="/checkout"
                  className="block w-full bg-black text-white py-3 px-6 text-center uppercase tracking-wide hover:bg-gray-800 transition-colors"
                >
                  GO TO CHECKOUT
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs text-gray-500">Secure Encrypted Transactions</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <span className="text-xs text-gray-500">Free Shipping in the USA, EU, and UK</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span className="text-xs text-gray-500">Every print is made-to-order</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}