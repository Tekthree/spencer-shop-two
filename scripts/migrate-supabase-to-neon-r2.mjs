#!/usr/bin/env node
// Full data migration: Supabase → Neon (data) + R2 (images)
// Run from project root: node scripts/migrate-supabase-to-neon-r2.mjs

import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = neon(process.env.DATABASE_URL);

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET = process.env.R2_BUCKET_NAME;

// ── Helpers ──────────────────────────────────────────────────────────────────

function isSupabaseUrl(url) {
  return url && (url.includes('supabase') || url.includes('udanlcylpsvxqlihcppb'));
}

function extractSupabasePath(url) {
  // https://xxx.supabase.co/storage/v1/object/public/bucket/path/to/file
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
  if (match) return { bucket: match[1], path: match[2] };
  return null;
}

async function migrateImage(supabaseUrl, r2Prefix) {
  if (!supabaseUrl || !isSupabaseUrl(supabaseUrl)) return supabaseUrl;

  const parsed = extractSupabasePath(supabaseUrl);
  if (!parsed) {
    console.log('  Could not parse Supabase URL:', supabaseUrl);
    return supabaseUrl;
  }

  const { bucket, path } = parsed;
  const r2Key = `${r2Prefix}/${path}`;

  // Download from Supabase
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) {
    console.log(`  Download failed (${bucket}/${path}):`, error.message);
    return supabaseUrl;
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const contentType = data.type || 'image/jpeg';

  // Upload to R2
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    Body: buffer,
    ContentType: contentType,
  }));

  const newUrl = `${R2_PUBLIC_URL}/${r2Key}`;
  console.log(`  Migrated: ${path} → ${r2Key}`);
  return newUrl;
}

// ── Collections ───────────────────────────────────────────────────────────────

async function migrateCollections() {
  console.log('\n── Collections ─────────────────────────────────────────────');
  const { data, error } = await supabase.from('collections').select('*');
  if (error) { console.log('Error:', error.message); return {}; }
  console.log(`Found ${data.length} collections`);

  const idMap = {};
  for (const col of data) {
    let coverImage = col.cover_image;
    if (isSupabaseUrl(coverImage)) {
      coverImage = await migrateImage(coverImage, 'collections');
    }

    const existing = await sql`SELECT id FROM collections WHERE id = ${col.id}`;
    if (existing.length > 0) {
      console.log(`  Skipping (exists): ${col.name}`);
      idMap[col.id] = col.id;
      continue;
    }

    await sql`
      INSERT INTO collections (id, name, description, featured, cover_image, "order", created_at)
      VALUES (${col.id}, ${col.name}, ${col.description}, ${col.featured}, ${coverImage}, ${col.order}, ${col.created_at})
    `;
    idMap[col.id] = col.id;
    console.log(`  Inserted: ${col.name}`);
  }
  return idMap;
}

// ── Artworks ──────────────────────────────────────────────────────────────────

