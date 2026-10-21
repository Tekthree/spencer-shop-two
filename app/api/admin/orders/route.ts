import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db/client';
import { requireAdminApi } from '@/lib/auth/admin-api';

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
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
