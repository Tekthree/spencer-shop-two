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

/**
 * Process a successful payment
 * Updates inventory and creates an order record
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  console.log('Starting handleSuccessfulPayment for session:', session.id);

  // Test DB connection
  try {
    const test = await sql`SELECT COUNT(*)::int AS count FROM orders`;
    console.log('DB connection successful, found', (test[0] as { count: number }).count, 'orders');
  } catch (err) {
    console.error('Error testing DB connection:', err);
    throw err;
  }

  // Get line items from the session
  console.log('Fetching line items for session:', session.id);
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

  // Define the type for order items
  type OrderItem = {
    artwork_id: string;
    size: string;
    price: number;
    edition_number: number;
    quantity: number | null;
    title?: string; // Add optional title property for email template
  };

  // Extract order items from line items
  const orderItems: OrderItem[] = expandedLineItems.map((item) => {
    const metadata = item.product.metadata;
    return {
      artwork_id: metadata.artwork_id,
      size: metadata.size,
      price: item.amount_total,
      edition_number: parseInt(metadata.edition_number),
      quantity: item.quantity,
    };
  });

  // Log the order data we're about to insert
  console.log('Creating order with data:', {
    customerName: session.metadata?.customer_name,
    customerEmail: session.customer_details?.email,
    hasAddress: !!session.customer_details?.address,
    itemsCount: orderItems.length,
    total: session.amount_total,
    paymentIntent: session.payment_intent
  });

  // Create order record in database
  let createdOrder;
  try {
    const orderData = {
      customer_info: {
        name: session.metadata?.customer_name || 'Unknown Customer',
        email: session.customer_details?.email || 'unknown@example.com',
        address: session.customer_details?.address || {
          line1: 'Unknown',
          city: 'Unknown',
          state: 'Unknown',
          postal_code: 'Unknown',
          country: 'Unknown'
        },
      },
      items: orderItems,
      total: session.amount_total || 0,
      status: 'paid',
      payment_intent: (session.payment_intent as string) || `pi_unknown_${Date.now()}`,
    };

    console.log('Inserting order into database...');
    const rows = await sql`
      INSERT INTO orders (customer_info, items, total, status, payment_intent)
      VALUES (
        ${JSON.stringify(orderData.customer_info)}::jsonb,
        ${JSON.stringify(orderData.items)}::jsonb,
        ${orderData.total},
        ${orderData.status},
        ${orderData.payment_intent}
      )
      RETURNING *
    `;

    if (!rows.length) {
      throw new Error('Order was created but no data was returned');
    }

    createdOrder = rows[0];
    console.log('Order created successfully:', createdOrder.id);
  } catch (err) {
    console.error('Exception during order creation:', err);
    throw err;
  }

  // Update artwork editions_sold for each item
  for (const item of orderItems) {
    try {
      console.log(`Processing artwork update for item: ${item.artwork_id}`);

      // Get the current artwork data
      const artworkRows = await sql`SELECT sizes, title FROM artworks WHERE id = ${item.artwork_id} LIMIT 1`;

      if (!artworkRows.length) {
        console.warn(`Artwork ${item.artwork_id} not found in database`);
        continue;
      }

      const artwork = artworkRows[0] as { sizes: Array<{ size: string; price: number; edition_limit: number; editions_sold: number }>; title: string };

      // Add title to the order item for email template
      item.title = artwork.title;

      // Update the editions_sold count for the specific size
      const updatedSizes = artwork.sizes.map((sizeInfo) => {
        if (sizeInfo.size === item.size) {
          return {
            ...sizeInfo,
            editions_sold: sizeInfo.editions_sold + (item.quantity || 1),
          };
        }
        return sizeInfo;
      });

      // Update the artwork record
      console.log(`Updating sizes for artwork: ${item.artwork_id}`);
      await sql`
        UPDATE artworks SET sizes = ${JSON.stringify(updatedSizes)}::jsonb WHERE id = ${item.artwork_id}
      `;
      console.log(`Successfully updated artwork: ${item.artwork_id}`);
    } catch (err) {
      console.error(`Exception processing artwork ${item.artwork_id}:`, err);
      // Continue with other items
    }
  }

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
        items: orderItems.map(item => ({
          title: item.title || 'Artwork',
          size: item.size,
          price: item.price,
          quantity: item.quantity || 1
        })),
        total: session.amount_total || 0,
        date: format(new Date(), 'MMMM d, yyyy')
      };

      console.log('Sending order confirmation email to:', customerEmail);
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

  return createdOrder;
}

export async function POST(request: NextRequest) {
  console.log('Stripe webhook received at:', new Date().toISOString());

  // Debug: Log environment variables (without exposing secrets)
  console.log('Environment check:', {
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
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
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
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

        console.log('Session details:', {
          id: session.id,
          paymentStatus: session.payment_status,
          customerId: session.customer,
          customerEmail: session.customer_details?.email,
          hasPaymentIntent: !!session.payment_intent,
          metadata: session.metadata,
          amountTotal: session.amount_total
        });

        // Process the successful payment
        if (session.payment_status === 'paid') {
          console.log('Payment status is paid, processing order...');
          try {
            const order = await handleSuccessfulPayment(session);
            console.log('Order created successfully:', order.id);
            return NextResponse.json({ success: true, order });
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
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} was successful!`);
        // No need to process this separately as we handle checkout.session.completed
        break;
      }

      case 'payment_intent.created': {
        const createdIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${createdIntent.id} was created`);
        break;
      }

      // Handle charge events
      case 'charge.succeeded': {
        const charge = event.data.object as Stripe.Charge;
        console.log(`Charge ${charge.id} succeeded for amount ${charge.amount}`);
        break;
      }

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
