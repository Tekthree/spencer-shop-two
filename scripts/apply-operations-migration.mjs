#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { Client, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be injected into this process');

neonConfig.webSocketConstructor = ws;
const migrationUrl = new URL('../supabase/migrations/08_operations_and_login_security.sql', import.meta.url);
const migration = await readFile(migrationUrl, 'utf8');
const client = new Client(process.env.DATABASE_URL);

await client.connect();
try {
  await client.query('BEGIN');
  await client.query(migration);
  if (process.env.MIGRATION_DRY_RUN === 'true') {
    await client.query('ROLLBACK');
    console.log('Operations migration validated and rolled back');
  } else {
    await client.query('COMMIT');
    console.log('Operations migration applied');
  }
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
