#!/usr/bin/env node
/**
 * Generate .env snippet from Terraform outputs.
 * Usage: cd deploy/terraform && terraform output -json | node ../scripts/terraform-to-env.mjs
 *
 * Pipe terraform output -json to stdin, or run from terraform dir:
 *   terraform output -json 2>/dev/null | node deploy/scripts/terraform-to-env.mjs
 */

let json = "";
try {
  json = await new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => { data += chunk; });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
} catch (e) {
  console.error("Read terraform output -json and pipe to this script.");
  process.exit(1);
}

if (!json.trim()) {
  console.error("No input. Run: cd deploy/terraform && terraform output -json | node ../scripts/terraform-to-env.mjs");
  process.exit(1);
}

let out;
try {
  out = JSON.parse(json);
} catch (e) {
  console.error("Invalid JSON. Use: terraform output -json");
  process.exit(1);
}

const get = (key) => out[key]?.value ?? null;

const lines = [
  "# Generated from Terraform outputs. Add to deploy/.env",
  "",
];

const redisUrl = get("redis_url");
if (redisUrl) {
  lines.push(`REDIS_URL=${redisUrl}`);
}

const s3Bucket = get("s3_bucket");
const s3Region = get("s3_region");
if (s3Bucket) {
  lines.push(`S3_BUCKET=${s3Bucket}`);
}
if (s3Region) {
  lines.push(`S3_REGION=${s3Region}`);
}

const awsKey = get("aws_access_key_id");
const awsSecret = get("aws_secret_access_key");
if (awsKey) {
  lines.push(`# AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY - set from terraform output (sensitive)`);
  lines.push(`# terraform output aws_access_key_id`);
  lines.push(`# terraform output aws_secret_access_key`);
}

lines.push("");
lines.push("# DATABASE_URL: Get from Neon Console (see neon_connection_hint output)");
lines.push("# NEXTAUTH_SECRET: openssl rand -base64 32");
lines.push("# GITHUB_ID, GITHUB_SECRET: GitHub OAuth app");

console.log(lines.join("\n"));
