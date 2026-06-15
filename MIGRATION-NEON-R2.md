# Migration Plan: Supabase → Neon + Cloudflare R2

**Goal:** Replace Supabase (database + auth + storage) with Neon (Postgres), simple cookie auth, and Cloudflare R2 (images).  
**Hosting stays on Vercel. No app architecture changes.**

---

## New Stack

| Service | Old | New |
|---|---|---|
| Database | Supabase Postgres | Neon (Vercel Postgres) |
| Auth | Supabase Auth | iron-session (cookie, env-var credentials) |
| Storage | Supabase Buckets | Cloudflare R2 |
| Hosting | Vercel | Vercel (no change) |

---

## Phase 1: Database → Neon

### Setup
1. Create Neon project at neon.tech, copy `DATABASE_URL`
2. Run all 4 migrations against Neon:
   - `supabase/migrations/01_initial_schema.sql` (skip the `storage.buckets` INSERT blocks and RLS policies — those are Supabase-specific)
   - `supabase/migrations/02_add_hover_images.sql`
   - `supabase/migrations/03_create_blog_posts.sql` (skip the storage bucket section)
   - `supabase/migrations/04_add_artwork_slug.sql`
3. Install driver: `npm install @neondatabase/serverless`

### New DB client
Replace `lib/supabase/client.ts` and `lib/supabase/server.ts` with a single `lib/db/client.ts`:

```ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export default sql;
```

### Query rewrites (~30 files)
Every `supabase.from('table').select/insert/update/delete` becomes a tagged SQL query. Examples:

```ts
// Before
const { data } = await supabase.from('artworks').select('*').eq('featured', true)

// After
const artworks = await sql`SELECT * FROM artworks WHERE featured = true`
```

**App files (30 total):**
`app/page.tsx`, `app/shop/page.tsx`, `app/sitemap.ts`,
`app/artwork/[slug]/page.tsx`, `app/artwork/[slug]/metadata.ts`, `app/artwork/[slug]/artwork-detail-client.tsx`,
`app/about/page.tsx`, `app/about/metadata.ts`,
`app/blog/page.tsx`, `app/blog/[slug]/page.tsx`,
`app/collections/[id]/metadata.ts`,
`app/admin/page.tsx`, `app/admin/artworks/page.tsx`, `app/admin/artworks/new/page.tsx`, `app/admin/artworks/[id]/edit-artwork-client.tsx`,
`app/admin/collections/page.tsx`, `app/admin/collections/new/page.tsx`, `app/admin/collections/[id]/edit-collection-client.tsx`,
`app/admin/orders/page.tsx`, `app/admin/orders/[id]/order-detail-client.tsx`,
`app/admin/about/page.tsx`, `app/admin/images/page.tsx`,
`app/admin/blog/page.tsx`, `app/admin/blog/[slug]/edit/page.tsx`,
`app/api/checkout/route.ts`, `app/api/checkout/session/route.ts`, `app/api/webhooks/stripe/route.ts`,
`app/home-page-client.tsx`

**Lib modules to replace:**
`lib/supabase/blog.ts` → `lib/db/blog.ts`
`lib/supabase/storage.ts` → `lib/storage/r2.ts`
`lib/supabase/client.ts` → `lib/db/client.ts`
`lib/supabase/server.ts` → (merged into `lib/db/client.ts`)
`lib/supabase/auth.ts` → `lib/auth/session.ts`

**Components:**
`components/artwork/related-artworks.tsx`, `components/blog/blog-post-card.tsx`

### Remove RLS
Skip RLS policy blocks from migrations. Access control moves to Next.js middleware (Phase 2).

---

## Phase 2: Auth → iron-session

### Setup
1. Install: `npm install iron-session`
2. Add env vars:
   - `SESSION_SECRET` (32+ char random string)
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH` (bcrypt hash)

### New auth module
Replace `lib/supabase/auth.ts` with `lib/auth/session.ts`:

```ts
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'sg-admin-session',
  cookieOptions: { secure: process.env.NODE_ENV === 'production' },
};

export async function signIn(email: string, password: string) {
  const validEmail = email === process.env.ADMIN_EMAIL;
  const validPass = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!);
  if (!validEmail || !validPass) throw new Error('Invalid credentials');
  const session = await getIronSession(await cookies(), sessionOptions);
  (session as any).isAdmin = true;
  await session.save();
}

export async function getSession() {
  const session = await getIronSession(await cookies(), sessionOptions);
  return (session as any).isAdmin ? session : null;
}

