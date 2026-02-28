#!/usr/bin/env node
/**
 * AgentMD Database Migration Rollback
 * Runs .rollback.sql files in reverse order.
 * Usage: DATABASE_URL=... pnpm run migrate:rollback
 */
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '..', 'migrations');

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const files = await readdir(migrationsDir);
  const rollbackFiles = files
    .filter((f) => f.endsWith('.rollback.sql'))
    .sort()
    .reverse();

  for (const file of rollbackFiles) {
    const path = join(migrationsDir, file);
    console.log(`Rolling back ${file}...`);
    try {
      execSync(`psql "${dbUrl}" -f "${path}"`, { stdio: 'inherit' });
      console.log(`  OK`);
    } catch (e) {
      console.error(`  Failed:`, e.message);
      process.exit(1);
    }
  }

  console.log('Rollback complete.');
}

main();
