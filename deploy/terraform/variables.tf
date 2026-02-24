variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
  default     = "agentmd"
}

variable "aws_region" {
  description = "AWS region for S3 bucket"
  type        = string
  default     = "us-east-1"
}

variable "neon_region" {
  description = "Neon region (e.g. us-east-1, eu-central-1)"
  type        = string
  default     = "us-east-1"
}

variable "upstash_region" {
  description = "Upstash Redis region"
  type        = string
  default     = "us-east-1"
}

variable "create_s3" {
  description = "Create S3 bucket for execution logs"
  type        = bool
  default     = true
}

variable "create_redis" {
  description = "Create Upstash Redis database"
  type        = bool
  default     = true
}

# Upstash: set via TF_VAR_upstash_email, TF_VAR_upstash_api_key, or terraform.tfvars
variable "upstash_email" {
  description = "Upstash account email"
  type        = string
  default     = ""
  sensitive   = true
}

variable "upstash_api_key" {
  description = "Upstash API key"
  type        = string
  default     = ""
  sensitive   = true
}
