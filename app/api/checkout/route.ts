import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe/stripe-server';
import sql from '@/lib/db/client';
import { z } from 'zod';
import { enforceRateLimit } from '@/lib/security/rate-limit';

const checkoutSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    size: z.string().trim().min(1).max(100),
    quantity: z.number().int().positive().max(20)
  })).min(1).max(20),
  customerInfo: z.object({
    name: z.string().trim().min(2).max(150),
    email: z.string().trim().email().max(254)
  })
});

type SizeInfo = { size: string; price: number; edition_limit: number; editions_sold: number };
type ArtworkRow = {
  id: string;
  title: string;
  images: Array<{ url?: string }> | string[] | { main?: string } | string | null;
  sizes: SizeInfo[];
  requires_shipping: boolean;
};

function getImageUrl(images: ArtworkRow['images']) {
  if (typeof images === 'string') return images.startsWith('https://') ? images : undefined;
  if (Array.isArray(images)) {
    for (const image of images) {
      const url = typeof image === 'string' ? image : image?.url;
      if (url?.startsWith('https://')) return url;
    }
  }
  if (images && !Array.isArray(images) && images.main?.startsWith('https://')) return images.main;
  return undefined;
}

function getBaseUrl(request: NextRequest) {
  if (process.env.VERCEL_ENV === 'production') return 'https://www.spencergreyart.com';
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  return base.replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  let reservationId: string | null = null;
  let stripeSessionId: string | null = null;

  try {
    const rateLimited = await enforceRateLimit(request, 'checkout-create', 12, 600);
    if (rateLimited) return rateLimited;

    const { items, customerInfo } = checkoutSchema.parse(await request.json());
    const groupedItems = Array.from(items.reduce((grouped, item) => {
      const key = `${item.id}:${item.size}`;
      const existing = grouped.get(key);
      grouped.set(key, { ...item, quantity: (existing?.quantity || 0) + item.quantity });
      return grouped;
    }, new Map<string, { id: string; size: string; quantity: number }>()).values());

    const catalogItems = await Promise.all(groupedItems.map(async item => {
      const rows = await sql`
        SELECT id, title, images, sizes, requires_shipping
        FROM artworks WHERE id = ${item.id} LIMIT 1
      `;
      if (!rows.length) throw new Error('An item in your cart is no longer available.');

      const artwork = rows[0] as ArtworkRow;
      const sizeInfo = artwork.sizes.find(size => size.size === item.size);
      if (!sizeInfo) throw new Error(`${artwork.title} is no longer available in that size.`);
      if (!Number.isInteger(sizeInfo.price) || sizeInfo.price <= 0) {
        throw new Error(`${artwork.title} cannot be purchased right now.`);
      }

      return { item, artwork, sizeInfo };
    }));

    const reservedItems = catalogItems.map(({ item, sizeInfo }) => ({
      artwork_id: item.id,
      size: item.size,
      quantity: item.quantity,
      price: sizeInfo.price
    }));
    reservationId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 31 * 60 * 1000);

    await sql`SELECT reserve_checkout_inventory(
      ${reservationId}::uuid,
      ${JSON.stringify(reservedItems)}::jsonb,
      ${expiresAt.toISOString()}::timestamptz
    )`;

    const requiresShipping = catalogItems.some(({ artwork }) => artwork.requires_shipping);
    const baseUrl = getBaseUrl(request);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: catalogItems.map(({ item, artwork, sizeInfo }) => {
        const imageUrl = getImageUrl(artwork.images);
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${artwork.title} - ${sizeInfo.size}`,
              description: `Limited edition print, ${sizeInfo.edition_limit} total`,
              ...(imageUrl ? { images: [imageUrl] } : {}),
              metadata: { artwork_id: item.id, size: item.size }
            },
            unit_amount: sizeInfo.price
          },
          quantity: item.quantity
        };
      }),
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      customer_email: customerInfo.email,
      expires_at: Math.floor(expiresAt.getTime() / 1000),
      ...(requiresShipping ? {
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU'] as Array<'US' | 'CA' | 'GB' | 'AU'>
        },
        phone_number_collection: { enabled: true }
      } : {}),
      metadata: {
        customer_name: customerInfo.name,
        reservation_id: reservationId,
        requires_shipping: String(requiresShipping)
      }
    });
    stripeSessionId = session.id;

    await sql`SELECT attach_checkout_session(${reservationId}::uuid, ${session.id})`;
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    if (stripeSessionId) {
      try {
        await stripe.checkout.sessions.expire(stripeSessionId);
      } catch (expireError) {
        console.error('Failed to expire incomplete Stripe session:', expireError);
      }
    }
    if (reservationId) {
      try {
        await sql`SELECT release_checkout_reservation(${reservationId}::uuid, 'released')`;
      } catch (releaseError) {
        console.error('Failed to release checkout reservation:', releaseError);
      }
    }

    console.error('Error creating checkout session:', error);
    const safeCatalogError = error instanceof Error && (
      error.message.includes('no longer available') || error.message.includes('cannot be purchased')
    );
    const message = error instanceof z.ZodError
      ? 'Please enter a valid name and email address.'
      : error instanceof Error && error.message.includes('Insufficient inventory')
        ? 'One of these editions was just reserved by another collector. Please review your cart.'
        : safeCatalogError ? error.message : 'Checkout could not be started. Please try again.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
