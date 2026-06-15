import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db/client';

export async function GET() {
  try {
    const collections = await sql`
      SELECT
        c.*,
        COUNT(a.id)::int AS artwork_count
      FROM collections c
      LEFT JOIN artworks a ON a.collection_id = c.id
      GROUP BY c.id
      ORDER BY c."order" ASC NULLS LAST, c.name ASC
    `;
    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, order, featured, cover_image } = body;

    const rows = await sql`
      INSERT INTO collections (name, description, "order", featured, cover_image)
      VALUES (
        ${name},
        ${description ?? null},
        ${order ?? null},
        ${featured ?? false},
        ${cover_image ?? null}
      )
      RETURNING *
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}
