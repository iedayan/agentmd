#!/usr/bin/env node
/**
 * Generate GitHub OAuth App and GitHub App configuration.
 * Usage: node deploy/scripts/github-config.mjs [base-url]
 * Example: node deploy/scripts/github-config.mjs https://agentmd.online
 */
const baseUrl = (process.argv[2] || "https://agentmd.online").replace(/\/$/, "");

const config = {
  oauth: {
    "Authorization callback URL": `${baseUrl}/api/auth/callback/github`,
  },
  githubApp: {
    "Webhook URL": `${baseUrl}/api/github/webhooks`,
    "Callback URL": `${baseUrl}/api/github/callback`,
    "Setup URL": `${baseUrl}/dashboard`,
    "Webhook secret": "Run: openssl rand -hex 32",
  },
  env: `# Add to .env or deployment
GITHUB_ID=your_client_id
GITHUB_SECRET=your_client_secret
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\\n...\\n-----END RSA PRIVATE KEY-----"
GITHUB_APP_SLUG=your-app-slug
GITHUB_WEBHOOK_SECRET=your_webhook_secret
`,
};

console.log("GitHub OAuth App (https://github.com/settings/developers):");
Object.entries(config.oauth).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log("\nGitHub App (https://github.com/settings/apps/new):");
Object.entries(config.githubApp).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log("\nEnvironment variables:");
console.log(config.env);
