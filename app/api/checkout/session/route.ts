import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import stripe from '@/lib/stripe/stripe-server';
import sql from '@/lib/db/client';
import { formatOrderNumber } from '@/lib/orders/order-number';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return NextResponse.json({ error: 'A valid checkout session is required.' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product']
    });
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;
    const orderRows = paymentIntentId
      ? await sql`SELECT * FROM orders WHERE payment_intent = ${paymentIntentId} LIMIT 1`
      : [];
    const order = orderRows[0] ?? null;

    const fallbackItems = session.line_items?.data.map(item => {
      const product = item.price?.product as Stripe.Product;
      return {
        artwork_id: product?.metadata?.artwork_id || 'unknown',
        title: product?.name?.replace(new RegExp(` - ${product?.metadata?.size || ''}$`), '') || 'Artwork',
        image_url: product?.images?.[0],
        size: product?.metadata?.size || 'Standard',
        price: item.price?.unit_amount || 0,
        quantity: item.quantity || 1
      };
    }) || [];

    return NextResponse.json({
      fulfilled: Boolean(order),
      paymentReceived: session.payment_status === 'paid',
      orderNumber: order ? formatOrderNumber(order.order_number as number, order.created_at as string) : null,
      customer: {
        name: order?.customer_info?.name || session.metadata?.customer_name || session.customer_details?.name,
        email: order?.customer_info?.email || session.customer_details?.email
      },
      total: session.amount_total,
      status: order?.status || 'confirming',
      requiresShipping: order?.requires_shipping ?? session.metadata?.requires_shipping === 'true',
      items: order?.items?.length ? order.items : fallbackItems,
      createdAt: order?.created_at || new Date(session.created * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json({ error: 'We could not verify this payment yet. Please try again shortly.' }, { status: 400 });
  }
}
