#!/usr/bin/env node
/**
 * Verify that all AgentMD migrations have been applied.
 * Usage: DATABASE_URL=... pnpm run migrate:verify
 */
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const EXPECTED_TABLES = [
  'executions',
  'users',
  'repositories',
  'audit_logs',
  'execution_steps',
  'github_installations',
  'rate_limits',
  'execution_jobs',
  'user_subscriptions',
  'api_keys',
  'user_preferences',
];

function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const tablesSql = join(__dirname, '.verify-tables.sql');
  const colsSql = join(__dirname, '.verify-cols.sql');
  writeFileSync(
    tablesSql,
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;",
  );
  writeFileSync(
    colsSql,
    "SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='execution_steps' AND column_name='details';",
  );

  let output = '';
  try {
    output = execSync(`psql "${url}" -t -A -f "${tablesSql}"`, { encoding: 'utf-8' });
  } catch (e) {
    unlinkSync(tablesSql);
    unlinkSync(colsSql);
    console.error('Failed to connect:', e.message);
    process.exit(1);
  }

  unlinkSync(tablesSql);
  const existing = new Set(output.trim().split('\n').filter(Boolean));

  let ok = true;
  for (const table of EXPECTED_TABLES) {
    const found = existing.has(table);
    console.log(found ? `  ✓ ${table}` : `  ✗ ${table} (missing)`);
    if (!found) ok = false;
  }

  let hasDetails = false;
  try {
    const colOut = execSync(`psql "${url}" -t -A -f "${colsSql}"`, { encoding: 'utf-8' });
    hasDetails = colOut.trim() === '1';
  } catch {
    // ignore
  }
  unlinkSync(colsSql);
  console.log(hasDetails ? '  ✓ execution_steps.details' : '  ✗ execution_steps.details (missing)');
  if (!hasDetails) ok = false;

  console.log('');
  if (ok) {
    console.log('All migrations verified.');
  } else {
    console.error('Some tables/columns are missing. Run: pnpm run migrate');
    process.exit(1);
  }
}

main();
