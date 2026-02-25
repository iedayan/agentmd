-- Rollback 006_execution_step_details.sql

ALTER TABLE execution_steps
  DROP COLUMN IF EXISTS details;
