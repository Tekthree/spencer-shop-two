/**
 * Stripe webhook handler
 * Processes Stripe events and updates the database accordingly
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe/stripe-server';
import sql from '@/lib/db/client';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email/email-service';
import { format } from 'date-fns';
import { Stripe } from 'stripe';

type OrderItem = {
  artwork_id: string;
  title?: string;
  size: string;
  price: number;
  edition_number?: number;
  quantity: number;
};

type StoredOrder = {
  id: string;
  items: OrderItem[];
};

/**
 * Process a successful payment
 * Updates inventory and creates an order record
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

  if (!paymentIntentId) {
    throw new Error('Paid checkout session is missing a payment intent');
  }

  // Get line items from the session
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

  if (!lineItems.data.length) {
    throw new Error('Paid checkout session has no line items');
  }

  // Get expanded data for each line item
  const expandedLineItems = await Promise.all(
    lineItems.data.map(async item => {
      const product = await stripe.products.retrieve(item.price?.product as string);
      return {
        ...item,
        product
      };
    })
  );

  // Extract order items from line items
  const orderItems: OrderItem[] = expandedLineItems.map(item => {
    const metadata = item.product.metadata;
    const artworkId = metadata.artwork_id;
    const size = metadata.size;
    const quantity = item.quantity || 1;

    if (!artworkId || !size || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Checkout line item is missing valid artwork metadata');
    }

    return {
      artwork_id: artworkId,
      size,
      price: item.amount_total || 0,
      quantity
    };
  });

  console.log('Fulfilling paid checkout:', {
    hasAddress: !!session.customer_details?.address,
    itemsCount: orderItems.length,
    hasCustomerEmail: !!session.customer_details?.email
  });

  const customerInfo = {
    name: session.metadata?.customer_name || 'Unknown Customer',
    email: session.customer_details?.email || 'unknown@example.com',
    address: session.customer_details?.address || {
      line1: 'Unknown',
      city: 'Unknown',
      state: 'Unknown',
      postal_code: 'Unknown',
      country: 'Unknown'
    }
  };

  // The database function claims the payment intent, locks the affected
  // artwork rows, validates remaining inventory, updates every edition count,
  // and finalizes the order in one transaction. Its unique index makes Stripe
  // webhook retries safe even when two invocations arrive concurrently.
  const fulfillmentRows = await sql`
    SELECT * FROM fulfill_checkout_order(
      ${JSON.stringify(customerInfo)}::jsonb,
      ${JSON.stringify(orderItems)}::jsonb,
      ${session.amount_total || 0},
      ${paymentIntentId}
    )
  `;

  if (!fulfillmentRows.length) {
    throw new Error('Checkout fulfillment returned no order');
  }

  const result = fulfillmentRows[0] as {
    order_data: StoredOrder;
    created: boolean;
  };
  const createdOrder = result.order_data;

  if (!result.created) {
    console.log('Duplicate checkout webhook ignored');
    return { order: createdOrder, created: false };
  }

  console.log('Order and inventory committed successfully');

  // Send order confirmation email
  try {
    if (!createdOrder) {
      throw new Error('No order created, cannot send confirmation email');
    }

    const orderNumber = String(createdOrder.id).padStart(6, '0');
    const customerName = session.metadata?.customer_name || 'Valued Customer';
    const customerEmail = session.customer_details?.email || '';

    if (customerEmail) {
      // Prepare email data
      const emailData = {
        orderNumber,
        customerName,
        customerEmail,
        items: createdOrder.items.map(item => ({
          title: item.title || 'Artwork',
          size: item.size,
          price: item.price,
          quantity: item.quantity
        })),
        total: session.amount_total || 0,
        date: format(new Date(), 'MMMM d, yyyy')
      };

      console.log('Sending order confirmation emails');
      await sendOrderConfirmationEmail(emailData);
      await sendAdminOrderNotification(emailData);
      console.log('Order confirmation emails sent successfully');
    } else {
      console.error('Cannot send order confirmation: customer email missing');
    }
  } catch (emailError) {
    console.error('Error sending order confirmation email:', emailError);
    // Don't throw error here to prevent webhook failure
  }

  return { order: createdOrder, created: true };
}

export async function POST(request: NextRequest) {
  console.log('Stripe webhook received at:', new Date().toISOString());

  // Debug: Log environment variables (without exposing secrets)
  console.log('Environment check:', {
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL
  });

  const body = await request.text();
  // Fix: headers() needs to be awaited in newer versions of Next.js
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;

  if (!signature) {
    console.error('Missing Stripe signature header');
    return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
  }

  // Verify the webhook signature
  let event: Stripe.Event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    }

    console.log('Attempting to verify webhook signature...');
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Webhook signature verified successfully');
  } catch (err) {
    const error = err as Error;
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Received checkout.session.completed event');
        const session = event.data.object as Stripe.Checkout.Session;

        // The diagnostic checkout deliberately exercises Stripe without
        // creating an order, changing edition inventory, or sending email.
        // Only trust the marker for sandbox events; a live payment must never
        // be discarded because client-controlled metadata says it is a test.
        if (!event.livemode && session.metadata?.test === 'true') {
          console.log('Sandbox checkout test completed; skipping order processing');
          return NextResponse.json({
            received: true,
            test: true,
            orderCreated: false
          });
        }

        console.log('Checkout session received:', {
          paymentStatus: session.payment_status,
          hasCustomer: !!session.customer,
          hasCustomerEmail: !!session.customer_details?.email,
          hasPaymentIntent: !!session.payment_intent,
          amountTotal: session.amount_total
        });

        // Process the successful payment
        if (session.payment_status === 'paid') {
          console.log('Payment status is paid, processing order...');
          try {
            const result = await handleSuccessfulPayment(session);
            return NextResponse.json({
              received: true,
              orderCreated: result.created,
              duplicate: !result.created
            });
          } catch (error) {
            console.error('Failed to create order:', error);
            throw error; // Re-throw to be caught by the outer try/catch
          }
        } else {
          console.log(`Payment status is not paid: ${session.payment_status}`);
        }
        break;
      }

      // Handle payment_intent events
      case 'payment_intent.succeeded': {
        console.log('Payment intent succeeded');
        // No need to process this separately as we handle checkout.session.completed
        break;
      }

      case 'payment_intent.created': {
        console.log('Payment intent created');
        break;
      }

      // Handle charge events
      case 'charge.succeeded': {
        const charge = event.data.object as Stripe.Charge;
        console.log(`Charge succeeded for amount ${charge.amount}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error(`Error processing webhook: ${error.message}`);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
