#!/usr/bin/env node
/**
 * Validate launch-critical environment variables.
 * Usage:
 *   node deploy/scripts/validate-launch-env.mjs --target=staging
 *   node deploy/scripts/validate-launch-env.mjs --target=production
 *   node deploy/scripts/validate-launch-env.mjs --target=production --soft-launch
 *
 * --soft-launch: Only require core infra (Vercel, Postgres, GitHub OAuth).
 *   Stripe, S3, Redis, Sentry, Slack, GitHub webhook are optional.
 */

const args = process.argv.slice(2);
const targetArg = args.find((arg) => arg.startsWith("--target="));
const target = targetArg ? targetArg.split("=")[1] : "production";
const softLaunch = args.includes("--soft-launch");

const allowedTargets = new Set(["staging", "production"]);
if (!allowedTargets.has(target)) {
  console.error(`Invalid target '${target}'. Use --target=staging|production`);
  process.exit(1);
}

const requiredForAll = [
  "NEXT_PUBLIC_APP_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "GITHUB_ID",
  "GITHUB_SECRET",
  "DATABASE_URL",
];

const requiredForProductionOnly = softLaunch
  ? []
  : [
      "REDIS_URL",
      "GITHUB_WEBHOOK_SECRET",
      "STRIPE_SECRET_KEY",
      "STRIPE_PRO_PRICE_ID",
      "STRIPE_ENTERPRISE_PRICE_ID",
      "SENTRY_DSN",
      "SLACK_WEBHOOK_URL",
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "S3_BUCKET",
      "S3_REGION",
    ];

const checks = [
  { key: "NEXT_PUBLIC_APP_URL", validate: isHttpUrl },
  { key: "NEXTAUTH_URL", validate: isHttpUrl },
  { key: "DATABASE_URL", validate: isPostgresUrl },
  { key: "REDIS_URL", validate: isRedisUrl, optional: softLaunch },
  { key: "SENTRY_DSN", validate: isHttpUrl, optional: softLaunch || target !== "production" },
  { key: "SLACK_WEBHOOK_URL", validate: isHttpUrl, optional: softLaunch || target !== "production" },
];

const required = [
  ...requiredForAll,
  ...(target === "production" ? requiredForProductionOnly : []),
];

const missing = [];
for (const key of required) {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    missing.push(key);
  }
}

if (missing.length > 0) {
  console.error("Missing required environment variables:");
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

const invalid = [];
for (const check of checks) {
  const value = process.env[check.key];
  if (!value) {
    if (!check.optional) invalid.push(`${check.key}: missing`);
    continue;
  }
  if (!check.validate(value)) {
    invalid.push(`${check.key}: invalid format`);
  }
}

if (invalid.length > 0) {
  console.error("Invalid environment variable values:");
  for (const line of invalid) {
    console.error(`- ${line}`);
  }
  process.exit(1);
}

console.log(`Launch environment validation passed for target: ${target}${softLaunch ? " (soft launch)" : ""}`);

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isPostgresUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "postgresql:" || url.protocol === "postgres:";
  } catch {
    return false;
  }
}

function isRedisUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "redis:" || url.protocol === "rediss:";
  } catch {
    return false;
  }
}
