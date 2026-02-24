# Upstash Redis
# Set credentials: export TF_VAR_upstash_email=... TF_VAR_upstash_api_key=...
# Or add to terraform.tfvars (do not commit)
provider "upstash" {
  email   = var.upstash_email
  api_key = var.upstash_api_key
}

resource "upstash_redis_database" "main" {
  count         = var.create_redis ? 1 : 0
  database_name = "${var.project_name}-redis"
  region        = var.upstash_region
  tls           = true
}
