-- Add slug column to artworks and populate from title
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS slug TEXT;

WITH slugged AS (
  SELECT
    id,
    regexp_replace(lower(trim(title)), '[^a-z0-9]+', '-', 'g') AS raw_slug
  FROM artworks
), normalized AS (
  SELECT
    id,
    NULLIF(regexp_replace(regexp_replace(raw_slug, '^-+', ''), '-+$', ''), '') AS base_slug,
    row_number() OVER (PARTITION BY NULLIF(regexp_replace(regexp_replace(raw_slug, '^-+', ''), '-+$', ''), '') ORDER BY id) AS rn
  FROM slugged
), updated AS (
  UPDATE artworks a
  SET slug = CASE
    WHEN normalized.base_slug IS NULL THEN 'artwork-' || left(a.id::text, 8)
    WHEN normalized.rn = 1 THEN normalized.base_slug
    ELSE normalized.base_slug || '-' || normalized.rn
  END
  FROM normalized
  WHERE a.id = normalized.id
)
SELECT 1;

ALTER TABLE artworks ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_artworks_slug ON artworks(slug);
