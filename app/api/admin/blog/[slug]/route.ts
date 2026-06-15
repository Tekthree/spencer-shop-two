import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db/client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1`;
    if (!rows.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const {
      title,
      slug: newSlug,
      excerpt,
      category,
      cover_image,
      cover_image_alt,
      author_name,
      author_role,
      read_time_minutes,
      status,
      published_at,
      content,
      content_form,
    } = body;

    await sql`
      UPDATE blog_posts SET
        title = ${title},
        slug = ${newSlug},
        excerpt = ${excerpt ?? null},
        category = ${category ?? null},
        cover_image = ${cover_image ?? null},
        cover_image_alt = ${cover_image_alt ?? null},
        author_name = ${author_name ?? null},
        author_role = ${author_role ?? null},
        read_time_minutes = ${read_time_minutes ?? null},
        status = ${status ?? 'draft'},
        published_at = ${published_at ?? null},
        content = ${JSON.stringify(content)}::jsonb,
        content_form = ${JSON.stringify(content_form ?? {})}::jsonb
      WHERE slug = ${slug}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}
