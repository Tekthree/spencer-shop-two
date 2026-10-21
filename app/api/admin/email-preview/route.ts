import { NextResponse } from 'next/server';
import sql from '@/lib/db/client';
import { requireAdminApi } from '@/lib/auth/admin-api';
import { sendOrderConfirmationEmail } from '@/lib/email/email-service';

type ArtworkPreview = {
  title: string;
  images: Array<{ url?: string } | string> | { main?: string } | string | null;
  sizes: Array<{
    size: string;
    price: number;
    edition_limit: number;
    editions_sold: number;
  }>;
};

function getImageUrl(images: ArtworkPreview['images']) {
  let value: string | undefined;
  if (typeof images === 'string') value = images;
  else if (Array.isArray(images)) {
    const first = images[0];
    value = typeof first === 'string' ? first : first?.url;
  } else value = images?.main;

  if (!value) return undefined;
  return value.startsWith('https://') ? value : `https://www.spencergreyart.com${value.startsWith('/') ? '' : '/'}${value}`;
}

export async function POST() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const recipient = process.env.ORDER_NOTIFICATION_EMAIL;
    if (!recipient) {
      return NextResponse.json({ error: 'The preview recipient is not configured.' }, { status: 503 });
    }

    const rows = await sql`
      SELECT title, images, sizes
      FROM artworks
      WHERE COALESCE(is_hidden, FALSE) = FALSE
      ORDER BY featured DESC, created_at DESC
      LIMIT 1
    `;
    if (!rows.length) {
      return NextResponse.json({ error: 'No public artwork is available for the preview.' }, { status: 404 });
    }

    const artwork = rows[0] as ArtworkPreview;
    const size = artwork.sizes?.[0];
    if (!size) {
      return NextResponse.json({ error: 'The preview artwork has no purchasable size.' }, { status: 409 });
    }

    const date = new Date();
    const dateKey = date.toISOString().slice(0, 10);
    await sendOrderConfirmationEmail({
      orderId: `test-preview-${dateKey}`,
      orderNumber: `TEST-PREVIEW-${dateKey}`,
      customerName: 'Ryan',
      customerEmail: recipient,
      items: [{
        title: artwork.title,
        size: size.size,
        price: size.price,
        quantity: 1,
        imageUrl: getImageUrl(artwork.images),
        editionNumbers: [Math.min(size.editions_sold + 1, size.edition_limit)],
        editionLimit: size.edition_limit
      }],
      total: size.price,
      date: new Intl.DateTimeFormat('en-US', {
        month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles'
      }).format(date),
      requiresShipping: true,
      isTest: true
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error('Order confirmation preview failed:', error);
    return NextResponse.json({ error: 'The preview email could not be sent.' }, { status: 500 });
  }
}
