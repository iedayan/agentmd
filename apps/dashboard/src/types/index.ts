/**
 * Dashboard types
 */

export type ExecutionStatus = "pending" | "running" | "success" | "failed" | "cancelled";

export type TriggerType = "push" | "pull_request" | "schedule" | "manual";

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  healthScore: number;
  lastValidated?: string;
  agentsMdCount: number;
  latestExecutionId?: string;
  latestExecutionStatus?: ExecutionStatus;
}

export interface Execution {
  id: string;
  repositoryId: string;
  repositoryName: string;
  trigger: TriggerType;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  commandsRun: number;
  commandsPassed: number;
  commandsFailed: number;
  logs?: string;
  /** "real" = commands run in worker; "mock" = simulated (default when AGENTMD_REAL_EXECUTION not set) */
  executionMode?: "real" | "mock";
  /** Source AGENTS.md URL that this execution ran (if known). */
  agentsMdUrl?: string;
  /** Optional preflight plan from @agentmd/core (useful for UI explainability/debug). */
  preflightPlan?: unknown;
  /** Normalized blocked commands (stable schema, prefer over preflightPlan for UI). */
  blockedCommands?: Array<{
    command: string;
    type: string;
    section: string;
    line?: number;
    codes: string[];
    messages: string[];
    requiresShell: boolean;
    requiresApproval: boolean;
  }>;
  /** Preflight summary counts (when blockedCommands present). */
  preflightRunnableCount?: number;
  preflightBlockedCount?: number;
}

export interface ExecutionStep {
  id: string;
  command: string;
  type: string;
  status: "pending" | "running" | "success" | "failed" | "blocked";
  /** Optional structured reasons explaining why a step failed/was blocked. */
  reasons?: string[];
  /** Optional structured reason details (stable codes for UI grouping). */
  reasonDetails?: Array<{ code: string; message: string }>;
  durationMs?: number;
  output?: string;
  error?: string;
}

export * from "./enterprise";
