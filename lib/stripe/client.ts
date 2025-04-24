/**
 * Stripe client configuration for Spencer Grey Artist Website
 * Handles payment processing for artwork purchases
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Load the Stripe publishable key from environment variables
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

// Initialize Stripe promise for client-side usage
let stripePromise: Promise<Stripe | null>;

/**
 * Get the Stripe client instance
 * @returns Promise resolving to Stripe instance
 */
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};
