/**
 * Real execution: fetch AGENTS.md, parse, clone repo, run commands.
 * Used when AGENTMD_REAL_EXECUTION=1.
 */
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";

/**
 * Convert GitHub blob URL to raw URL.
 * github.com/owner/repo/blob/ref/path -> raw.githubusercontent.com/owner/repo/ref/path
 */
function toRawUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "github.com" && u.pathname.includes("/blob/")) {
      const match = u.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.*)$/);
      if (match) {
        const [, owner, repo, ref, path] = match;
        return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
      }
    }
    return url;
  } catch {
    return url;
  }
}

/**
 * Derive repo URL and ref from raw GitHub URL.
 * raw.githubusercontent.com/owner/repo/ref/path -> { repoUrl, ref }
 * Returns null if not a GitHub raw URL.
 */
function deriveRepoFromRawUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    if (u.hostname !== "raw.githubusercontent.com") return null;
    const parts = u.pathname.slice(1).split("/");
    if (parts.length < 4) return null;
    const [owner, repo, ref] = parts;
    return {
      repoUrl: `https://github.com/${owner}/${repo}.git`,
      ref,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch text from URL.
 */
async function fetchText(url) {
  const res = await fetch(url, {
    headers: { Accept: "text/plain, text/markdown, */*" },
  });
  if (!res.ok) throw new Error(`Failed to fetch AGENTS.md: ${res.status} ${res.statusText}`);
  const text = await res.text();
  if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
    throw new Error("URL returned HTML instead of AGENTS.md content");
  }
  return text;
}

/**
 * Clone repo into temp dir. Returns temp dir path or throws.
 */
function cloneRepo(repoUrl, ref, tempDir) {
  const result = spawnSync(
    "git",
    ["clone", "--depth", "1", "--branch", ref, repoUrl, tempDir],
    { encoding: "utf-8", timeout: 60000 }
  );
  if (result.status !== 0) {
    const err = result.stderr || result.stdout || "git clone failed";
    throw new Error(`git clone failed: ${err}`);
  }
  return tempDir;
}

/**
 * Run real execution: fetch AGENTS.md, parse, clone, execute commands.
 * @returns { Promise<{ commandsRun: number; commandsPassed: number; commandsFailed: number; durationMs: number; steps: Array<{ command: string; type: string; status: string; durationMs: number; output?: string; error?: string }> }> }
 */
export async function runRealExecution(agentsMdUrl) {
  const rawUrl = toRawUrl(agentsMdUrl);
  const content = await fetchText(rawUrl);

  const { parseAgentsMd, executeCommands, planCommandExecutions } = await import("@agentmd-dev/agentmd-core");
  const parsed = parseAgentsMd(content);
  const commands = parsed.commands;
  const permissions = parsed.frontmatter?.permissions;

  const plan = await planCommandExecutions(commands, {
    useShell: true,
    permissions,
  });

  if (commands.length === 0) {
    return {
      commandsRun: 0,
      commandsPassed: 0,
      commandsFailed: 0,
      durationMs: 0,
      steps: [],
      plan,
    };
  }

  const repoInfo = deriveRepoFromRawUrl(rawUrl);
  let cwd;
  let tempDir = null;

  if (repoInfo) {
    tempDir = mkdtempSync(join(tmpdir(), "agentmd-"));
    try {
      cloneRepo(repoInfo.repoUrl, repoInfo.ref, tempDir);
      cwd = tempDir;
    } catch (err) {
      rmSync(tempDir, { recursive: true, force: true });
      throw err;
    }
  } else {
    cwd = mkdtempSync(join(tmpdir(), "agentmd-"));
    tempDir = cwd;
  }

  const startTime = Date.now();
  let commandsPassed = 0;
  let commandsFailed = 0;

  try {
    const key = (cmd) => `${String(cmd.line ?? "")}::${cmd.command}`;
    const planByKey = new Map(plan.items.map((item) => [key(item), item]));

    const runnableCommands = commands.filter((cmd) => {
      const item = planByKey.get(key(cmd));
      return item ? item.runnable : true;
    });

    const results = await executeCommands(runnableCommands, {
      cwd,
      timeout: 60000,
      useShell: true,
      permissions,
    });

    let resultIndex = 0;
    const steps = commands.map((cmd) => {
      const item = planByKey.get(key(cmd));
      if (item && !item.runnable) {
        commandsFailed++;
        return {
          command: cmd.command,
          type: cmd.type || "other",
          status: "blocked",
          durationMs: 0,
          reasons: item.reasons,
          reasonDetails: item.reasonDetails,
        };
      }

      const r = results[resultIndex];
      resultIndex++;
      if (!r) {
        commandsFailed++;
        return {
          command: cmd.command,
          type: cmd.type || "other",
          status: "failed",
          durationMs: 0,
          error: "Execution result missing",
        };
      }

      if (r.success) commandsPassed++;
      else commandsFailed++;

      return {
        command: r.command,
        type: r.type || "other",
        status: r.success ? "success" : "failed",
        durationMs: r.durationMs,
        output: r.stdout || undefined,
        error: r.error || r.stderr || undefined,
      };
    });

    const durationMs = Date.now() - startTime;

    return {
      commandsRun: commands.length,
      commandsPassed,
      commandsFailed,
      durationMs,
      steps,
      plan,
    };
  } finally {
    if (tempDir) {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * Check if real execution can run for this URL (GitHub raw or derivable).
 */
export function canRunRealExecution(agentsMdUrl) {
  const rawUrl = toRawUrl(agentsMdUrl);
  return deriveRepoFromRawUrl(rawUrl) !== null;
}
