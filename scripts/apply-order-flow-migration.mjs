#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { Client } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be injected into this process');
}

const migrationUrl = new URL('../supabase/migrations/07_professional_order_flow.sql', import.meta.url);
const migration = await readFile(migrationUrl, 'utf8');
neonConfig.webSocketConstructor = ws;
const client = new Client(process.env.DATABASE_URL);

await client.connect();
try {
  await client.query('BEGIN');
  await client.query(migration);
  if (process.env.MIGRATION_DRY_RUN === 'true') {
    await client.query('ROLLBACK');
    console.log('Professional order flow migration validated and rolled back');
  } else {
    await client.query('COMMIT');
    console.log('Professional order flow migration applied');
  }
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
