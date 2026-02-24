-- Rollback 001_initial.sql
DROP INDEX IF EXISTS idx_executions_status;
DROP INDEX IF EXISTS idx_executions_created;
DROP INDEX IF EXISTS idx_executions_repository;
DROP TABLE IF EXISTS executions;
