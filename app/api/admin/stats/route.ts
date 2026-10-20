import { NextResponse } from 'next/server';
import sql from '@/lib/db/client';
import { requireAdminApi } from '@/lib/auth/admin-api';

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  try {
    const [artworksResult, collectionsResult, ordersResult, operationsResult] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM artworks`,
      sql`SELECT COUNT(*)::int AS count FROM collections`,
      sql`SELECT COUNT(*)::int AS count FROM orders`,
      sql`
        SELECT id, severity, source, message, created_at
        FROM operational_events
        WHERE resolved_at IS NULL AND created_at >= now() - INTERVAL '30 days'
        ORDER BY created_at DESC
        LIMIT 10
      `,
    ]);

    return NextResponse.json({
      artworks: (artworksResult[0] as { count: number }).count,
      collections: (collectionsResult[0] as { count: number }).count,
      orders: (ordersResult[0] as { count: number }).count,
      operationalEvents: operationsResult,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ artworks: 0, collections: 0, orders: 0 }, { status: 500 });
  }
}
