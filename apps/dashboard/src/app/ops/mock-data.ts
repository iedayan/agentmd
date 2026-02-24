export type PipelineStatus = "running" | "awaiting_approval" | "failed" | "completed";

export interface Pipeline {
  id: string;
  name: string;
  sourceRef: string;
  trigger: "push" | "schedule" | "manual";
  status: PipelineStatus;
  timestamp: string;
  stages: PipelineStage[];
  agentsMdContent: string;
  policyResults: PolicyResult[];
  approvalGate?: ApprovalGate;
  logLines: LogLine[];
}

export interface PipelineStage {
  id: string;
  name: string;
  status: "passed" | "failed" | "pending" | "running";
  duration?: string;
}

export interface PolicyResult {
  id: string;
  ruleId: string;
  description: string;
  passed: boolean;
  enforcement: "block" | "warn" | "require_approval";
}

export interface ApprovalGate {
  approver: string;
  reason: string;
  policyId: string;
  summary: string;
}

export interface LogLine {
  timestamp: string;
  stage: string;
  message: string;
  stageColor: string;
}

export interface PolicyRule {
  id: string;
  description: string;
  enforcement: "block" | "warn" | "require_approval";
  scope: "global" | "per_agent_tag";
  lastTriggered: string;
}

export interface AuditEntry {
  timestamp: string;
  pipeline: string;
  stage: string;
  actor: string;
  actorType: "human" | "agent";
  action: string;
  result: "pass" | "fail" | "approved" | "rejected";
  details?: string;
}

