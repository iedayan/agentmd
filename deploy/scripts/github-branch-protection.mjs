#!/usr/bin/env node
/**
 * Configure GitHub required status checks for branch protection.
 * Uses GitHub REST API required_status_checks endpoint.
 *
 * Usage:
 *   node deploy/scripts/github-branch-protection.mjs --repos=org/repo,org/repo2 --branch=main
 *   node deploy/scripts/github-branch-protection.mjs --repos=org/repo --dry-run
 *
 * Auth:
 *   GITHUB_TOKEN or GH_TOKEN must be set (repo admin scope required).
 */

const DEFAULT_CONTEXTS = [
  "agentmd/parse",
  "agentmd/policy-gate",
  "agentmd/output-contract",
];

function parseArgs(argv) {
  const out = {
    repos: [],
    branch: "main",
    strict: true,
    dryRun: false,
    contexts: [...DEFAULT_CONTEXTS],
  };

  for (const arg of argv) {
    if (arg.startsWith("--repos=")) {
      out.repos = (arg.split("=")[1] || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (arg.startsWith("--branch=")) {
      out.branch = arg.split("=")[1] || out.branch;
    } else if (arg === "--no-strict") {
      out.strict = false;
    } else if (arg === "--dry-run") {
      out.dryRun = true;
    } else if (arg.startsWith("--contexts=")) {
      const value = arg.split("=")[1] || "";
      const parsed = value.split(",").map((s) => s.trim()).filter(Boolean);
      if (parsed.length > 0) out.contexts = parsed;
    }
  }

  if (out.repos.length === 0 && process.env.GITHUB_REPOS) {
    out.repos = process.env.GITHUB_REPOS.split(",").map((s) => s.trim()).filter(Boolean);
  }

  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  if (!token && !args.dryRun) {
    console.error("Set GITHUB_TOKEN or GH_TOKEN.");
    process.exit(1);
  }

  if (args.repos.length === 0) {
    console.error("No repos provided. Use --repos=owner/repo[,owner/repo]");
    process.exit(1);
  }

  const failures = [];
  for (const full of args.repos) {
    const [owner, repo] = full.split("/");
    if (!owner || !repo) {
      failures.push(`${full}: invalid format`);
      continue;
    }

    const endpoint = `https://api.github.com/repos/${owner}/${repo}/branches/${encodeURIComponent(args.branch)}/protection/required_status_checks`;
    const body = {
      strict: args.strict,
      contexts: args.contexts,
    };

    if (args.dryRun) {
      console.log(`[dry-run] ${full}@${args.branch} -> ${JSON.stringify(body)}`);
      continue;
    }

    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
          "User-Agent": "agentmd-branch-protection",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        failures.push(`${full}: GitHub API ${res.status} ${text.slice(0, 220)}`);
        continue;
      }

      const data = await res.json();
      const contexts = Array.isArray(data.contexts) ? data.contexts : [];
      const missing = args.contexts.filter((ctx) => !contexts.includes(ctx));
      if (missing.length > 0) {
        failures.push(`${full}: update response missing contexts ${missing.join(", ")}`);
      } else {
        console.log(`updated ${full}@${args.branch}: ${contexts.join(", ")}`);
      }
    } catch (error) {
      failures.push(`${full}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length > 0) {
    console.error("\nFailed updates:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  if (args.dryRun) {
    console.log(`\nDry run complete for ${args.repos.length} repo(s).`);
  } else {
    console.log(`\nBranch protection required checks updated for ${args.repos.length} repo(s).`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
