#!/usr/bin/env node
// Runs the Spencer Grey schema migrations against Neon (no Supabase RLS or storage)

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const dotenv = require('dotenv');
dotenv.config({ path: resolve(__dirname, '../.env.local') });

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log('Running migrations against Neon...\n');

  // ── Migration 01: Initial schema ────────────────────────────────────────────
  console.log('01_initial_schema...');
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS collections (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      featured BOOLEAN DEFAULT false,
      cover_image TEXT,
      "order" INT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS artworks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT,
      year INT,
      medium TEXT,
      collection_id UUID REFERENCES collections(id),
      featured BOOLEAN DEFAULT false,
      images JSONB,
      sizes JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      customer_info JSONB NOT NULL,
      items JSONB NOT NULL,
      total INT NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_intent TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS page_content (
      id TEXT PRIMARY KEY,
      page TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      image_url TEXT,
      "order" INT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_artworks_collection ON artworks(collection_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_artworks_featured ON artworks(featured)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_collections_featured ON collections(featured)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_page_content_page ON page_content(page)`;

  console.log('  done.');

  // ── Migration 02: Hover images (comment only, no schema change) ──────────────
  console.log('02_add_hover_images...');
  await sql`
    COMMENT ON COLUMN artworks.images IS 'Array of image objects: [{url: string, alt: string, type: string ("main" | "hover" | null)}]'
  `;
  console.log('  done.');

  // ── Migration 03: Blog posts ─────────────────────────────────────────────────
  console.log('03_create_blog_posts...');

  await sql`
    CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS public.blog_posts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      category TEXT,
      cover_image TEXT,
      cover_image_alt TEXT,
      author_name TEXT NOT NULL DEFAULT 'Spencer Grey',
      author_role TEXT,
      read_time_minutes INTEGER,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
      published_at TIMESTAMPTZ,
      content JSONB NOT NULL DEFAULT '[]'::jsonb,
      content_form JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts (slug)`;
  await sql`CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON public.blog_posts (status)`;
  await sql`CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON public.blog_posts (published_at)`;

  // Drop and recreate trigger
  await sql`DROP TRIGGER IF EXISTS blog_posts_set_updated_at ON public.blog_posts`;
  await sql`
    CREATE TRIGGER blog_posts_set_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at()
  `;

  // Seed announcement post
  await sql`
    INSERT INTO public.blog_posts (
      title, slug, excerpt, category, cover_image, cover_image_alt,
      author_name, author_role, read_time_minutes, status, published_at,
      content, content_form
    )
    SELECT
      'Introducing the Spencer Grey Art Store',
      'announcing-the-spencer-grey-art-store',
      'Our new online home for limited edition prints is live. Explore the launch collection, learn about the production process, and join the collector community.',
      'Announcements',
      '/hero-spencer.jpg',
      'Spencer Grey in the studio with newly framed prints',
      'Spencer Grey',
      'Artist & Founder',
      4,
      'published',
      now(),
      '[
        {"type":"heading","level":2,"text":"Introduction"},
        {"type":"paragraph","text":"After months of refining prints, photographing every edition, and designing the experience, the Spencer Grey art store is officially open. This space was created to give collectors a calm, intentional way to explore new work."},
        {"type":"image","url":"/hero-spencer.jpg","alt":"Spencer Grey stands in the studio next to newly framed prints.","caption":"The studio ready for opening week."},
        {"type":"paragraph","text":"Each limited edition print is produced with museum-grade materials and a focus on sustainability. Every order is printed to demand, numbered by hand, and accompanied by a signed certificate of authenticity."},
        {"type":"quote","text":"This launch is an invitation to slow down, collect deliberately, and live with artwork that carries a story.","attribution":"Spencer Grey"},
        {"type":"paragraph","text":"Over the coming weeks I will share behind-the-scenes looks at the studio, stories from recent travels, and previews of new series before they release."},
        {"type":"heading","level":2,"text":"Conclusion"},
        {"type":"paragraph","text":"Thank you for being here at the beginning. Subscribe to studio updates to hear about upcoming drops, exhibition announcements, and collector-only releases."}
      ]'::jsonb,
      '{}'::jsonb
    WHERE NOT EXISTS (
      SELECT 1 FROM public.blog_posts WHERE slug = 'announcing-the-spencer-grey-art-store'
    )
  `;

  console.log('  done.');

  // ── Migration 04: Add slug to artworks ───────────────────────────────────────
  console.log('04_add_artwork_slug...');

  await sql`ALTER TABLE artworks ADD COLUMN IF NOT EXISTS slug TEXT`;

  // Only run slug population if any artworks have null slug
  const nullSlugs = await sql`SELECT COUNT(*) as n FROM artworks WHERE slug IS NULL`;
  if (parseInt(nullSlugs[0].n) > 0) {
    await sql`
      WITH slugged AS (
        SELECT id, regexp_replace(lower(trim(title)), '[^a-z0-9]+', '-', 'g') AS raw_slug
        FROM artworks WHERE slug IS NULL
      ), normalized AS (
        SELECT id,
          NULLIF(regexp_replace(regexp_replace(raw_slug, '^-+', ''), '-+$', ''), '') AS base_slug,
          row_number() OVER (PARTITION BY NULLIF(regexp_replace(regexp_replace(raw_slug, '^-+', ''), '-+$', ''), '') ORDER BY id) AS rn
        FROM slugged
      )
      UPDATE artworks a
      SET slug = CASE
        WHEN normalized.base_slug IS NULL THEN 'artwork-' || left(a.id::text, 8)
        WHEN normalized.rn = 1 THEN normalized.base_slug
        ELSE normalized.base_slug || '-' || normalized.rn
      END
      FROM normalized
      WHERE a.id = normalized.id
    `;
  }

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_artworks_slug ON artworks(slug)`;
  console.log('  done.');

  // ── Verify ───────────────────────────────────────────────────────────────────
  const tables = await sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  console.log('\nTables in public schema:');
  tables.forEach(t => console.log(' ', t.tablename));

  console.log('\nAll migrations complete.');
}

run().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
