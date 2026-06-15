import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db/client';

export async function GET() {
  try {
    const sections = await sql`
      SELECT * FROM page_content
      WHERE page = 'about'
      ORDER BY "order" ASC
    `;
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching about content:', error);
    return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sections } = body as {
      sections: Array<{
        id: string;
        title: string;
        content: string;
        image_url?: string;
        order: number;
      }>;
    };

    // Delete all existing about page content then re-insert
    await sql`DELETE FROM page_content WHERE page = 'about'`;

    for (const section of sections) {
      await sql`
        INSERT INTO page_content (id, title, content, image_url, "order", page)
        VALUES (
          ${section.id},
          ${section.title},
          ${section.content},
          ${section.image_url ?? null},
          ${section.order},
          'about'
        )
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving about content:', error);
    return NextResponse.json({ error: 'Failed to save about content' }, { status: 500 });
  }
}
