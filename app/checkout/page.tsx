"use client";

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { getStripe } from '@/lib/stripe/client';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Checkout Page
 * Handles the checkout process for the cart items
 */
export default function CheckoutPage() {
  const { cartItems, subtotal, updateQuantity, removeFromCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
  });

  // Format price from cents to dollars
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Handle input changes for customer information
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., address.line1)
      const [parent, child] = name.split('.');
      if (parent === 'address') {
        setCustomerInfo(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [child]: value,
          },
        }));
      }
    } else {
      // Handle top-level properties
      setCustomerInfo(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
      // Create a checkout session through the API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          customerInfo,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const { sessionId, url } = await response.json();
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        // If no URL is returned, use the client-side redirect
        const stripe = await getStripe();
        await stripe?.redirectToCheckout({ sessionId });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during checkout';
      console.error('Checkout error:', error);
      alert(errorMessage);
      setIsLoading(false);
    }
  };

  // If cart is empty, show a message
  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-serif mb-6">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8">
            Looks like you haven&apos;t added any artwork to your cart yet.
          </p>
          <Link 
            href="/shop" 
            className="inline-block bg-black text-white py-3 px-8 rounded-md hover:bg-gray-800 transition-colors"
          >
            Browse Artwork
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif mb-10">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items (Left Column) */}
        <div className="lg:col-span-2">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-xl font-medium">Order Summary</h2>
          </div>
          
          <ul className="divide-y divide-gray-100">
            {cartItems.map((item) => (
              <li key={`${item.id}-${item.size}`} className="py-6 flex">
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
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">Size: {item.sizeDisplay}</p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center border-t border-b border-gray-300">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="ml-auto text-sm text-gray-500 hover:text-black underline"
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Order Summary (Right Column) */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-4">
                <span className="font-medium">Total</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
            </div>
            
            {/* Customer Information */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-600 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Shipping address will be collected during payment.
              </p>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={isLoading || !customerInfo.name || !customerInfo.email}
              className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>
            
            <div className="mt-6 space-y-4 text-sm text-gray-600">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p>Secure payment processing</p>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <p>Free shipping on all orders</p>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p>Certificate of authenticity included</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}