// Fix page_content table and add initial content
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
  console.log('🔄 Checking and fixing page_content table...');

  try {
    // Check if page_content table exists
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', { 
        query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_content')" 
      });

    if (tablesError) {
      if (tablesError.message.includes('function "exec_sql" does not exist')) {
        console.log('⚠️ The exec_sql function does not exist. Creating it now...');
        
        // Create the exec_sql function
        const { error: createFnError } = await supabase.rpc('exec_sql', { 
          query: `
          CREATE OR REPLACE FUNCTION exec_sql(query text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE query;
          END;
          $$;`
        });
        
        if (createFnError) {
          console.error('❌ Error creating exec_sql function:', createFnError);
          console.log('Please create this function manually in the Supabase SQL Editor.');
        } else {
          console.log('✅ exec_sql function created successfully');
        }
      } else {
        console.error('❌ Error checking tables:', tablesError);
      }
      
      // Try direct SQL query as fallback
      console.log('Trying direct SQL query to create page_content table...');
      
      // Create the page_content table
      const { error: createTableError } = await supabase.rpc('exec_sql', { 
        query: `
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
        `
      });
      
      if (createTableError) {
        console.error('❌ Error creating page_content table:', createTableError);
      } else {
        console.log('✅ page_content table created or already exists');
      }
    } else {
      console.log('✅ Table check completed');
    }

    // Add initial content
    console.log('\n📝 Adding initial About page content...');
    
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

    // First try to delete any existing content to avoid conflicts
    await supabase
      .from('page_content')
      .delete()
      .eq('page', 'about');
      
    // Then insert new content
    const { error: contentError } = await supabase
      .from('page_content')
      .insert(aboutSections);

    if (contentError) {
      console.error('❌ Error adding initial content:', contentError);
    } else {
      console.log('✅ Initial About page content added successfully');
    }

    console.log('\n🎉 Setup completed!');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

main();
