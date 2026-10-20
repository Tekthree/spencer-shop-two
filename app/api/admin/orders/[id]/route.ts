import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import sql from '@/lib/db/client';
import stripe from '@/lib/stripe/stripe-server';
import { requireAdminApi } from '@/lib/auth/admin-api';
import { formatOrderNumber } from '@/lib/orders/order-number';
import { sendShippingConfirmationEmail } from '@/lib/email/email-service';

const updateSchema = z.object({
  status: z.enum(['paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled']),
  trackingNumber: z.string().trim().max(120).optional(),
  carrier: z.string().trim().max(80).optional()
});

type OrderRow = {
  id: string;
  order_number: number;
  customer_info: { name?: string; email?: string };
  status: string;
  payment_intent: string | null;
  requires_shipping: boolean;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const rows = await sql`
      SELECT o.*, COALESCE((
        SELECT jsonb_object_agg(a.id::text, to_jsonb(a))
        FROM artworks a
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(o.items) item
          WHERE item->>'artwork_id' = a.id::text
        )
      ), '{}'::jsonb) AS artworks
      FROM orders o WHERE o.id = ${id} LIMIT 1
    `;
    if (!rows.length) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const update = updateSchema.parse(await request.json());
    const rows = await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    const order = rows[0] as OrderRow;

    if (update.status === 'cancelled') {
      if (!['paid', 'processing', 'cancelled'].includes(order.status)) {
        return NextResponse.json({ error: 'Only paid or processing orders can be cancelled.' }, { status: 409 });
      }
      if (!order.payment_intent) {
        return NextResponse.json({ error: 'This order has no payment to refund.' }, { status: 409 });
      }
      const refund = await stripe.refunds.create(
        { payment_intent: order.payment_intent, reason: 'requested_by_customer' },
        { idempotencyKey: `cancel-order-${order.id}` }
      );
      const cancelled = await sql`SELECT cancel_order_and_restock(${order.id}::uuid, ${refund.id}) AS order`;
      return NextResponse.json(cancelled[0].order);
    }

    const allowedNext: Record<string, string[]> = {
      paid: ['processing'],
      processing: order.requires_shipping ? ['shipped'] : ['completed'],
      shipped: ['delivered'],
      delivered: [],
      completed: []
    };
    const sameShippedUpdate = order.status === 'shipped' && update.status === 'shipped';
    if (!sameShippedUpdate && !allowedNext[order.status]?.includes(update.status)) {
      return NextResponse.json({ error: `Order cannot move from ${order.status} to ${update.status}.` }, { status: 409 });
    }

    if (update.status === 'shipped' && (!update.trackingNumber || !update.carrier)) {
      return NextResponse.json({ error: 'Carrier and tracking number are required before marking an order shipped.' }, { status: 400 });
    }

    const updatedRows = await sql`
      UPDATE orders SET
        status = ${update.status},
        tracking_number = CASE WHEN ${update.status} = 'shipped' THEN ${update.trackingNumber ?? null} ELSE tracking_number END,
        carrier = CASE WHEN ${update.status} = 'shipped' THEN ${update.carrier ?? null} ELSE carrier END,
        shipped_at = CASE WHEN ${update.status} = 'shipped' THEN COALESCE(shipped_at, now()) ELSE shipped_at END,
        delivered_at = CASE WHEN ${update.status} = 'delivered' THEN COALESCE(delivered_at, now()) ELSE delivered_at END,
        status_history = status_history || jsonb_build_array(jsonb_build_object(
          'status', ${update.status}, 'at', now(), 'source', 'admin'
        )),
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    const updated = updatedRows[0] as OrderRow;

    if (update.status === 'shipped' && updated.customer_info.email) {
      try {
        await sendShippingConfirmationEmail({
          orderId: updated.id,
          orderNumber: formatOrderNumber(updated.order_number, updated.created_at)!,
          customerName: updated.customer_info.name || 'Collector',
          customerEmail: updated.customer_info.email,
          carrier: updated.carrier || update.carrier!,
          trackingNumber: updated.tracking_number || update.trackingNumber!
        });
      } catch (emailError) {
        console.error('Order was marked shipped but its email failed:', emailError);
        return NextResponse.json({
          ...updated,
          notificationWarning: 'The status was saved, but the shipping email was not sent. Submit the shipped update again to retry it.'
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid order update.' }, { status: 400 });
    }
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'The order update could not be finished. It is safe to retry.' }, { status: 500 });
  }
}
