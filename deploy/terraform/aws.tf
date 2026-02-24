# AWS S3 for execution logs
# Requires: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (or default creds)
provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "logs" {
  count  = var.create_s3 ? 1 : 0
  bucket = "${var.project_name}-logs-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_versioning" "logs" {
  count  = var.create_s3 ? 1 : 0
  bucket = aws_s3_bucket.logs[0].id

  versioning_configuration {
    status = "Disabled"
  }
}

resource "aws_s3_bucket_public_access_block" "logs" {
  count  = var.create_s3 ? 1 : 0
  bucket = aws_s3_bucket.logs[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# IAM user for S3 access (optional - use existing creds or create)
resource "aws_iam_user" "agentmd" {
  count  = var.create_s3 ? 1 : 0
  name   = "${var.project_name}-s3"
  path   = "/"
}

resource "aws_iam_access_key" "agentmd" {
  count  = var.create_s3 ? 1 : 0
  user   = aws_iam_user.agentmd[0].name
}

resource "aws_iam_user_policy" "agentmd_s3" {
  count  = var.create_s3 ? 1 : 0
  name   = "s3-logs"
  user   = aws_iam_user.agentmd[0].name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetObject", "s3:ListBucket", "s3:DeleteObject"]
        Resource = [
          aws_s3_bucket.logs[0].arn,
          "${aws_s3_bucket.logs[0].arn}/*"
        ]
      }
    ]
  })
}

data "aws_caller_identity" "current" {}
