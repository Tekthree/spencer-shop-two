/**
 * Supabase Migration Script
 * 
 * This script applies the SQL migrations to the Supabase project
 * 
 * Usage:
 * node scripts/apply-migrations.js
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase client with service role key (required for migrations)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('🔄 Applying Supabase migrations...');

  try {
    // Get all migration files
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations are applied in order

    if (migrationFiles.length === 0) {
      console.log('❌ No migration files found in supabase/migrations directory');
      process.exit(1);
    }

    console.log(`Found ${migrationFiles.length} migration file(s):`);
    migrationFiles.forEach(file => console.log(`- ${file}`));

    // Apply each migration
    for (const file of migrationFiles) {
      console.log(`\n📝 Applying migration: ${file}...`);
      
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { query: sql });
      
      if (error) {
        if (error.message.includes('function "exec_sql" does not exist')) {
          console.error('❌ Error: The exec_sql function does not exist in your Supabase project.');
          console.error('   This function is required for running SQL migrations.');
          console.error('   Please create this function in the SQL editor of your Supabase dashboard:');
          console.error(`
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;`);
          process.exit(1);
        } else {
          throw error;
        }
      }
      
      console.log(`✅ Migration ${file} applied successfully`);
    }

    console.log('\n🎉 All migrations applied successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the setup script to create an admin user:');
    console.log('   node scripts/setup-supabase.js');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Execute the main function
main();

// Export for module usage
export { main };
