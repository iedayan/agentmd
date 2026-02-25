-- Add structured metadata to execution steps (blocked reasons, etc.)

ALTER TABLE execution_steps
  ADD COLUMN IF NOT EXISTS details JSONB;
