/**
 * API route to retrieve Stripe session details
 * This endpoint is called by the checkout success page to get order information
 */

import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe/stripe-server';
import sql from '@/lib/db/client';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  try {
    // Get the session ID from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Fetching checkout session details for session ID: ${sessionId}`);
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product', 'customer', 'payment_intent'],
    });
    
    console.log('Session retrieved from Stripe:', {
      id: session.id,
      paymentStatus: session.payment_status,
      paymentIntent: session.payment_intent,
      customerEmail: session.customer_details?.email,
      lineItemsCount: session.line_items?.data.length || 0
    });
    
    // Check if there's an order in the database for this session
    const orderRows = await sql`
      SELECT * FROM orders WHERE payment_intent = ${session.payment_intent as string} LIMIT 1
    `;
    const order = orderRows[0] ?? null;

    if (order) {
      console.log('Found order in database:', { id: order.id, status: order.status });
    } else {
      console.warn('No order found in database for this session. This likely means the webhook has not processed this checkout session yet.');
      console.log('Creating fallback order details from session data');
    }
    
    // Define the OrderItem type
    type OrderItem = {
      artwork_id: string;
      title: string;
      size: string;
      price: number;
      edition_number: number;
      quantity: number | null;
    };
    
    // If we don't have an order in the database, create fallback items from the line_items
    let items: OrderItem[] = [];
    if (!order?.items?.length && session.line_items?.data) {
      items = session.line_items.data.map(item => {
        // Use proper typing for Stripe product
        const product = item.price?.product as Stripe.Product & {
          metadata?: {
            artwork_id?: string;
            size?: string;
            edition_number?: string;
          }
        };
        
        return {
          artwork_id: product?.metadata?.artwork_id || 'unknown',
          title: product?.name || 'Artwork',
          size: product?.metadata?.size || 'Standard',
          price: item.amount_total || 0,
          edition_number: parseInt(product?.metadata?.edition_number || '1'),
          quantity: item.quantity
        };
      });
    }
    
    // Extract payment intent ID safely
    let paymentIntentId = null;
    if (session.payment_intent) {
      paymentIntentId = typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent.id;
    }
    
    // Return the session and order details
    return NextResponse.json({
      id: order?.id || sessionId,
      customer: {
        name: session.customer_details?.name,
        email: session.customer_details?.email,
      },
      total: session.amount_total,
      status: order?.status || session.payment_status,
      items: order?.items || items,
      created_at: order?.created_at || new Date().toISOString(),
      // Include debug info
      debug: {
        orderFound: !!order,
        webhookProcessed: !!order,
        sessionId,
        paymentIntentId
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve session';
    console.error('Error retrieving session:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
