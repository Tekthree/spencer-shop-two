-- Blog posts schema for Spencer Grey Art
-- Adds table, policies, storage bucket, and seed announcement entry

-- Helper function to keep updated_at in sync
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Blog posts table
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON public.blog_posts (status);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON public.blog_posts (published_at);

-- Ensure trigger is recreated with latest definition
DO $$
BEGIN
  IF to_regclass('public.blog_posts') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS blog_posts_set_updated_at ON public.blog_posts;
  END IF;
END
$$;

CREATE TRIGGER blog_posts_set_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Row level security policies
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to published blog posts"
  ON public.blog_posts FOR SELECT
  USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));

CREATE POLICY "Allow authenticated users full access to blog posts"
  ON public.blog_posts FOR ALL
  USING (auth.role() = 'authenticated');

-- Storage bucket for blog imagery
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog', 'blog', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access to blog assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog');

CREATE POLICY "Allow authenticated uploads to blog assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog' AND auth.role() = 'authenticated');

-- Seed announcement post if it does not already exist
INSERT INTO public.blog_posts (
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
  content
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
  ]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.blog_posts WHERE slug = 'announcing-the-spencer-grey-art-store'
);
