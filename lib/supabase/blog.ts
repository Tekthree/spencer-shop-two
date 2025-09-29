import { supabase } from './client';
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
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to parse blog post content JSON:', error);
      return [];
    }
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
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', PUBLISHED_STATUS)
    .lte('published_at', nowIso)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching published blog posts:', error);
    return [];
  }

  const rows = (data ?? []) as BlogRow[];
  return rows.map(mapBlogPost);
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', PUBLISHED_STATUS)
    .lte('published_at', nowIso)
    .maybeSingle();

  if (error) {
    console.error('Error fetching blog post by slug:', error);
    return null;
  }

  return data ? mapBlogPost(data as BlogRow) : null;
}
