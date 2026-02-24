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
}

export interface ExecutionStep {
  id: string;
  command: string;
  type: string;
  status: "pending" | "running" | "success" | "failed";
  durationMs?: number;
  output?: string;
  error?: string;
}
