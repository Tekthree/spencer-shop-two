import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db/client';

export async function GET() {
  try {
    const artworks = await sql`
      SELECT * FROM artworks
      ORDER BY created_at DESC
    `;
    return NextResponse.json(artworks);
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, title, description, year, medium, collection_id, featured, images, sizes } = body;

    const rows = await sql`
      INSERT INTO artworks (slug, title, description, year, medium, collection_id, featured, images, sizes)
      VALUES (
        ${slug},
        ${title},
        ${description ?? null},
        ${year},
        ${medium ?? null},
        ${collection_id ?? null},
        ${featured ?? false},
        ${JSON.stringify(images)}::jsonb,
        ${JSON.stringify(sizes)}::jsonb
      )
      RETURNING *
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error creating artwork:', error);
    return NextResponse.json({ error: 'Failed to create artwork' }, { status: 500 });
  }
}
