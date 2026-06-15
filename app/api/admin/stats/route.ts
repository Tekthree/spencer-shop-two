import { NextResponse } from 'next/server';
import sql from '@/lib/db/client';

export async function GET() {
  try {
    const [artworksResult, collectionsResult, ordersResult] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM artworks`,
      sql`SELECT COUNT(*)::int AS count FROM collections`,
      sql`SELECT COUNT(*)::int AS count FROM orders`,
    ]);

    return NextResponse.json({
      artworks: (artworksResult[0] as { count: number }).count,
      collections: (collectionsResult[0] as { count: number }).count,
      orders: (ordersResult[0] as { count: number }).count,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ artworks: 0, collections: 0, orders: 0 }, { status: 500 });
  }
}
