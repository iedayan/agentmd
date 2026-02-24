output "neon_project_id" {
  description = "Neon project ID"
  value       = neon_project.main.id
}

output "neon_database_name" {
  description = "Neon database name"
  value       = neon_database.main.name
}

output "neon_connection_hint" {
  description = "Get DATABASE_URL from Neon Console: project Connect > Connection string (use Pooled for serverless)"
  value       = "https://console.neon.tech/app/projects/${neon_project.main.id}"
}

output "redis_endpoint" {
  description = "Upstash Redis endpoint"
  value       = var.create_redis ? upstash_redis_database.main[0].endpoint : null
}

output "redis_password" {
  description = "Upstash Redis password"
  value       = var.create_redis ? upstash_redis_database.main[0].password : null
  sensitive   = true
}

output "redis_url" {
  description = "Upstash Redis URL (rediss:// for TLS)"
  value       = var.create_redis ? "rediss://default:${urlencode(upstash_redis_database.main[0].password)}@${upstash_redis_database.main[0].endpoint}" : null
  sensitive   = true
}

output "s3_bucket" {
  description = "S3 bucket name for execution logs"
  value       = var.create_s3 ? aws_s3_bucket.logs[0].id : null
}

output "s3_region" {
  description = "S3 region"
  value       = var.create_s3 ? var.aws_region : null
}

output "aws_access_key_id" {
  description = "IAM access key for S3 (if created)"
  value       = var.create_s3 ? aws_iam_access_key.agentmd[0].id : null
  sensitive   = true
}

output "aws_secret_access_key" {
  description = "IAM secret key for S3 (if created)"
  value       = var.create_s3 ? aws_iam_access_key.agentmd[0].secret : null
  sensitive   = true
}
