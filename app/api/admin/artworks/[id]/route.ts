import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db/client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await sql`SELECT * FROM artworks WHERE id = ${id} LIMIT 1`;
    if (!rows.length) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return NextResponse.json({ error: 'Failed to fetch artwork' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { slug, title, description, year, medium, collection_id, featured, images, sizes } = body;

    await sql`
      UPDATE artworks SET
        slug = ${slug},
        title = ${title},
        description = ${description ?? null},
        year = ${year},
        medium = ${medium ?? null},
        collection_id = ${collection_id ?? null},
        featured = ${featured ?? false},
        images = ${JSON.stringify(images)}::jsonb,
        sizes = ${JSON.stringify(sizes)}::jsonb
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating artwork:', error);
    return NextResponse.json({ error: 'Failed to update artwork' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if this artwork is referenced in any orders
    const orderItems = await sql`SELECT id FROM order_items WHERE artwork_id = ${id} LIMIT 1`;
    if (orderItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete artwork that has been purchased. Consider marking it as sold out instead.' },
        { status: 400 }
      );
    }

    await sql`DELETE FROM artworks WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    return NextResponse.json({ error: 'Failed to delete artwork' }, { status: 500 });
  }
}