async function migrateArtworks() {
  console.log('\n── Artworks ─────────────────────────────────────────────────');
  const { data, error } = await supabase.from('artworks').select('*');
  if (error) { console.log('Error:', error.message); return; }
  console.log(`Found ${data.length} artworks`);

  for (const art of data) {
    const existing = await sql`SELECT id FROM artworks WHERE id = ${art.id}`;
    if (existing.length > 0) {
      console.log(`  Skipping (exists): ${art.title}`);
      continue;
    }

    // Migrate each image in the images array
    let images = art.images || [];
    if (Array.isArray(images)) {
      images = await Promise.all(images.map(async img => {
        if (!img || !img.url) return img;
        const newUrl = await migrateImage(img.url, 'artworks');
        return { ...img, url: newUrl };
      }));
    }

    // Generate slug if missing
    let slug = art.slug;
    if (!slug) {
      slug = art.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    await sql`
      INSERT INTO artworks (id, slug, title, description, year, medium, collection_id, featured, images, sizes, created_at)
      VALUES (
        ${art.id}, ${slug}, ${art.title}, ${art.description}, ${art.year}, ${art.medium},
        ${art.collection_id}, ${art.featured},
        ${JSON.stringify(images)}::jsonb,
        ${JSON.stringify(art.sizes || [])}::jsonb,
        ${art.created_at}
      )
    `;
    console.log(`  Inserted: ${art.title}`);
  }
}

// ── Page Content ──────────────────────────────────────────────────────────────

async function migratePageContent() {
  console.log('\n── Page Content ─────────────────────────────────────────────');
  const { data, error } = await supabase.from('page_content').select('*');
  if (error) { console.log('Error:', error.message); return; }
  console.log(`Found ${data.length} page_content rows`);

  for (const row of data) {
    const existing = await sql`SELECT id FROM page_content WHERE id = ${row.id}`;
    if (existing.length > 0) {
      console.log(`  Skipping (exists): ${row.id}`);
      continue;
    }

    let imageUrl = row.image_url;
    if (isSupabaseUrl(imageUrl)) {
      imageUrl = await migrateImage(imageUrl, 'about');
    }

    await sql`
      INSERT INTO page_content (id, page, title, content, image_url, "order", created_at, updated_at)
      VALUES (${row.id}, ${row.page}, ${row.title}, ${row.content}, ${imageUrl}, ${row.order}, ${row.created_at}, ${row.updated_at})
    `;
    console.log(`  Inserted: ${row.id}`);
  }
}

// ── Orders ────────────────────────────────────────────────────────────────────

async function migrateOrders() {
  console.log('\n── Orders ───────────────────────────────────────────────────');
  const { data, error } = await supabase.from('orders').select('*');
  if (error) { console.log('Error:', error.message); return; }
  console.log(`Found ${data.length} orders`);

  for (const order of data) {
    const existing = await sql`SELECT id FROM orders WHERE id = ${order.id}`;
    if (existing.length > 0) {
      console.log(`  Skipping (exists): ${order.id}`);
      continue;
    }

    await sql`
      INSERT INTO orders (id, customer_info, items, total, status, payment_intent, created_at)
      VALUES (
        ${order.id},
        ${JSON.stringify(order.customer_info)}::jsonb,
        ${JSON.stringify(order.items)}::jsonb,
        ${order.total},
        ${order.status},
        ${order.payment_intent},
        ${order.created_at}
      )
    `;
    console.log(`  Inserted order: ${order.id}`);
  }
}

// ── Blog Posts ────────────────────────────────────────────────────────────────

async function migrateBlogPosts() {
  console.log('\n── Blog Posts ───────────────────────────────────────────────');
  const { data, error } = await supabase.from('blog_posts').select('*');
  if (error) { console.log('Error:', error.message); return; }
  console.log(`Found ${data.length} blog posts`);

  for (const post of data) {
    let coverImage = post.cover_image;
    if (isSupabaseUrl(coverImage)) {
      coverImage = await migrateImage(coverImage, 'blog');
    }

    let content = post.content || [];
    if (Array.isArray(content)) {
      content = await Promise.all(content.map(async block => {
        if (block.type === 'image' && isSupabaseUrl(block.url)) {
          return { ...block, url: await migrateImage(block.url, 'blog') };
        }
        return block;
      }));
    }

    const existing = await sql`SELECT id FROM blog_posts WHERE id = ${post.id} OR slug = ${post.slug}`;
    if (existing.length > 0) {
      await sql`
        UPDATE blog_posts SET
          title = ${post.title}, excerpt = ${post.excerpt}, category = ${post.category},
          cover_image = ${coverImage}, cover_image_alt = ${post.cover_image_alt},
          author_name = ${post.author_name}, author_role = ${post.author_role},
          read_time_minutes = ${post.read_time_minutes}, status = ${post.status},
          published_at = ${post.published_at},
          content = ${JSON.stringify(content)}::jsonb,
          content_form = ${JSON.stringify(post.content_form || {})}::jsonb,
          updated_at = ${post.updated_at}
        WHERE slug = ${post.slug}
      `;
      console.log(`  Updated (slug conflict resolved): ${post.slug}`);
      continue;
    }

    await sql`
      INSERT INTO blog_posts (
        id, title, slug, excerpt, category, cover_image, cover_image_alt,
        author_name, author_role, read_time_minutes, status, published_at,
        content, content_form, created_at, updated_at
      ) VALUES (
        ${post.id}, ${post.title}, ${post.slug}, ${post.excerpt}, ${post.category},
        ${coverImage}, ${post.cover_image_alt}, ${post.author_name}, ${post.author_role},
        ${post.read_time_minutes}, ${post.status}, ${post.published_at},
        ${JSON.stringify(content)}::jsonb,
        ${JSON.stringify(post.content_form || {})}::jsonb,
        ${post.created_at}, ${post.updated_at}
      )
    `;
    console.log(`  Inserted: ${post.slug}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Starting Supabase → Neon + R2 migration');
  console.log('Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Neon:', process.env.DATABASE_URL?.substring(0, 40) + '...');
  console.log('R2 bucket:', BUCKET);
  console.log('R2 public URL:', R2_PUBLIC_URL);

  await migrateCollections();
  await migrateArtworks();
  await migratePageContent();
  await migrateOrders();
  await migrateBlogPosts();

  console.log('\n── Summary ──────────────────────────────────────────────────');
  const [collections, artworks, pageContent, orders, blogPosts] = await Promise.all([
    sql`SELECT COUNT(*) as n FROM collections`,
    sql`SELECT COUNT(*) as n FROM artworks`,
    sql`SELECT COUNT(*) as n FROM page_content`,
    sql`SELECT COUNT(*) as n FROM orders`,
    sql`SELECT COUNT(*) as n FROM blog_posts`,
  ]);
  console.log('collections:', collections[0].n);
  console.log('artworks:', artworks[0].n);
  console.log('page_content:', pageContent[0].n);
  console.log('orders:', orders[0].n);
  console.log('blog_posts:', blogPosts[0].n);
  console.log('\nMigration complete.');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
