-- GitHub App installations (for repo sync)
CREATE TABLE IF NOT EXISTS github_installations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  installation_id TEXT NOT NULL,
  account_login TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_github_installations_user ON github_installations(user_id);
CREATE INDEX IF NOT EXISTS idx_github_installations_installation ON github_installations(installation_id);
