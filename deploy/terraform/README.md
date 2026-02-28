# AgentMD Infrastructure (Terraform)

Provision Neon Postgres, Upstash Redis, and AWS S3 for AgentMD.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.5
- Accounts: [Neon](https://neon.tech), [Upstash](https://upstash.com), [AWS](https://aws.amazon.com)

## Provider credentials

Set before running Terraform:

```bash
# Neon (required)
export NEON_API_KEY="your-neon-api-key"   # Neon Console > Account Settings > API Keys

# Upstash (optional if create_redis=false)
export UPSTASH_EMAIL="your@email.com"
export UPSTASH_API_KEY="your-upstash-api-key"   # Upstash Console > API Keys

# AWS (optional if create_s3=false)
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
# Or use: aws configure
```

## Usage

```bash
cd deploy/terraform

# Initialize
terraform init

# Plan (review changes)
terraform plan

# Apply (create resources)
terraform apply
```

## Variables

| Variable         | Description           | Default     |
| ---------------- | --------------------- | ----------- |
| `project_name`   | Resource name prefix  | `agentmd`   |
| `neon_region`    | Neon region           | `us-east-1` |
| `upstash_region` | Upstash region        | `us-east-1` |
| `aws_region`     | AWS region            | `us-east-1` |
| `create_s3`      | Create S3 bucket      | `true`      |
| `create_redis`   | Create Redis database | `true`      |

Override via `terraform.tfvars` or `-var`:

```hcl
# terraform.tfvars
project_name = "agentmd"
create_redis = true
create_s3   = true
```

## Outputs

After `terraform apply`:

- `neon_project_id` — Neon project ID (get `DATABASE_URL` from Neon Console)
- `redis_url` — Upstash Redis URL (set as `REDIS_URL`)
- `s3_bucket`, `s3_region` — S3 bucket details
- `aws_access_key_id`, `aws_secret_access_key` — IAM creds for S3 (if created)

## Generate env template

```bash
terraform output -json | node ../../scripts/terraform-to-env.mjs
```

Or copy values manually into `deploy/.env` from the outputs.

## Soft launch (minimal)

For soft launch, provision only Neon:

```bash
terraform apply -var="create_redis=false" -var="create_s3=false" \
  -target=neon_project.main -target=neon_database.main
```

Or create only `neon.tf` in a separate directory. Get `DATABASE_URL` from [Neon Console](https://console.neon.tech) and configure Vercel manually.
