# Neon Postgres
# Requires: NEON_API_KEY env var (Account Settings > API Keys)
provider "neon" {}

resource "neon_project" "main" {
  name   = "${var.project_name}-prod"
  region = var.neon_region
}

resource "neon_database" "main" {
  project_id = neon_project.main.id
  branch_id  = neon_project.main.default_branch_id
  name       = "agentmd"
  owner_name = "agentmd"
}
