# AgentMD Database Migrations

Migrations are run before each deployment. Use a migration tool like:

- **Drizzle** — `drizzle-kit migrate`
- **Prisma** — `prisma migrate deploy`
- **node-pg-migrate** — `npm run migrate`

## Setup

1. Add your migration tool to the project
2. Create migrations in `deploy/migrations/` or tool-specific folder
3. Add `migrate` and `migrate:rollback` scripts to root `package.json`
4. Run migrations in CI before deploy (or as a separate job)

## Example Migration (SQL)

```sql
-- 001_initial.sql
CREATE TABLE IF NOT EXISTS executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_executions_repository ON executions(repository_id);
CREATE INDEX idx_executions_created ON executions(created_at DESC);
```

## Rollback

Each migration should have a corresponding rollback script. Example:

```sql
-- 001_initial.rollback.sql
DROP TABLE IF EXISTS executions;
```
