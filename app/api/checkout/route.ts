/**
 * Stripe checkout API route
 * Creates a checkout session for the cart items
 */

import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe/stripe-server';
// Import the createClient function with a relative path to avoid path alias issues
import { createClient } from '../../../lib/supabase/server';
import { z } from 'zod';

// Define the schema for the checkout request
const checkoutSchema = z.object({
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
    const { items, customerInfo } = checkoutSchema.parse(body);
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Create line items for Stripe checkout
    const lineItems = await Promise.all(
      items.map(async (item) => {
        // Check if the artwork exists and has available editions
        const { data: artwork, error } = await supabase
          .from('artworks')
          .select('id, title, sizes')
          .eq('id', item.id)
          .single();

        if (error || !artwork) {
          throw new Error(`Artwork with ID ${item.id} not found`);
        }

        // Find the selected size in the artwork sizes
        // Define a type for the size information
        type SizeInfo = {
          size: string;
          price: number;
          edition_limit: number;
          editions_sold: number;
        };
        
        const sizeInfo = artwork.sizes.find((s: SizeInfo) => s.size === item.size);
        
        if (!sizeInfo) {
          throw new Error(`Size ${item.size} not available for artwork ${item.id}`);
        }
        
        // Check if there are enough editions available
        if (sizeInfo.editions_sold >= sizeInfo.edition_limit) {
          throw new Error(`No more editions available for ${artwork.title} in size ${item.sizeDisplay}`);
        }

        // Return the line item for Stripe
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${artwork.title} - ${item.sizeDisplay}`,
              description: `Limited Edition Print (${sizeInfo.editions_sold + 1}/${sizeInfo.edition_limit})`,
              images: [item.imageUrl],
              metadata: {
                artwork_id: item.id,
                size: item.size,
                edition_number: sizeInfo.editions_sold + 1,
              },
            },
            unit_amount: item.price,
          },
          quantity: item.quantity,
        };
      })
    );

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      customer_email: customerInfo.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      metadata: {
        customer_name: customerInfo.name,
      },
    });

    // Return the session ID
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    // Define a type for the error
    const error = err as Error;
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 400 }
    );
  }
}
