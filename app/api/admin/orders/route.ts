import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let orders;
    if (status && status !== 'all') {
      orders = await sql`
        SELECT * FROM orders
        WHERE status = ${status}
        ORDER BY created_at DESC
      `;
    } else {
      orders = await sql`
        SELECT * FROM orders
        ORDER BY created_at DESC
      `;
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_info, items, total, status, payment_intent } = body;

    const rows = await sql`
      INSERT INTO orders (customer_info, items, total, status, payment_intent)
      VALUES (
        ${JSON.stringify(customer_info)}::jsonb,
        ${JSON.stringify(items)}::jsonb,
        ${total},
        ${status ?? 'paid'},
        ${payment_intent ?? null}
      )
      RETURNING *
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
