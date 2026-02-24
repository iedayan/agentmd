/**
 * Human-in-the-Loop Approval Workflows
 * Require approval before executing certain commands.
 */

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalRequest {
  id: string;
  executionId: string;
  command: string;
  commandType: string;
  requestedBy: string;
  requestedAt: string;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  reason?: string;
  /** Escalation path when confidence is low */
  escalatedTo?: string[];
}

export interface ApprovalConfig {
  /** Commands that always require approval */
  requireApprovalFor?: string[];
  /** Confidence threshold below which to escalate (0-1) */
  escalateThreshold?: number;
  /** Timeout in minutes before auto-reject */
  timeoutMinutes?: number;
}
