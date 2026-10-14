/**
 * Stripe checkout API route
 * Creates a checkout session for the cart items
 */

import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe/stripe-server';
import sql from '@/lib/db/client';
import { z } from 'zod';

// Define the schema for the checkout request
const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        size: z.string().min(1),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
    .max(20),
  customerInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    address: z.object({
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postal_code: z.string(),
      country: z.string()
    })
  })
});

type SizeInfo = {
  size: string;
  price: number;
  edition_limit: number;
  editions_sold: number;
};

type ArtworkRow = {
  id: string;
  title: string;
  images: Array<{ url?: string }> | null;
  sizes: SizeInfo[];
};

const getBaseUrl = (request: NextRequest) => {
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://www.spencergreyart.com';
  }

  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  const fallbackUrl = request.nextUrl.origin || 'http://localhost:3000';

  const base = vercelUrl || configuredUrl || fallbackUrl;

  return base.endsWith('/') ? base.slice(0, -1) : base;
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate the request body
    const { items, customerInfo } = checkoutSchema.parse(body);

    // Collapse duplicate artwork/size entries before checking inventory. This
    // prevents a crafted request from splitting an over-limit quantity across
    // multiple otherwise-valid line items.
    const groupedItems = Array.from(
      items
        .reduce((grouped, item) => {
          const key = `${item.id}:${item.size}`;
          const existing = grouped.get(key);
          grouped.set(key, {
            id: item.id,
            size: item.size,
            quantity: (existing?.quantity || 0) + item.quantity
          });
          return grouped;
        }, new Map<string, { id: string; size: string; quantity: number }>())
        .values()
    );

    // Create line items for Stripe checkout
    const lineItems = await Promise.all(
      groupedItems.map(async item => {
        // Check if the artwork exists and has available editions
        const rows = await sql`
          SELECT id, title, images, sizes FROM artworks WHERE id = ${item.id} LIMIT 1
        `;

        if (!rows.length) {
          throw new Error(`Artwork with ID ${item.id} not found`);
        }

        const artwork = rows[0] as ArtworkRow;

        const sizeInfo = artwork.sizes.find((s: SizeInfo) => s.size === item.size);

        if (!sizeInfo) {
          throw new Error(`Size ${item.size} not available for artwork ${item.id}`);
        }

        // Check if there are enough editions available
        const remaining = sizeInfo.edition_limit - sizeInfo.editions_sold;
        if (item.quantity > remaining) {
          throw new Error(
            remaining > 0
              ? `Only ${remaining} edition${remaining === 1 ? '' : 's'} of ${artwork.title} in size ${sizeInfo.size} remain`
              : `No more editions are available for ${artwork.title} in size ${sizeInfo.size}`
          );
        }

        if (!Number.isInteger(sizeInfo.price) || sizeInfo.price <= 0) {
          throw new Error(`Invalid catalog price for ${artwork.title} in size ${sizeInfo.size}`);
        }

        const imageUrl = artwork.images?.find(image => image.url?.startsWith('https://'))?.url;

        // Return the line item for Stripe
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${artwork.title} - ${sizeInfo.size}`,
              description: `Limited Edition Print (${sizeInfo.editions_sold + 1}/${sizeInfo.edition_limit})`,
              ...(imageUrl ? { images: [imageUrl] } : {}),
              metadata: {
                artwork_id: item.id,
                size: item.size,
                edition_number: sizeInfo.editions_sold + 1
              }
            },
            // Price is always read from Neon. Values supplied by the browser
            // are intentionally ignored.
            unit_amount: sizeInfo.price
          },
          quantity: item.quantity
        };
      })
    );

    const baseUrl = getBaseUrl(request);

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      customer_email: customerInfo.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU']
      },
      metadata: {
        customer_name: customerInfo.name
      }
    });

    // Return the session ID
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    // Define a type for the error
    const error = err as Error;
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 400 });
  }
}
