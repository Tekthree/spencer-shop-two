import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db/client';

export async function GET() {
  try {
    const posts = await sql`
      SELECT id, title, slug, status, published_at, created_at, category, cover_image
      FROM blog_posts
      ORDER BY
        published_at DESC NULLS LAST,
        created_at DESC
    `;
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
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

    const rows = await sql`
      INSERT INTO blog_posts (
        title, slug, excerpt, category, cover_image, cover_image_alt,
        author_name, author_role, read_time_minutes, status, published_at,
        content, content_form
      )
      VALUES (
        ${title},
        ${slug},
        ${excerpt ?? null},
        ${category ?? null},
        ${cover_image ?? null},
        ${cover_image_alt ?? null},
        ${author_name ?? null},
        ${author_role ?? null},
        ${read_time_minutes ?? null},
        ${status ?? 'draft'},
        ${published_at ?? null},
        ${JSON.stringify(content)}::jsonb,
        ${JSON.stringify(content_form ?? {})}::jsonb
      )
      RETURNING id, title, slug, status
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
