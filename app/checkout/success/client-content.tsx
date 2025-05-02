"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';

// Define the OrderDetails type
type OrderDetails = {
  id: string;
  customer?: {
    name?: string;
    email?: string;
  };
  total: number;
  status: string;
  items: Array<{
    artwork_id: string;
    size: string;
    price: number;
    edition_number: number;
    quantity: number;
  }>;
  created_at: string;
};

/**
 * Client component for checkout success page
 * Handles fetching order details and displaying them
 */
export function ClientSuccessContent() {
  // Use a stable reference for the session ID
  const searchParams = useSearchParams();
  const sessionIdRef = useRef<string | null>(searchParams.get('session_id'));
  const { clearCart } = useCart();
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to track if we've already fetched the order details
  const hasOrderBeenFetched = useRef(false);

  // Effect for cart clearing - run only once
  useEffect(() => {
    // Clear the cart when the component mounts
    clearCart();
    // We intentionally only want this to run once on mount
    // and not re-run when clearCart changes
  }, [clearCart]);

  // Separate effect for fetching order details - run only once
  useEffect(() => {
    // Only run this once
    if (hasOrderBeenFetched.current) return;
    
    const sessionId = sessionIdRef.current;
    
    if (sessionId) {
      hasOrderBeenFetched.current = true;
      fetchOrderDetails(sessionId);
    } else {
      setLoading(false);
      setError("No session ID provided");
    }
  }, []); // Empty dependency array ensures this runs only once

  /**
   * Fetch order details from the session ID
   */
  const fetchOrderDetails = async (sessionId: string) => {
    try {
      console.log("Fetching order details for session:", sessionId);
      const response = await fetch(`/api/checkout/session?session_id=${sessionId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }
      
      const data = await response.json();
      console.log("Order details received:", data);
      
      // Update state in a safe way
      if (!hasOrderBeenFetched.current) return; // Safety check in case component unmounts
      setOrderDetails(data);
      setLoading(false);
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching order details:", error);
      
      // Update state in a safe way
      if (!hasOrderBeenFetched.current) return; // Safety check in case component unmounts
      setError(error.message || "An error occurred");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-32 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-serif mb-6">Something went wrong</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <Link 
          href="/shop" 
          className="inline-block bg-black text-white py-3 px-8 rounded-md hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <svg 
          className="w-16 h-16 text-green-500 mx-auto mb-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
        <h1 className="text-3xl font-serif mb-4">Thank You for Your Order!</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Your order has been received and is being processed. You&apos;ll receive a confirmation email shortly.
        </p>
      </div>

      {orderDetails && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-600">Order ID</span>
              <span className="font-mono">{orderDetails.id || sessionIdRef.current}</span>
            </div>
            
            {orderDetails.customer && (
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Customer</span>
                <span>{orderDetails.customer.name || orderDetails.customer.email}</span>
              </div>
            )}
            
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-600">Date</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            
            <div className="flex justify-between pt-2">
              <span className="font-medium">Total</span>
              <span className="font-medium">
                {orderDetails.total
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(orderDetails.total / 100)
                  : "Processing"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-medium mb-4">What&apos;s Next?</h2>
        <ul className="space-y-4 text-gray-600">
          <li className="flex items-start">
            <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>You will receive an order confirmation email shortly.</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Your artwork will be carefully printed and prepared for shipping.</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <span>You will receive a shipping confirmation with tracking details when your order ships.</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>A certificate of authenticity will be included with your limited edition print.</span>
          </li>
        </ul>
      </div>

      <div className="text-center">
        <Link 
          href="/shop" 
          className="inline-block bg-black text-white py-3 px-8 rounded-md hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
