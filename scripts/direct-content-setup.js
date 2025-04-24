// Direct content setup for Spencer Grey Artist Website
// This script directly creates content without relying on exec_sql
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('🔄 Setting up content for Spencer Grey Artist Website...');

  try {
    // Step 1: Try to create the page_content table using SQL API
    console.log('\n📝 Creating page_content table if needed...');
    
    // We'll try a direct REST API approach instead of using exec_sql
    // First, let's check if we can insert content directly
    const aboutSections = [
      {
        id: 'bio',
        page: 'about',
        title: 'Biography',
        content: 'Spencer Grey is a contemporary artist based in Seattle, Washington. His work explores the intersection of urban landscapes and natural elements, creating a unique visual language that resonates with viewers worldwide.',
        order: 0
      },
      {
        id: 'statement',
        page: 'about',
        title: 'Artist Statement',
        content: 'My work is an ongoing exploration of the spaces we inhabit—both physically and emotionally. Through limited edition prints, I aim to capture moments of quiet contemplation in our increasingly chaotic world.',
        order: 1
      },
      {
        id: 'exhibitions',
        page: 'about',
        title: 'Exhibitions',
        content: '2024 - "Urban Reflections" - Seattle Art Gallery\n2023 - "New Perspectives" - Portland Museum of Contemporary Art\n2022 - "Emerging Artists Showcase" - San Francisco',
        order: 2
      }
    ];

    // Try to insert content directly - if the table doesn't exist, this will fail
    console.log('Attempting to insert content directly...');
    const { data: insertData, error: insertError } = await supabase
      .from('page_content')
      .upsert(aboutSections);

    if (insertError) {
      console.log('❌ Error inserting content:', insertError);
      
      if (insertError.code === '42P01') { // Relation does not exist
        console.log('Table page_content does not exist. You need to create it manually.');
        console.log('Please run the following SQL in the Supabase SQL Editor:');
        console.log(`
CREATE TABLE IF NOT EXISTS page_content (
  id TEXT PRIMARY KEY,
  page TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  "order" INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_content_page ON page_content(page);

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow admin full access to page_content" 
  ON page_content FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow public read access to page_content" 
  ON page_content FOR SELECT USING (true);
        `);
      }
    } else {
      console.log('✅ Content added successfully!');
    }

    // Step 2: Check if storage buckets exist and create them if needed
    console.log('\n📝 Checking storage buckets...');
    
    const buckets = ['artworks', 'about', 'collections'];
    
    for (const bucket of buckets) {
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket(bucket);
        
      if (bucketError) {
        if (bucketError.code === 'PGRST116') { // Bucket not found
          console.log(`Creating bucket: ${bucket}...`);
          const { error: createError } = await supabase
            .storage
            .createBucket(bucket, {
              public: true,
              fileSizeLimit: 10485760, // 10MB
            });
            
          if (createError) {
            console.log(`❌ Error creating bucket ${bucket}:`, createError);
          } else {
            console.log(`✅ Bucket ${bucket} created successfully`);
          }
        } else {
          console.log(`❌ Error checking bucket ${bucket}:`, bucketError);
        }
      } else {
        console.log(`✅ Bucket ${bucket} already exists`);
      }
    }

    console.log('\n🎉 Setup completed!');
    console.log('\nYou can now:');
    console.log('1. Log in to the admin panel at /admin/login');
    console.log('2. Use admin@spencergrey.com and the password SpencerGrey2025!');
    console.log('3. Start adding artworks and managing your content');
    console.log('\n⚠️ IMPORTANT: Change the default password after your first login!');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

main();
