#!/usr/bin/env node
/**
 * MVP launch readiness check.
 *
 * Runs a practical set of automated checks:
 * 1) Launch environment contract
 * 2) Required DB runtime tables
 * 3) Health/readiness endpoints
 * 4) Optional GitHub branch required-check verification
 *
 * Usage examples:
 *   node deploy/scripts/mvp-launch-check.mjs --target=production
 *   node deploy/scripts/mvp-launch-check.mjs --target=production --app-url=https://app.example.com
 *   node deploy/scripts/mvp-launch-check.mjs --repos=org/repo --branch=main
 */

import { execSync, spawnSync } from "node:child_process";

const REQUIRED_RUNTIME_TABLES = ["rate_limits", "execution_jobs", "user_subscriptions"];
const REQUIRED_GITHUB_CONTEXTS = [
  "agentmd/parse",
  "agentmd/policy-gate",
  "agentmd/output-contract",
];

function parseArgs(argv) {
  const out = {
    target: "production",
    softLaunch: false,
    skipDb: false,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
    repos: [],
    branch: "main",
    verifyGitHub: false,
    strictGitHub: true,
  };

  for (const arg of argv) {
    if (arg.startsWith("--target=")) out.target = arg.split("=")[1] || out.target;
    else if (arg === "--soft-launch") out.softLaunch = true;
    else if (arg === "--skip-db") out.skipDb = true;
    else if (arg.startsWith("--app-url=")) out.appUrl = arg.split("=")[1] || "";
    else if (arg.startsWith("--repos=")) {
      out.repos = (arg.split("=")[1] || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (arg.startsWith("--branch=")) out.branch = arg.split("=")[1] || out.branch;
    else if (arg === "--verify-github") out.verifyGitHub = true;
    else if (arg === "--no-strict-github") out.strictGitHub = false;
  }

  if (out.repos.length === 0 && process.env.GITHUB_REPOS) {
    out.repos = process.env.GITHUB_REPOS.split(",").map((s) => s.trim()).filter(Boolean);
  }

  if (out.repos.length > 0) out.verifyGitHub = true;
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const checks = [];

  checks.push(runEnvValidation(args));
  if (!args.skipDb) {
    checks.push(runDbTableCheck());
  }
  checks.push(await runHealthChecks(args.appUrl));

  if (args.verifyGitHub) {
    checks.push(await runGitHubRequiredCheckVerification(args));
  }

  const passed = checks.filter((c) => c.ok).length;
  const failed = checks.length - passed;

  console.log("\nMVP launch check summary");
  console.log("-".repeat(60));
  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"}  ${check.name}`);
    if (check.details) console.log(`      ${check.details}`);
  }
  console.log("-".repeat(60));
  console.log(`Result: ${passed}/${checks.length} passed`);

  if (failed > 0) {
    process.exit(1);
  }
}

function runEnvValidation(args) {
  const cmdArgs = ["deploy/scripts/validate-launch-env.mjs", `--target=${args.target}`];
  if (args.softLaunch) cmdArgs.push("--soft-launch");

  const result = spawnSync(process.execPath, cmdArgs, {
    stdio: "pipe",
    encoding: "utf-8",
    env: process.env,
  });

  if (result.status === 0) {
    return {
      ok: true,
      name: `Environment contract (${args.target}${args.softLaunch ? ", soft" : ""})`,
      details: (result.stdout || "").trim() || "validated",
    };
  }

  return {
    ok: false,
    name: `Environment contract (${args.target}${args.softLaunch ? ", soft" : ""})`,
    details: ((result.stderr || "") + "\n" + (result.stdout || "")).trim(),
  };
}

function runDbTableCheck() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return {
      ok: false,
      name: "DB runtime tables",
      details: "DATABASE_URL is not set",
    };
  }

  try {
    execSync("psql --version", { stdio: "ignore" });
  } catch {
    return {
      ok: false,
      name: "DB runtime tables",
      details: "psql is not installed or not in PATH",
    };
  }

  const sql = [
    "SELECT tablename",
    "FROM pg_tables",
    "WHERE schemaname='public'",
    `AND tablename IN ('${REQUIRED_RUNTIME_TABLES.join("','")}')`,
    "ORDER BY tablename;",
  ].join(" ");

  try {
    const out = execSync(`psql "${dbUrl}" -Atc "${sql}"`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const found = out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const missing = REQUIRED_RUNTIME_TABLES.filter((t) => !found.includes(t));

    if (missing.length > 0) {
      return {
        ok: false,
        name: "DB runtime tables",
        details: `Missing tables: ${missing.join(", ")}`,
      };
    }

    return {
      ok: true,
      name: "DB runtime tables",
      details: `Verified tables: ${found.join(", ")}`,
    };
  } catch (error) {
    return {
      ok: false,
      name: "DB runtime tables",
      details: `Failed DB query: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function runHealthChecks(appUrlRaw) {
  const appUrl = (appUrlRaw || "").trim().replace(/\/$/, "");
  if (!appUrl) {
    return {
      ok: false,
      name: "Health/readiness endpoints",
      details: "Missing app URL. Set NEXT_PUBLIC_APP_URL or pass --app-url",
    };
  }

  try {
    const [healthRes, readyRes] = await Promise.all([
      fetch(`${appUrl}/api/health`, { headers: { "Cache-Control": "no-cache" } }),
      fetch(`${appUrl}/api/health/ready`, { headers: { "Cache-Control": "no-cache" } }),
    ]);

    if (!healthRes.ok || !readyRes.ok) {
      return {
        ok: false,
        name: "Health/readiness endpoints",
        details: `health=${healthRes.status}, ready=${readyRes.status}`,
      };
    }

    const [healthJson, readyJson] = await Promise.all([healthRes.json(), readyRes.json()]);
    const statusOk = healthJson?.ok === true && readyJson?.ok === true;
    if (!statusOk) {
      return {
        ok: false,
        name: "Health/readiness endpoints",
        details: `Unexpected response payloads from ${appUrl}`,
      };
    }

    return {
      ok: true,
      name: "Health/readiness endpoints",
      details: `${appUrl}/api/health and /api/health/ready both returned ok`,
    };
  } catch (error) {
    return {
      ok: false,
      name: "Health/readiness endpoints",
      details: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function runGitHubRequiredCheckVerification(args) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    return {
      ok: false,
      name: "GitHub required status checks",
      details: "Set GITHUB_TOKEN or GH_TOKEN to verify branch protection contexts",
    };
  }

  if (args.repos.length === 0) {
    return {
      ok: false,
      name: "GitHub required status checks",
      details: "No repos provided. Pass --repos=owner/repo[,owner/repo]",
    };
  }

  const failures = [];
  for (const full of args.repos) {
    const [owner, repo] = full.split("/");
    if (!owner || !repo) {
      failures.push(`${full}: invalid repo format`);
      continue;
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/branches/${encodeURIComponent(args.branch)}/protection/required_status_checks`;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "agentmd-launch-check",
        },
      });
      if (!res.ok) {
        failures.push(`${full}: GitHub API ${res.status}`);
        continue;
      }
      const data = await res.json();
      const contexts = Array.isArray(data.contexts)
        ? data.contexts.filter((c) => typeof c === "string")
        : [];
      const missing = REQUIRED_GITHUB_CONTEXTS.filter((ctx) => !contexts.includes(ctx));
      if (missing.length > 0) {
        failures.push(`${full}: missing contexts ${missing.join(", ")}`);
      }
    } catch (error) {
      failures.push(`${full}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length > 0) {
    return {
      ok: !args.strictGitHub,
      name: "GitHub required status checks",
      details: failures.join(" | "),
    };
  }

  return {
    ok: true,
    name: "GitHub required status checks",
    details: `Verified contexts on ${args.repos.length} repo(s) for branch ${args.branch}`,
  };
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
