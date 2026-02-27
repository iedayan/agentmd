import type { ValidationError, ValidationWarning } from "@agentmd-dev/core";

export interface AgentMdDiagnostic {
  code: string;
  message: string;
  line?: number;
  severity: "error" | "warning";
  range?: { start: number; end: number };
}

export interface ValidationPayload {
  score: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}
