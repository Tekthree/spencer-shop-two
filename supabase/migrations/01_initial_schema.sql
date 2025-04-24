-- Spencer Grey Artist Website: Initial Database Schema
-- This migration creates the core tables for artwork, collections, and orders

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Collections table (must be created first due to foreign key relationships)
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  featured BOOLEAN DEFAULT false,
  cover_image TEXT,
  "order" INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Artworks table with edition tracking
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  year INT,
  medium TEXT,
  collection_id UUID REFERENCES collections(id),
  featured BOOLEAN DEFAULT false,
  images JSONB, -- Array of image URLs [{url: string, alt: string}]
  sizes JSONB NOT NULL, -- [{size: string, price: number, edition_limit: number, editions_sold: number}]
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table with edition numbers
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_info JSONB NOT NULL, -- {name, email, address, etc.}
  items JSONB NOT NULL, -- [{artwork_id, size, price, edition_number}]
  total INT NOT NULL, -- Amount in cents
  status TEXT DEFAULT 'pending',
  payment_intent TEXT, -- Stripe payment intent ID
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Page content table for about page and other content sections
CREATE TABLE page_content (
  id TEXT PRIMARY KEY,
  page TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  "order" INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_artworks_collection ON artworks(collection_id);
CREATE INDEX idx_artworks_featured ON artworks(featured);
CREATE INDEX idx_collections_featured ON collections(featured);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_page_content_page ON page_content(page);

-- Row Level Security (RLS) policies
-- Enable RLS on tables
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Public read access for artworks and collections
CREATE POLICY "Allow public read access to artworks" 
  ON artworks FOR SELECT USING (true);

CREATE POLICY "Allow public read access to collections" 
  ON collections FOR SELECT USING (true);

-- Admin access for all operations (will be restricted to authenticated users)
CREATE POLICY "Allow admin full access to artworks" 
  ON artworks FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to collections" 
  ON collections FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to orders" 
  ON orders FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to page_content" 
  ON page_content FOR ALL 
  USING (auth.role() = 'authenticated');

-- Allow public read access to page content
CREATE POLICY "Allow public read access to page_content" 
  ON page_content FOR SELECT USING (true);

-- Allow customers to create orders
CREATE POLICY "Allow customers to create orders" 
  ON orders FOR INSERT 
  WITH CHECK (true);

-- Allow customers to view their own orders (future implementation)
-- Will require storing customer email or ID in orders

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('artworks', 'artworks', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('about', 'about', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('collections', 'collections', true);

-- Set up storage policies
CREATE POLICY "Allow public read access to artworks storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'artworks');

CREATE POLICY "Allow public read access to about storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'about');

CREATE POLICY "Allow public read access to collections storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'collections');

CREATE POLICY "Allow authenticated users to upload to artworks"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'artworks' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to upload to about"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'about' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to upload to collections"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'collections' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update storage"
  ON storage.objects FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete from storage"
  ON storage.objects FOR DELETE
  USING (auth.role() = 'authenticated');
