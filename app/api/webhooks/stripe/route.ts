/**
 * Stripe webhook handler
 * Processes Stripe events and updates the database accordingly
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe/stripe-server';
// Import Supabase client directly to avoid path issues
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

// Create Supabase client function
function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return supabaseCreateClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });
}
import { Stripe } from 'stripe';

/**
 * Process a successful payment
 * Updates inventory and creates an order record
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  // Initialize Supabase client
  const supabase = createClient();
  
  // Get line items from the session
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  
  // Get expanded data for each line item
  const expandedLineItems = await Promise.all(
    lineItems.data.map(async (item) => {
      const product = await stripe.products.retrieve(item.price?.product as string);
      return {
        ...item,
        product,
      };
    })
  );
  
  // Extract order items from line items
  const orderItems = expandedLineItems.map((item) => {
    const metadata = item.product.metadata;
    return {
      artwork_id: metadata.artwork_id,
      size: metadata.size,
      price: item.amount_total,
      edition_number: parseInt(metadata.edition_number),
      quantity: item.quantity,
    };
  });
  
  // Create order record in Supabase
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_info: {
        name: session.metadata?.customer_name,
        email: session.customer_details?.email,
        address: session.customer_details?.address,
      },
      items: orderItems,
      total: session.amount_total,
      status: 'paid',
      payment_intent: session.payment_intent as string,
    })
    .select()
    .single();
  
  if (orderError) {
    console.error('Error creating order:', orderError);
    throw new Error('Failed to create order record');
  }
  
  // Update artwork editions_sold for each item
  for (const item of orderItems) {
    // Get the current artwork data
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select('sizes')
      .eq('id', item.artwork_id)
      .single();
    
    if (artworkError) {
      console.error(`Error fetching artwork ${item.artwork_id}:`, artworkError);
      continue;
    }
    
    // Update the editions_sold count for the specific size
    type SizeInfo = {
      size: string;
      price: number;
      edition_limit: number;
      editions_sold: number;
    };
    
    const updatedSizes = artwork.sizes.map((sizeInfo: SizeInfo) => {
      if (sizeInfo.size === item.size) {
        return {
          ...sizeInfo,
          editions_sold: sizeInfo.editions_sold + (item.quantity || 1),
        };
      }
      return sizeInfo;
    });
    
    // Update the artwork record
    const { error: updateError } = await supabase
      .from('artworks')
      .update({ sizes: updatedSizes })
      .eq('id', item.artwork_id);
    
    if (updateError) {
      console.error(`Error updating artwork ${item.artwork_id}:`, updateError);
    }
  }
  
  return order;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  // Fix: headers() needs to be awaited in newer versions of Next.js
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;
  
  // Verify the webhook signature
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const error = err as Error;
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  // Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Process the successful payment
        if (session.payment_status === 'paid') {
          const order = await handleSuccessfulPayment(session);
          return NextResponse.json({ success: true, order });
        }
        break;
      
      // Handle payment_intent events
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} was successful!`);
        // No need to process this separately as we handle checkout.session.completed
        break;
        
      case 'payment_intent.created':
        const createdIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${createdIntent.id} was created`);
        break;
      
      // Handle charge events
      case 'charge.succeeded':
        const charge = event.data.object as Stripe.Charge;
        console.log(`Charge ${charge.id} succeeded for amount ${charge.amount}`);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error(`Error processing webhook: ${error.message}`);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
