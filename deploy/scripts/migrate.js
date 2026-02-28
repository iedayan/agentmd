#!/usr/bin/env node
/**
 * AgentMD Database Migration Runner
 * Runs SQL migrations in deploy/migrations/ against DATABASE_URL.
 * Usage: DATABASE_URL=... pnpm run migrate
 */
import { readdir } from 'fs/promises';
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
  const sqlFiles = files.filter((f) => f.endsWith('.sql') && !f.includes('.rollback')).sort();

  for (const file of sqlFiles) {
    const path = join(migrationsDir, file);
    console.log(`Running ${file}...`);
    try {
      execSync(`psql "${dbUrl}" -f "${path}"`, { stdio: 'inherit' });
      console.log(`  OK`);
    } catch (e) {
      console.error(`  Failed:`, e.message);
      process.exit(1);
    }
  }

  console.log('Migrations complete.');
}

main();
