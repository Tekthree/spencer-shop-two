/**
 * Migration Script
 *
 * Applies SQL migration files to the Neon database.
 *
 * Usage:
 *   node scripts/apply-migrations.js
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('Applying migrations to Neon...');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.error('No .sql migration files found in supabase/migrations/');
    process.exit(1);
  }

  console.log(`Found ${migrationFiles.length} migration file(s):`);
  migrationFiles.forEach(file => console.log(`  - ${file}`));

  for (const file of migrationFiles) {
    console.log(`\nApplying migration: ${file}...`);
    const migrationPath = path.join(migrationsDir, file);
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    try {
      // neon tagged template literal doesn't support raw SQL strings directly,
      // so we use the unsafe query method via the http client.
      // @neondatabase/serverless exports neon() which supports sql.query for raw SQL.
      await sql.query(migrationSql);
      console.log(`  Migration ${file} applied successfully.`);
    } catch (error) {
      console.error(`  Failed to apply ${file}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\nAll migrations applied successfully.');
}

main();

export { main };
