import sql from '@/lib/db/client';
import { createRichTextHtml } from '@/lib/blog/rich-text';
import type { BlogPost } from '@/types/blog';

const PUBLISHED_STATUS = 'published';

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  cover_image?: string | null;
  cover_image_alt?: string | null;
  author_name?: string | null;
  author_role?: string | null;
  read_time_minutes?: number | null;
  status?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  content?: unknown;
  content_form?: unknown;
}

function normalizeContent(rawContent: unknown) {
  if (!rawContent) {
    return [];
  }

  if (Array.isArray(rawContent)) {
    return rawContent;
  }

  if (typeof rawContent === 'string') {
    try {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (parsed && typeof parsed === 'object') {
        return [parsed];
      }
    } catch {
      const { html, raw } = createRichTextHtml(rawContent);
      if (html) {
        return [
          {
            type: 'rich_text',
            html,
            raw,
          },
        ];
      }
    }
    return [];
  }

  if (typeof rawContent === 'object') {
    return [rawContent];
  }

  return [];
}

function mapBlogPost(row: BlogRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? undefined,
    category: row.category ?? undefined,
    cover_image: row.cover_image ?? undefined,
    cover_image_alt: row.cover_image_alt ?? undefined,
    author_name: row.author_name ?? 'Spencer Grey',
    author_role: row.author_role ?? undefined,
    read_time_minutes: row.read_time_minutes ?? undefined,
    status: (row.status as BlogPost['status']) ?? PUBLISHED_STATUS,
    published_at: row.published_at ?? undefined,
    created_at: row.created_at ?? undefined,
    updated_at: row.updated_at ?? undefined,
    content: normalizeContent(row.content),
  };
}

export async function fetchPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const rows = await sql`
      SELECT * FROM blog_posts
      WHERE status = ${PUBLISHED_STATUS}
        AND published_at <= now()
      ORDER BY published_at DESC
    `;
    return (rows as BlogRow[]).map(mapBlogPost);
  } catch (error) {
    console.error('Error fetching published blog posts:', error);
    return [];
  }
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const rows = await sql`
      SELECT * FROM blog_posts
      WHERE slug = ${slug}
        AND status = ${PUBLISHED_STATUS}
        AND published_at <= now()
      LIMIT 1
    `;
    return rows.length > 0 ? mapBlogPost(rows[0] as BlogRow) : null;
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    return null;
  }
}
