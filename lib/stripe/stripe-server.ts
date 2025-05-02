/**
 * Server-side Stripe configuration
 * Handles payment processing for artwork purchases
 */

import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil', // Updated to latest API version
});

export default stripe;
