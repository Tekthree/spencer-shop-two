// Check tables and row counts via Neon
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('Checking Neon tables...');

  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('No tables found in public schema.');
      return;
    }

    console.log('Tables in public schema:');
    for (const row of tables) {
      const name = row.table_name;
      const [{ count }] = await sql`SELECT COUNT(*) AS count FROM ${sql(name)}`;
      console.log(`  ${name}: ${count} rows`);
    }
  } catch (error) {
    console.error('Script error:', error);
  }
}

main();
