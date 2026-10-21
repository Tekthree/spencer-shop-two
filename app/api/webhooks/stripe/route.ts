import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import Stripe from 'stripe';
import stripe from '@/lib/stripe/stripe-server';
import sql from '@/lib/db/client';
import { sendAdminOrderNotification, sendOrderConfirmationEmail } from '@/lib/email/email-service';
import { formatOrderNumber } from '@/lib/orders/order-number';
import { reportOperationalError } from '@/lib/operations/report';

type OrderItem = {
  artwork_id: string;
  title?: string;
  size: string;
  price: number;
  edition_number?: number;
  edition_numbers?: number[];
  edition_limit?: number;
  quantity: number;
  requires_shipping?: boolean;
  image_url?: string;
};

type StoredOrder = {
  id: string;
  order_number: number;
  items: OrderItem[];
  requires_shipping: boolean;
};

function getPaymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const paymentIntentId = getPaymentIntentId(session);
  const reservationId = session.metadata?.reservation_id;
  if (!paymentIntentId || !reservationId) {
    throw new Error('Paid checkout session is missing fulfillment metadata');
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ['data.price.product']
  });
  if (!lineItems.data.length) throw new Error('Paid checkout session has no line items');

  const orderItems: OrderItem[] = lineItems.data.map(item => {
    const product = item.price?.product as Stripe.Product;
    const quantity = item.quantity || 1;
    const unitPrice = item.price?.unit_amount;
    if (!product?.metadata.artwork_id || !product.metadata.size || !unitPrice || quantity < 1) {
      throw new Error('Checkout line item is missing valid artwork metadata');
    }
    return {
      artwork_id: product.metadata.artwork_id,
      title: product.name.replace(new RegExp(` - ${product.metadata.size}$`), ''),
      size: product.metadata.size,
      price: unitPrice,
      quantity
    };
  });

  const shipping = session.collected_information?.shipping_details;
  const billingAddress = session.customer_details?.address;
  const address = shipping?.address || (session.metadata?.requires_shipping === 'true' ? null : billingAddress);
  const customerInfo = {
    name: shipping?.name || session.metadata?.customer_name || session.customer_details?.name || 'Customer',
    email: session.customer_details?.email || '',
    phone: session.customer_details?.phone || null,
    address: address ? {
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country
    } : null
  };

  if (!customerInfo.email) throw new Error('Paid checkout session is missing the customer email');
  if (session.metadata?.requires_shipping === 'true' && !shipping?.address) {
    throw new Error('Paid shippable checkout is missing its shipping address');
  }

  const fulfillmentRows = await sql`
    SELECT * FROM fulfill_reserved_checkout_order(
      ${JSON.stringify(customerInfo)}::jsonb,
      ${JSON.stringify(orderItems)}::jsonb,
      ${session.amount_total || 0},
      ${paymentIntentId},
      ${session.id},
      ${reservationId}::uuid
    )
  `;
  if (!fulfillmentRows.length) throw new Error('Checkout fulfillment returned no order');

  const result = fulfillmentRows[0] as { order_data: StoredOrder; created: boolean };
  const order = result.order_data;
  const orderNumber = formatOrderNumber(order.order_number, new Date(session.created * 1000).toISOString())!;
  const emailData = {
    orderId: order.id,
    orderNumber,
    customerName: customerInfo.name,
    customerEmail: customerInfo.email,
    items: order.items.map(item => ({
      title: item.title || 'Artwork',
      size: item.size,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.image_url,
      editionNumbers: item.edition_numbers?.length ? item.edition_numbers : item.edition_number ? [item.edition_number] : undefined,
      editionLimit: item.edition_limit
    })),
    total: session.amount_total || 0,
    date: format(new Date(session.created * 1000), 'MMMM d, yyyy'),
    requiresShipping: order.requires_shipping
  };

  const [customerEmailResult, adminEmailResult] = await Promise.all([
    sendOrderConfirmationEmail(emailData),
    sendAdminOrderNotification(emailData)
  ]);
  console.log('Order fulfilled and emails accepted', {
    orderId: order.id,
    created: result.created,
    customerEmailId: customerEmailResult.id,
    adminEmailId: adminEmailResult.id
  });
  return result;
}

async function releaseExpiredSession(session: Stripe.Checkout.Session) {
  const reservationId = session.metadata?.reservation_id;
  if (reservationId) {
    await sql`SELECT release_checkout_reservation(${reservationId}::uuid, 'expired')`;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe webhook secret is not configured');
    return NextResponse.json({ error: 'Webhook unavailable' }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (!event.livemode && session.metadata?.test === 'true') {
        return NextResponse.json({ received: true, test: true });
      }
      if (session.payment_status === 'paid') {
        const result = await handleSuccessfulPayment(session);
        return NextResponse.json({ received: true, orderCreated: result.created, duplicate: !result.created });
      }
    }

    if (event.type === 'checkout.session.expired') {
      await releaseExpiredSession(event.data.object as Stripe.Checkout.Session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Stripe webhook ${event.id} failed:`, error);
    try {
      await reportOperationalError({
        source: 'stripe-webhook',
        eventKey: `stripe-webhook:${event.id}`,
        message: 'A Stripe webhook could not finish processing. Stripe will retry it automatically.',
        error,
        metadata: { stripe_event_id: event.id, stripe_event_type: event.type }
      });
    } catch (reportError) {
      console.error('Could not record the webhook failure:', reportError);
    }
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
