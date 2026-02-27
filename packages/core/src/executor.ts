/**
 * Execution Environment for AGENTS.md Commands
 * Sandboxed runners with permission boundaries.
 */

import { spawn } from "child_process";
import { request } from "https";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { Readable } from "stream";
import type { ExtractedCommand, CommandType } from "./types.js";
import type { AgentPermissions } from "./schema.js";
import type { PolicyConfig } from "./enterprise/policy.js";
import { getApprovalRequirement } from "./enterprise/policy.js";
import { checkCommandIntent } from "./guardrails.js";

/**
 * Handle for a running process, allowing for stream monitoring and control.
 */
export interface ExecutionProcess {
  stdout?: Readable;
  stderr?: Readable;
  kill(signal?: string): void;
  on(event: "close", listener: (code: number | null, signal: string | null) => void): void;
  on(event: "error", listener: (err: Error) => void): void;
}

/**
 * Abstract provider for executing commands.
 * Allows switching between Local, Container (Docker), or Remote execution.
 */
export interface ExecutionProvider {
  name: string;
  spawn(
    bin: string,
    args: string[],
    options: {
      cwd: string;
      env?: Record<string, string>;
      shell?: boolean;
    }
  ): Promise<ExecutionProcess>;
}

/**
 * Default provider using local child_process.spawn.
 */
export class LocalExecutionProvider implements ExecutionProvider {
  name = "local";
  async spawn(
    bin: string,
    args: string[],
    options: { cwd: string; env?: Record<string, string>; shell?: boolean }
  ): Promise<ExecutionProcess> {
    return spawn(bin, args, {
      cwd: options.cwd,
      shell: options.shell,
      env: { ...process.env, ...options.env },
    }) as unknown as ExecutionProcess;
  }
}

