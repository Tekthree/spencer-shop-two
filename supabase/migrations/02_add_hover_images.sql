-- Spencer Grey Artist Website: Add Hover Images Feature
-- This migration documents the updated structure for the images JSONB field in artworks table

/*
The existing images JSONB field in the artworks table will now support the following structure:
[
  {
    url: string,
    alt: string,
    type: string ("main" | "hover" | null) - main is the primary image, hover is shown on mouseover
  }
]

No schema changes are required as we're using the existing JSONB field with an enhanced structure.
This migration serves as documentation for the change in data format.
*/

-- Add a comment to the table to document the updated structure
COMMENT ON COLUMN artworks.images IS 'Array of image objects: [{url: string, alt: string, type: string ("main" | "hover" | null)}]';