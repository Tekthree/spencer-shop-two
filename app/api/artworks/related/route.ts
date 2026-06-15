import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db/client';

/**
 * GET /api/artworks/related?currentId=X&collectionId=Y&limit=4
 * Returns related artworks, preferring artworks in the same collection.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentId = searchParams.get('currentId');
    const collectionId = searchParams.get('collectionId') || null;
    const limit = parseInt(searchParams.get('limit') || '4', 10);

    if (!currentId) {
      return NextResponse.json({ error: 'currentId is required' }, { status: 400 });
    }

    let artworks;

    if (collectionId) {
      // First fetch from the same collection
      const sameCollection = await sql`
        SELECT id, slug, title, year, medium, images, collection_id, sizes
        FROM artworks
        WHERE id != ${currentId} AND collection_id = ${collectionId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      if (sameCollection.length >= limit) {
        artworks = sameCollection;
      } else {
        // Top up with artworks from other collections
        const needed = limit - sameCollection.length;
        const others = await sql`
          SELECT id, slug, title, year, medium, images, collection_id, sizes
          FROM artworks
          WHERE id != ${currentId} AND (collection_id != ${collectionId} OR collection_id IS NULL)
          ORDER BY created_at DESC
          LIMIT ${needed}
        `;
        artworks = [...sameCollection, ...others];
      }
    } else {
      artworks = await sql`
        SELECT id, slug, title, year, medium, images, collection_id, sizes
        FROM artworks
        WHERE id != ${currentId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json(artworks);
  } catch (error) {
    console.error('Error fetching related artworks:', error);
    return NextResponse.json({ error: 'Failed to fetch related artworks' }, { status: 500 });
  }
}