/** Dangerous patterns that should never be executed */
const DANGEROUS_PATTERNS = [
  // Destructive file operations
  /\brm\s+-rf\s+\//,
  /\brm\s+-rf\s+\$\{/,
  /\brm\s+-rf\s+~\//,
  /\brm\s+-rf\s+\/\s*$/,
  /\brm\s+-rf\s+\*/,  // rm -rf *
  // Fork bomb
  /\b:\(\)\s*\{\s*:\s*\|/,
  // Permission changes
  /\bchmod\s+-R\s+777/,
  /\bchown\s+-R\s+.*\s+\//,
  // Pipe to shell
  /\bcurl\s+[^|]*\|\s*sh\b/,
  /\bwget\s+[^|]*\|\s*sh\b/,
  /\bcurl\s+[^|]*\|\s*bash\b/,
  /\bwget\s+[^|]*\|\s*bash\b/,
  /\bcurl\s+[^|]*\|\s*zsh\b/,
  // Disk operations
  /\bmkfs\./,
  /\bdd\s+if=.*of=\/dev/,
  /\bformat\s+/i,
  // Arbitrary code execution
  /\beval\s+['"`$]/,
  /\bbase64\s+-d\s+.*\|\s*sh\b/,
  /\bbase64\s+-d\s+.*\|\s*bash\b/,
  /\bbase64\s+-decode\s+.*\|\s*sh\b/,
  /\$\s*\(\s*curl\b/,  // $(curl ...) command substitution
  /\$\s*\(\s*wget\b/,
  // Network / reverse shells
  /\bnc\s+.*\s+-e\s+/,
  /\bncat\s+.*\s+--exec\s+/,
  /\bbash\s+-i\s+>/,
  /\bpython\s+.*\s+-c\s+.*socket\.connect/i,
  // Overwrite system files
  /\b>\s*\/etc\//,
  /\b>\s*\/usr\//,
  // Terraform destroy without confirmation
  /\bterraform\s+destroy\b(?!.*-auto-approve)/,
  // Windows: format, del system
  /\bformat\s+[a-z]:\s*\/y/i,
  /\bdel\s+\/[sf]\s+[a-z]:\\windows/i,
  // Destructive cloud/infra
  /\baws\s+s3\s+rb\s+/i,
  /\baws\s+s3\s+rm\b.*--recursive\b/i,
  /\bgcloud\s+.*\s+delete\s+--force\b/i,
  // Privilege escalation (IBM agent security: privilege compromise)
  /\bsudo\s+su\b/,
  /\bsudo\s+-i\b/,
  /\bsu\s+-\s*$/,
  /\bsu\s+root\b/,
];

export interface ExecutionResult {
  command: string;
  type: CommandType;
  success: boolean;
  exitCode: number | null;
  durationMs: number;
  stdout: string;
  stderr: string;
  error?: string;
  /** True if this was a dry run (no actual execution) */
  dryRun?: boolean;
}

export interface ExecutorOptions {
  /** Working directory */
  cwd?: string;
  /** Timeout in ms (default: 60000, or 30000 when sandbox) */
  timeout?: number;
  /** Permission boundaries from AGENTS.md frontmatter */
  permissions?: AgentPermissions;
  /** Policy config for approval requirements (enterprise) */
  policyConfig?: PolicyConfig;
  /** Commands pre-approved for execution (skip policy approval check) */
  approvedForExecution?: Set<string> | string[];
  /** Environment variables */
  env?: Record<string, string>;
  /** If true, validate only — do not execute (dry run) */
  dryRun?: boolean;
  /** If true, run in a temp directory (isolated, no repo access) */
  sandbox?: boolean;
  /** If true, execute through shell (less safe, required for shell operators/pipelines) */
  useShell?: boolean;
  /** Execution provider (local, docker, etc.) */
  provider?: ExecutionProvider;
  /** Webhook URL for failure notifications */
  webhookUrl?: string;
  /** Secret for webhook signing (optional) */
  webhookSecret?: string;
}

export type CommandBlockReasonCode =
  | "UNSAFE"
  | "PERMISSION_DENIED"
  | "APPROVAL_REQUIRED"
  | "REQUIRES_SHELL";

export interface CommandBlockReason {
  code: CommandBlockReasonCode;
  message: string;
}

export interface CommandExecutionPlanItem {
  command: string;
  type: CommandType;
  section: string;
  line: number;
  runnable: boolean;
  /** Human readable reasons (kept for backwards compatibility). */
  reasons: string[];
  /** Structured reasons suitable for UI rendering. */
  reasonDetails?: CommandBlockReason[];
  requiresApproval: boolean;
  requiresShell: boolean;
}

export interface CommandExecutionPlan {
  items: CommandExecutionPlanItem[];
  runnableCount: number;
  blockedCount: number;
}

/**
 * Check if a command is safe to execute based on dangerous patterns and intent.
 */
export async function isCommandSafe(command: string): Promise<{ safe: boolean; reason?: string }> {
  // 1. Static pattern check (fast)
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(command)) {
      return { safe: false, reason: `Command matches dangerous pattern: ${pattern}` };
    }
  }

  // 2. Intent-based guardrails (semantic)
  const intentCheck = await checkCommandIntent(command);
  if (!intentCheck.safe) {
    return {
      safe: false,
      reason: `Guardrail violation (confidence ${Math.round(intentCheck.confidence * 100)}%): ${intentCheck.reason}`
    };
  }

  return { safe: true };
}

/**
 * Check if command is allowed by permissions.
 */
export function isCommandAllowed(
  command: string,
  permissions?: AgentPermissions
): { allowed: boolean; reason?: string } {
  if (!permissions?.shell) return { allowed: true };

  const { allow, deny, default: def } = permissions.shell;

  if (deny?.some((d) => command.includes(d))) {
    return { allowed: false, reason: `Command denied by shell.deny` };
  }

  if (allow && allow.length > 0) {
    const allowed = allow.some((a) => {
      if (a.includes("*")) {
        const re = new RegExp(a.replace(/\*/g, ".*"));
        return re.test(command);
      }
      return command.startsWith(a) || command.includes(a);
    });
    if (!allowed) {
      return { allowed: false, reason: `Command not in shell.allow list` };
    }
  }

  if (def === "deny" && (!allow || allow.length === 0)) {
    return { allowed: false, reason: `shell.default is deny and no allow list` };
  }

  return { allowed: true };
}

export function requiresShellFeatures(command: string): boolean {
  return usesShellOperators(command);
}

/**
 * Preflight plan for commands without executing them.
 * Useful for UX: explain what will run and why anything is blocked.
 */
export async function planCommandExecutions(
  commands: ExtractedCommand[],
  options: ExecutorOptions = {}
): Promise<CommandExecutionPlan> {
  const { permissions, useShell = false, policyConfig, approvedForExecution } = options;
  const items: CommandExecutionPlanItem[] = await Promise.all(
    commands.map(async (cmd) => {
      const reasons: string[] = [];
      const reasonDetails: CommandBlockReason[] = [];
      const addReason = (code: CommandBlockReasonCode, message: string) => {
        reasons.push(message);
        reasonDetails.push({ code, message });
      };

      const safe = await isCommandSafe(cmd.command);
      if (!safe.safe) {
        addReason("UNSAFE", safe.reason ?? "Blocked by safety policy");
      }

      const allowed = isCommandAllowed(cmd.command, permissions);
      if (!allowed.allowed) {
        addReason("PERMISSION_DENIED", allowed.reason ?? "Blocked by permission policy");
      }

      let requiresApproval = false;
      if (policyConfig) {
        const { requirement, rule } = getApprovalRequirement(cmd.command, policyConfig);
        const isApproved =
          approvedForExecution &&
          (approvedForExecution instanceof Set
            ? approvedForExecution.has(cmd.command)
            : approvedForExecution.includes(cmd.command));
        if (requirement === "always" && !isApproved) {
          requiresApproval = true;
          addReason(
            "APPROVAL_REQUIRED",
            rule
              ? `Approval required by policy rule "${rule.name}"`
              : "Approval required by policy"
          );
        }
      }

      const requiresShell = requiresShellFeatures(cmd.command);
      if (requiresShell && !useShell) {
        addReason("REQUIRES_SHELL", "Requires shell features (pipes/redirection/operators)");
      }

      return {
        command: cmd.command,
        type: cmd.type,
        section: cmd.section,
        line: cmd.line,
        runnable: reasons.length === 0,
        reasons,
        reasonDetails: reasonDetails.length > 0 ? reasonDetails : undefined,
        requiresApproval,
        requiresShell,
      };
    })
  );

  const runnableCount = items.filter((item) => item.runnable).length;
  return {
    items,
    runnableCount,
    blockedCount: items.length - runnableCount,
  };
}

/**
 * Execute a single command.
 */
export function executeCommand(
  cmd: ExtractedCommand,
  options: ExecutorOptions = {}
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    (async () => {
      const start = Date.now();
    const { permissions, dryRun = false, sandbox = false, useShell = false } = options;
    const timeout = options.timeout ?? (sandbox ? 30000 : 60000);
    let cwd = options.cwd ?? process.cwd();
    let tempDir: string | null = null;

    if (sandbox) {
      try {
        tempDir = mkdtempSync(join(tmpdir(), "agentmd-"));
        cwd = tempDir;
      } catch {
        resolve({
          command: cmd.command,
          type: cmd.type,
          success: false,
          exitCode: null,
          durationMs: 0,
          stdout: "",
          stderr: "Failed to create sandbox directory",
          error: "Sandbox init failed",
        });
        return;
      }
    }

    const safe = await isCommandSafe(cmd.command);
    if (!safe.safe) {
      resolve({
        command: cmd.command,
        type: cmd.type,
        success: false,
        exitCode: null,
        durationMs: 0,
        stdout: "",
        stderr: safe.reason ?? "Command blocked",
        error: safe.reason,
      });
      return;
    }

    const { policyConfig, approvedForExecution } = options;
    if (policyConfig) {
      const { requirement, rule } = getApprovalRequirement(cmd.command, policyConfig);
      const isApproved =
        approvedForExecution &&
        (approvedForExecution instanceof Set
          ? approvedForExecution.has(cmd.command)
          : approvedForExecution.includes(cmd.command));
      if (requirement === "always" && !isApproved) {
        resolve({
          command: cmd.command,
          type: cmd.type,
          success: false,
          exitCode: null,
          durationMs: 0,
          stdout: "",
          stderr: rule
            ? `Approval required by policy rule "${rule.name}". Pass approvedForExecution to proceed.`
            : "Approval required by policy.",
          error: "Approval required",
        });
        return;
      }
    }

    const allowed = isCommandAllowed(cmd.command, permissions);
    if (!allowed.allowed) {
      resolve({
        command: cmd.command,
        type: cmd.type,
        success: false,
        exitCode: null,
        durationMs: 0,
        stdout: "",
        stderr: allowed.reason ?? "Permission denied",
        error: allowed.reason,
      });
      return;
    }

    if (dryRun) {
      resolve({
        command: cmd.command,
        type: cmd.type,
        success: true,
        exitCode: 0,
        durationMs: 0,
        stdout: "[dry run] Would execute",
        stderr: "",
        dryRun: true,
      });
      return;
    }

    if (!useShell && requiresShellFeatures(cmd.command)) {
      resolve({
        command: cmd.command,
        type: cmd.type,
        success: false,
        exitCode: null,
        durationMs: 0,
        stdout: "",
        stderr:
          "Command contains shell operators. Split the command or run with useShell=true.",
        error:
          "Command requires shell features and was blocked in safe executor mode",
      });
      return;
    }

    const parsed = parseCommand(cmd.command, useShell);
    if (!parsed.ok) {
      resolve({
        command: cmd.command,
        type: cmd.type,
        success: false,
        exitCode: null,
        durationMs: 0,
        stdout: "",
        stderr: parsed.error,
        error: parsed.error,
      });
      return;
    }

    const provider = options.provider ?? new LocalExecutionProvider();

    provider.spawn(parsed.bin, parsed.args, {
      cwd,
      shell: useShell,
      env: options.env,
    }).then((proc) => {
      let stdout = "";
      let stderr = "";

      proc.stdout?.on("data", (d: Buffer | string) => {
        stdout += d.toString();
      });
      proc.stderr?.on("data", (d: Buffer | string) => {
        stderr += d.toString();
      });

      const killTimer = timeout > 0 ? setTimeout(() => proc.kill("SIGTERM"), timeout) : null;

      proc.on("close", (code: number | null, signal: string | null) => {
        if (killTimer) clearTimeout(killTimer);
        if (tempDir) try { rmSync(tempDir, { recursive: true }); } catch { /* ignore */ }
        const durationMs = Date.now() - start;
        resolve({
          command: cmd.command,
          type: cmd.type,
          success: code === 0,
          exitCode: code,
          durationMs,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          error: code !== 0 ? `Exit ${code}${signal ? ` (${signal})` : ""}` : undefined,
        });
      });

      proc.on("error", (err: Error) => {
        if (killTimer) clearTimeout(killTimer);
        if (tempDir) try { rmSync(tempDir, { recursive: true }); } catch { /* ignore */ }
        resolve({
          command: cmd.command,
          type: cmd.type,
          success: false,
          exitCode: null,
          durationMs: Date.now() - start,
          stdout: "",
          stderr: err.message,
          error: err.message,
        });
      });
    }).catch((err) => {
      if (tempDir) try { rmSync(tempDir, { recursive: true }); } catch { /* ignore */ }
      resolve({
        command: cmd.command,
        type: cmd.type,
        success: false,
        exitCode: null,
        durationMs: Date.now() - start,
        stdout: "",
        stderr: err.message,
        error: "Provider failed to spawn process",
      });
    });
    })();
  });
}

function parseCommand(
  command: string,
  useShell: boolean
):
  | { ok: true; bin: string; args: string[] }
  | { ok: false; error: string } {
  const trimmed = command.trim();
  if (!trimmed) {
    return { ok: false, error: "Command is empty" };
  }
  if (useShell) {
    return { ok: true, bin: trimmed, args: [] };
  }

  try {
    const argv = tokenizeCommand(trimmed);
    if (argv.length === 0) return { ok: false, error: "Command is empty" };
    return { ok: true, bin: argv[0], args: argv.slice(1) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to parse command",
    };
  }
}

function usesShellOperators(command: string): boolean {
  return (
    /(^|[^\\])[;&|]/.test(command) ||
    /(^|[^\\])[<>]/.test(command) ||
    /\$\(/.test(command) ||
    /`[^`]*`/.test(command)
  );
}

function tokenizeCommand(command: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (let i = 0; i < command.length; i++) {
    const ch = command[i];

    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      continue;
    }

    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }

    if (/\s/.test(ch)) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += ch;
  }

  if (escaped) {
    current += "\\";
  }
  if (quote) {
    throw new Error("Unterminated quoted string in command");
  }
  if (current.length > 0) {
    tokens.push(current);
  }
  return tokens;
}

/**
 * Execute multiple commands, optionally filtered by type.
 */
export async function executeCommands(
  commands: ExtractedCommand[],
  options: ExecutorOptions & { types?: CommandType[] } = {}
): Promise<ExecutionResult[]> {
  const { types, ...execOpts } = options;
  const toRun = types
    ? commands.filter((c) => types.includes(c.type))
    : commands;

  const results: ExecutionResult[] = [];
  for (const cmd of toRun) {
    const result = await executeCommand(cmd, execOpts);
    results.push(result);
    if (!result.success && execOpts.webhookUrl) {
      await notifyWebhook(execOpts.webhookUrl, {
        event: "execution_failed",
        command: cmd.command,
        type: cmd.type,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
      }, execOpts.webhookSecret);
    }
  }
  return results;
}

/**
 * Execute multiple commands in parallel. Use when commands are independent
 * (e.g., different packages, no shared state). Faster than sequential execution.
 */
export async function executeCommandsParallel(
  commands: ExtractedCommand[],
  options: ExecutorOptions & { types?: CommandType[] } = {}
): Promise<ExecutionResult[]> {
  const { types, ...execOpts } = options;
  const toRun = types
    ? commands.filter((c) => types.includes(c.type))
    : commands;

  const promises = toRun.map(async (cmd) => {
    const result = await executeCommand(cmd, execOpts);
    if (!result.success && execOpts.webhookUrl) {
      await notifyWebhook(execOpts.webhookUrl, {
        event: "execution_failed",
        command: cmd.command,
        type: cmd.type,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
      }, execOpts.webhookSecret);
    }
    return result;
  });
  return Promise.all(promises);
}

/**
 * Send a notification to a webhook.
 */
async function notifyWebhook(url: string, payload: any, secret?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        ...(secret ? { "X-AgentMD-Secret": secret } : {}),
      },
    };

    const req = request(url, options, (res) => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
        resolve();
      } else {
        reject(new Error(`Webhook failed with status ${res.statusCode}`));
      }
    });

    req.on("error", (e) => reject(e));
    req.write(data);
    req.end();
  });
}
