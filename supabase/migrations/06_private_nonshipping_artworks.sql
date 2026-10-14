-- Support private, direct-link-only products and products that do not ship.
-- Existing artwork behavior remains unchanged through conservative defaults.
ALTER TABLE public.artworks
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.artworks
  ADD COLUMN IF NOT EXISTS requires_shipping BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_artworks_public_visibility
  ON public.artworks (created_at DESC)
  WHERE is_hidden = FALSE;
