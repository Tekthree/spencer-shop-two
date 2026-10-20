#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { gunzip } from 'node:zlib';
import { promisify } from 'node:util';

const gunzipAsync = promisify(gunzip);
const backupPath = process.argv[2];
if (!backupPath) throw new Error('Usage: node scripts/verify-neon-backup.mjs /absolute/path/to/backup.json.gz');

const backup = JSON.parse((await gunzipAsync(await readFile(backupPath))).toString('utf8'));
if (backup.format !== 'spencer-art-neon-json-v1') throw new Error('Unknown backup format');
if (!backup.tables || typeof backup.tables !== 'object') throw new Error('Backup has no tables');

const tableNames = Object.keys(backup.tables);
const rowCount = Object.values(backup.tables).reduce((total, rows) => {
  if (!Array.isArray(rows)) throw new Error('Backup table data is invalid');
  return total + rows.length;
}, 0);
if (tableNames.length !== backup.tableCount || rowCount !== backup.rowCount) {
  throw new Error('Backup manifest counts do not match its contents');
}
for (const requiredTable of ['artworks', 'orders', 'checkout_reservations']) {
  if (!tableNames.includes(requiredTable)) throw new Error(`Backup is missing ${requiredTable}`);
}

console.log(JSON.stringify({
  valid: true,
  createdAt: backup.createdAt,
  tables: tableNames.length,
  rows: rowCount
}, null, 2));
