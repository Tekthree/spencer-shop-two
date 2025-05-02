/**
 * API route to retrieve Stripe session details
 */

import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe/stripe-server';
import { createClient } from '@/lib/supabase/server';

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
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'payment_intent'],
    });
    
    // Check if there's an order in the database for this session
    const supabase = createClient();
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_intent', session.payment_intent as string)
      .single();
    
    // Return the session and order details
    return NextResponse.json({
      id: order?.id || sessionId,
      customer: {
        name: session.customer_details?.name,
        email: session.customer_details?.email,
      },
      total: session.amount_total,
      status: order?.status || session.payment_status,
      items: order?.items || [],
      created_at: order?.created_at || new Date().toISOString(),
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