export async function signOut() {
  const session = await getIronSession(await cookies(), sessionOptions);
  session.destroy();
}
```

### Middleware
Add `middleware.ts` at project root to protect `/admin` routes:

```ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const session = req.cookies.get('sg-admin-session');
  if (!session && !req.nextUrl.pathname.startsWith('/admin/login')) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
```

### Files to update
- `app/admin/login/page.tsx` — swap `signIn` import
- `app/admin/layout.tsx` — swap `getSession` import
- `lib/hooks/useSupabaseClient.ts` — delete or repurpose

---

## Phase 3: Storage → Cloudflare R2

### Setup
1. Create R2 bucket `sg-artworks` in Cloudflare dashboard
2. Enable public access on the bucket (or set up a custom domain)
3. Create R2 API token with Object Read/Write permissions
4. Install: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
   (R2 is S3-compatible, use the AWS SDK)
5. Add env vars:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME` = `sg-artworks`
   - `R2_PUBLIC_URL` = `https://your-bucket.r2.dev` (or custom domain)

### New storage module
Replace `lib/supabase/storage.ts` with `lib/storage/r2.ts`:

```ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadImage(key: string, buffer: Buffer, contentType: string) {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function deleteImage(key: string) {
  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  }));
}
```

### Files to update
- `app/admin/artworks/new/page.tsx`
- `app/admin/artworks/[id]/edit-artwork-client.tsx`
- `app/admin/collections/new/page.tsx`
- `app/admin/collections/[id]/edit-collection-client.tsx`
- `app/admin/about/page.tsx`
- `app/admin/blog/[slug]/edit/page.tsx`
- `components/admin/image-library-picker-modal.tsx` — currently uses recursive Supabase bucket listing; replace with `ListObjectsV2Command`
- `components/admin/image-uploader.tsx` — direct upload component, swap to R2 put()

Image URLs stored in DB become R2 public URLs. No format changes needed on the frontend.

---

## Environment Variables

### Remove
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### Add
```
DATABASE_URL=              # Neon connection string
SESSION_SECRET=            # 32+ char random string
ADMIN_EMAIL=               # admin login email
ADMIN_PASSWORD_HASH=       # bcrypt hash of admin password
R2_ACCOUNT_ID=             # Cloudflare account ID
R2_ACCESS_KEY_ID=          # R2 API token key ID
R2_SECRET_ACCESS_KEY=      # R2 API token secret
R2_BUCKET_NAME=sg-artworks
R2_PUBLIC_URL=             # public bucket URL (server-side)
NEXT_PUBLIC_R2_PUBLIC_URL= # same value — needed by client components (blog card, blog editor)
```

---

## Scripts to Rewrite

All scripts under `scripts/` use the Supabase client and need updating:

| Script | Action |
|---|---|
| `setup-supabase.js` | Rename to `setup-admin.js`, rewrite with Neon client. Seeds about page content, creates admin creds via env vars. |
| `setup-supabase.sh` | Delete |
| `apply-migrations.js` | Replace with: `psql $DATABASE_URL < supabase/migrations/*.sql` |
| `check-tables.js` | Rewrite with Neon client |
| `check-orders.js` | Rewrite with Neon client |
| `direct-content-setup.js` | Rewrite with Neon client |
| `fix-page-content.js` | Rewrite with Neon client |
| `init-about-page.js` | Rewrite with Neon client |
| `insert-test-order.js` | Rewrite with Neon client |
| `check-env.ts` | Update env var list (remove SUPABASE_*, add DATABASE_URL, R2_*, SESSION_*) |
| `deploy.js` | Remove Supabase pre-flight checks |

---

## Docs to Update

- `DEPLOYMENT.md` — env vars section
- `DEPLOYMENT-CHECKLIST.md` — env vars section
- `README.md` — stack description + env vars

---

## Execution Order

1. Set up Neon, run migrations, verify schema
2. Build `lib/db/client.ts`, rewrite queries (start with read-only pages, test, then admin)
3. Set up R2 bucket, build `lib/storage/r2.ts`, update admin upload pages
4. Set up iron-session, update auth + middleware
5. Remove `@supabase/supabase-js` from package.json
6. Test full flow: public pages → admin login → create artwork with image → checkout
7. Deploy to Vercel, add env vars, verify prod

---

## Data Migration

Before switching over:
- Export all data from Supabase (Dashboard → Table Editor → CSV export per table)
- Download all images from Supabase storage buckets
- Re-upload images to R2, update image URLs in DB export
- Import CSVs into Neon via `psql` or Neon console
