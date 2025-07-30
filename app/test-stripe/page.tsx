"use client";

import { useState } from 'react';

/**
 * Stripe API Test Page
 * Tests the Stripe checkout flow and API endpoints
 */

// Define type for checkout result
interface CheckoutResult {
  url?: string;
  sessionId?: string;
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}
export default function TestStripePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);


  // Test creating a checkout session with a sample item
  const testCheckout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Sample test data that matches the expected schema
      const testData = {
        items: [
          {
            id: "test-artwork-id", // This would normally be a real artwork ID
            title: "Test Artwork",
            price: 9900, // $99.00
            quantity: 1,
            size: "medium",
            sizeDisplay: "12×16 inches",
            imageUrl: "https://via.placeholder.com/300x400",
          }
        ],
        customerInfo: {
          name: "Test Customer",
          email: "test@example.com",
          address: {
            line1: "123 Test St",
            line2: "Apt 4",
            city: "Test City",
            state: "Test State",
            postal_code: "12345",
            country: "US",
          },
        },
      };

      // Call our checkout API
      const response = await fetch('/api/checkout/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Test retrieving Stripe configuration
  const testStripeConfig = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/checkout/session', {
        method: 'GET',
      });

      const data = await response.json();
      setResult(data);
      
      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Stripe API Test Page</h1>
      
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Stripe Checkout Flow</h2>
          <p className="mb-4 text-gray-700">
            This will test creating a checkout session with a sample item.
            Note: This is a test and won&apos;t create a real order.
          </p>
          <button
            onClick={testCheckout}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Checkout Session'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Stripe Configuration</h2>
          <p className="mb-4 text-gray-700">
            This will test retrieving the Stripe configuration.
          </p>
          <button
            onClick={testStripeConfig}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Stripe Config'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Result</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
