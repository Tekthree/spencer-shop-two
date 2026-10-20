#!/usr/bin/env node

import { mkdir, chmod, stat, writeFile } from 'node:fs/promises';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';
import { resolve, join } from 'node:path';
import { Client, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

const gzipAsync = promisify(gzip);
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be injected into this process');

const outputDirectory = process.argv[2];
if (!outputDirectory) {
  throw new Error('Usage: node scripts/backup-neon.mjs /absolute/private/backup/directory');
}

const resolvedDirectory = resolve(outputDirectory);
const repositoryRoot = resolve(new URL('..', import.meta.url).pathname);
if (resolvedDirectory === repositoryRoot || resolvedDirectory.startsWith(`${repositoryRoot}/`)) {
  throw new Error('Database backups contain customer data and must be stored outside the repository');
}

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

neonConfig.webSocketConstructor = ws;
const client = new Client(process.env.DATABASE_URL);
await client.connect();

try {
  const tableResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  const tables = {};
  for (const { table_name: tableName } of tableResult.rows) {
    const result = await client.query(
      `SELECT to_jsonb(row_data) AS data FROM public.${quoteIdentifier(tableName)} AS row_data`
    );
    tables[tableName] = result.rows.map(row => row.data);
  }

  const backup = {
    format: 'spencer-art-neon-json-v1',
    createdAt: new Date().toISOString(),
    tableCount: Object.keys(tables).length,
    rowCount: Object.values(tables).reduce((total, rows) => total + rows.length, 0),
    tables
  };

  await mkdir(resolvedDirectory, { recursive: true, mode: 0o700 });
  const timestamp = backup.createdAt.replace(/[:.]/g, '-');
  const outputPath = join(resolvedDirectory, `spencer-art-${timestamp}.json.gz`);
  await writeFile(outputPath, await gzipAsync(JSON.stringify(backup)), { mode: 0o600, flag: 'wx' });
  await chmod(outputPath, 0o600);
  const file = await stat(outputPath);
  if (file.size === 0) throw new Error('Backup file is empty');

  console.log(JSON.stringify({
    output: outputPath,
    bytes: file.size,
    tables: backup.tableCount,
    rows: backup.rowCount
  }, null, 2));
} finally {
  await client.end();
}
