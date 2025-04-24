// Check if tables were created correctly
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
  console.log('Checking Supabase tables...');

  try {
    // Check if page_content table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return;
    }

    console.log('Tables in public schema:');
    tables.forEach(table => console.log(`- ${table.table_name}`));

    // Try to insert content directly
    const testContent = {
      id: 'test',
      page: 'about',
      title: 'Test Content',
      content: 'This is a test content entry.',
      order: 0
    };

    console.log('\nAttempting to insert test content...');
    const { data: insertData, error: insertError } = await supabase
      .from('page_content')
      .insert([testContent])
      .select();

    if (insertError) {
      console.error('Error inserting test content:', insertError);
    } else {
      console.log('Test content inserted successfully:', insertData);
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

main();
