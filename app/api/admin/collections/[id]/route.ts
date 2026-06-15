import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db/client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await sql`
      SELECT c.*, COUNT(a.id)::int AS artwork_count
      FROM collections c
      LEFT JOIN artworks a ON a.collection_id = c.id
      WHERE c.id = ${id}
      GROUP BY c.id
      LIMIT 1
    `;
    if (!rows.length) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, order, featured, cover_image } = body;

    await sql`
      UPDATE collections SET
        name = ${name},
        description = ${description ?? null},
        "order" = ${order ?? null},
        featured = ${featured ?? false},
        cover_image = ${cover_image ?? null}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Prevent deletion if collection has artworks
    const artworkRows = await sql`SELECT COUNT(*)::int AS count FROM artworks WHERE collection_id = ${id}`;
    const count = (artworkRows[0] as { count: number }).count;
    if (count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete collection with artworks. Remove artworks first.' },
        { status: 400 }
      );
    }

    await sql`DELETE FROM collections WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
