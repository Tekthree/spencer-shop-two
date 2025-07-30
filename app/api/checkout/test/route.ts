/**
 * Test Stripe API route
 * For testing Stripe integration without creating real orders
 */

import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe/stripe-server';
import { z } from 'zod';

// Define the schema for the test checkout request
const testCheckoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      price: z.number(),
      quantity: z.number(),
      size: z.string(),
      sizeDisplay: z.string(),
      imageUrl: z.string(),
    })
  ),
  customerInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    address: z.object({
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postal_code: z.string(),
      country: z.string(),
    }),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the request body
    const { items, customerInfo } = testCheckoutSchema.parse(body);
    
    // Create line items for Stripe checkout (test mode)
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.title} - ${item.sizeDisplay} (TEST)`,
          description: `Test Item - No order will be created`,
          images: [item.imageUrl],
          metadata: {
            test: 'true',
            artwork_id: item.id,
            size: item.size,
          },
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    // Create a checkout session in test mode
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/test-stripe?result=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/test-stripe?result=cancel`,
      customer_email: customerInfo.email,
      metadata: {
        test: 'true',
        customer_name: customerInfo.name,
      },
    });

    // Return the session ID and URL
    return NextResponse.json({ 
      success: true,
      sessionId: session.id, 
      url: session.url,
      message: 'Test checkout session created successfully'
    });
  } catch (err) {
    // Define a type for the error
    const error = err as Error;
    console.error('Error creating test checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create test checkout session' },
      { status: 400 }
    );
  }
}
