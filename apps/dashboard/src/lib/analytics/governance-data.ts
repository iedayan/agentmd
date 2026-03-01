import { BUILTIN_ROLES } from '@agentmd-dev/core';
import { join } from 'path';
import { addAuditLog, getRepositoryById, listRepositories } from '@/lib/data/dashboard-data';
import { sendWorkflowNotification } from '@/lib/integrations/external-notifier';
import { readJsonFile, writeJsonFile } from '@/lib/data/server-persistence';
import type { TriggerType } from '@/types';

export type CheckStatus = 'success' | 'failed' | 'pending' | 'missing';

export type GitHubGate = {
  repositoryId: string;
  repositoryName: string;
  requiredChecks: string[];
  checks: Record<string, CheckStatus>;
  updatedAt: string;
};

export type GitHubGateDecision = {
  pass: boolean;
  missingChecks: string[];
  failedChecks: string[];
  pendingChecks: string[];
  blockedReasons: string[];
};

const OUTPUT_CONTRACT_CHECK = 'agentmd/output-contract';
const DEFAULT_REQUIRED_CHECKS = ['agentmd/parse', 'agentmd/policy-gate', OUTPUT_CONTRACT_CHECK];

function ensureOutputContractRequiredCheck(gate: GitHubGate): GitHubGate {
  if (!gate.requiredChecks.includes(OUTPUT_CONTRACT_CHECK)) {
    gate.requiredChecks.push(OUTPUT_CONTRACT_CHECK);
  }
  if (!gate.checks[OUTPUT_CONTRACT_CHECK]) {
    gate.checks[OUTPUT_CONTRACT_CHECK] = 'pending';
  }
  return gate;
}

function normalizeGitHubGates(): boolean {
  let changed = false;
  for (const gate of Array.from(githubGates.values())) {
    const hadRequiredCheck = gate.requiredChecks.includes(OUTPUT_CONTRACT_CHECK);
    const hadStatus = gate.checks[OUTPUT_CONTRACT_CHECK] !== undefined;
    ensureOutputContractRequiredCheck(gate);
    if (!hadRequiredCheck || !hadStatus) {
      gate.updatedAt = new Date().toISOString();
      changed = true;
    }
  }
  return changed;
}

export type PolicyRule = {
  id: string;
  name: string;
  enabled: boolean;
  requireApprovalForPatterns: string[];
  blockPatterns: string[];
  enforcePrGate: boolean;
};

export type ApprovalRequest = {
  id: string;
  repositoryId: string;
  repositoryName: string;
  requestedBy: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
};

export type WorkflowNotification = {
  id: string;
  type: 'approval.requested' | 'approval.approved' | 'approval.rejected' | 'execution.blocked';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  ownedRepositoryIds: string[];
};

export type SsoConfig = {
  enabled: boolean;
  provider: 'okta' | 'azure-ad' | 'google-workspace' | 'custom';
  entityId: string;
  ssoUrl: string;
  enforceSso: boolean;
  updatedAt: string;
};

export type ComplianceArtifact = {
  id: string;
  framework: 'SOC2' | 'ISO27001' | 'HIPAA';
  name: string;
  status: 'ready' | 'in_progress';
  lastGeneratedAt: string;
};

type PersistedGovernanceState = {
  githubGates: Array<[string, GitHubGate]>;
  policyRules: PolicyRule[];
  approvalRequests: ApprovalRequest[];
  notifications: WorkflowNotification[];
  nextApprovalId: number;
  nextNotificationId: number;
  teamMembers: TeamMember[];
  ssoConfig: SsoConfig;
  governanceMetrics: {
    blockedByStatusGate: number;
    blockedByPolicy: number;
    approvalRequired: number;
    webhookReceived: number;
    webhookProcessed: number;
    webhookSignatureFailures: number;
    webhookErrors: number;
    prCommentsPosted: number;
    slackApprovalActions: number;
    lastWebhookAt?: string;
    lastWebhookEvent?: string;
    lastWebhookError?: string;
    lastGitHubSyncAt?: string;
    lastGitHubSync?: {
      total: number;
      added: number;
      skipped: number;
      gateUpdated: number;
      backfilledRepositories: Array<{ id: string; name: string }>;
    };
    contractValidationEvents?: Array<{
      at: string;
      contractType: string;
      status: 'success' | 'failed' | 'pending';
    }>;
  };
};

const GOVERNANCE_STATE_PATH = join(process.cwd(), '.data/governance-state.json');

const githubGates = new Map<string, GitHubGate>([
  [
    '1',
    {
      repositoryId: '1',
      repositoryName: 'agentmd/agentmd',
      requiredChecks: [
        'agentmd/parse',
        'agentmd/policy-gate',
        OUTPUT_CONTRACT_CHECK,
        'agentmd/execution-ready',
      ],
      checks: {
        'agentmd/parse': 'success',
        'agentmd/policy-gate': 'success',
        [OUTPUT_CONTRACT_CHECK]: 'pending',
        'agentmd/execution-ready': 'pending',
      },
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    '2',
    {
      repositoryId: '2',
      repositoryName: 'user/my-app',
      requiredChecks: ['agentmd/parse', 'agentmd/policy-gate', OUTPUT_CONTRACT_CHECK],
      checks: {
        'agentmd/parse': 'failed',
        'agentmd/policy-gate': 'success',
        [OUTPUT_CONTRACT_CHECK]: 'pending',
      },
      updatedAt: new Date().toISOString(),
    },
  ],
]);

let policyRules: PolicyRule[] = [
  {
    id: 'policy-1',
    name: 'Require approval for production-impact commands',
    enabled: true,
    requireApprovalForPatterns: ['deploy', 'release', 'migrate', 'terraform apply'],
    blockPatterns: [],
    enforcePrGate: true,
  },
  {
    id: 'policy-2',
    name: 'Block destructive commands',
    enabled: true,
    requireApprovalForPatterns: [],
    blockPatterns: ['rm -rf', 'drop database', 'truncate table'],
    enforcePrGate: false,
  },
];

let approvalRequests: ApprovalRequest[] = [];
let notifications: WorkflowNotification[] = [];
let nextApprovalId = 100;
let nextNotificationId = 100;
let governanceMetrics = {
  blockedByStatusGate: 0,
  blockedByPolicy: 0,
  approvalRequired: 0,
  webhookReceived: 0,
  webhookProcessed: 0,
  webhookSignatureFailures: 0,
  webhookErrors: 0,
  prCommentsPosted: 0,
  slackApprovalActions: 0,
  lastWebhookAt: undefined as string | undefined,
  lastWebhookEvent: undefined as string | undefined,
  lastWebhookError: undefined as string | undefined,
  lastGitHubSyncAt: undefined as string | undefined,
  lastGitHubSync: undefined as
    | {
        total: number;
        added: number;
        skipped: number;
        gateUpdated: number;
        backfilledRepositories: Array<{ id: string; name: string }>;
      }
    | undefined,
  contractValidationEvents: [] as Array<{
    at: string;
    contractType: string;
    status: 'success' | 'failed' | 'pending';
  }>,
};

let teamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Alex Rivera',
    email: 'alex@agentmd.online',
    roleId: 'admin',
    ownedRepositoryIds: ['1'],
  },
  {
    id: 'tm-2',
    name: 'Taylor Kim',
    email: 'taylor@agentmd.online',
    roleId: 'approver',
    ownedRepositoryIds: ['2', '3'],
  },
  {
    id: 'tm-3',
    name: 'Jordan Lee',
    email: 'jordan@agentmd.online',
    roleId: 'developer',
    ownedRepositoryIds: [],
  },
];

let ssoConfig: SsoConfig = {
  enabled: false,
  provider: 'okta',
  entityId: '',
  ssoUrl: '',
  enforceSso: false,
  updatedAt: new Date().toISOString(),
};

const complianceArtifacts: ComplianceArtifact[] = [
  {
    id: 'cmp-1',
    framework: 'SOC2',
    name: 'Audit Trail Export',
    status: 'ready',
    lastGeneratedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'cmp-2',
    framework: 'ISO27001',
    name: 'Policy Snapshot',
    status: 'ready',
    lastGeneratedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'cmp-3',
    framework: 'HIPAA',
    name: 'Access Log Bundle',
    status: 'in_progress',
    lastGeneratedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
];

function serializeState(): PersistedGovernanceState {
  return {
    githubGates: Array.from(githubGates.entries()),
    policyRules,
    approvalRequests,
    notifications,
    nextApprovalId,
    nextNotificationId,
    teamMembers,
    ssoConfig,
    governanceMetrics,
  };
}

function persistState() {
  writeJsonFile(GOVERNANCE_STATE_PATH, serializeState());
}

function loadState() {
  const persisted = readJsonFile<PersistedGovernanceState>(GOVERNANCE_STATE_PATH);
  if (!persisted) {
    persistState();
    return;
  }
  githubGates.clear();
  for (const [id, gate] of persisted.githubGates ?? []) {
    githubGates.set(id, gate);
  }
  if (Array.isArray(persisted.policyRules)) policyRules = persisted.policyRules;
  if (Array.isArray(persisted.approvalRequests)) approvalRequests = persisted.approvalRequests;
  if (Array.isArray(persisted.notifications)) notifications = persisted.notifications;
  if (typeof persisted.nextApprovalId === 'number') nextApprovalId = persisted.nextApprovalId;
  if (typeof persisted.nextNotificationId === 'number') {
    nextNotificationId = persisted.nextNotificationId;
  }
  if (Array.isArray(persisted.teamMembers)) teamMembers = persisted.teamMembers;
  if (persisted.ssoConfig) ssoConfig = persisted.ssoConfig;
  if (persisted.governanceMetrics) {
    governanceMetrics = {
      ...governanceMetrics,
      ...persisted.governanceMetrics,
      lastWebhookAt: persisted.governanceMetrics.lastWebhookAt ?? undefined,
      lastWebhookEvent: persisted.governanceMetrics.lastWebhookEvent ?? undefined,
      lastWebhookError: persisted.governanceMetrics.lastWebhookError ?? undefined,
      contractValidationEvents: Array.isArray(persisted.governanceMetrics.contractValidationEvents)
        ? persisted.governanceMetrics.contractValidationEvents
        : governanceMetrics.contractValidationEvents,
    };
  }
  if (normalizeGitHubGates()) {
    persistState();
  }
}

loadState();

function notify(
  type: WorkflowNotification['type'],
  title: string,
  message: string,
): WorkflowNotification {
  const created: WorkflowNotification = {
    id: `ntf-${++nextNotificationId}`,
    type,
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };
  notifications.unshift(created);
  void sendWorkflowNotification(`[AgentMD] ${title}: ${message}`);
  persistState();
  return created;
}

export function listGitHubGates(): GitHubGate[] {
  const repositories = listRepositories();
  for (const repository of repositories) {
    if (!githubGates.has(repository.id)) {
      githubGates.set(repository.id, {
        repositoryId: repository.id,
        repositoryName: repository.fullName,
        requiredChecks: [...DEFAULT_REQUIRED_CHECKS],
        checks: {
          'agentmd/parse': 'pending',
          'agentmd/policy-gate': 'pending',
          [OUTPUT_CONTRACT_CHECK]: 'pending',
        },
        updatedAt: new Date().toISOString(),
      });
      persistState();
    }
  }
  let changed = false;
  const values = Array.from(githubGates.values());
  if (normalizeGitHubGates()) changed = true;
  if (changed) persistState();
  return values;
}

export function setGitHubCheckStatus(
  repositoryId: string,
  checkName: string,
  status: Exclude<CheckStatus, 'missing'>,
  repositoryName?: string,
) {
  const repository = repositoryName
    ? { id: repositoryId, fullName: repositoryName }
    : getRepositoryById(repositoryId);
  if (!repository) return null;
  const gate = githubGates.get(repositoryId) ?? {
    repositoryId,
    repositoryName: repository.fullName,
    requiredChecks: [...DEFAULT_REQUIRED_CHECKS],
    checks: {},
    updatedAt: new Date().toISOString(),
  };
  ensureOutputContractRequiredCheck(gate);
  if (!gate.requiredChecks.includes(checkName)) gate.requiredChecks.push(checkName);
  gate.checks[checkName] = status;
  gate.updatedAt = new Date().toISOString();
  githubGates.set(repositoryId, gate);
  persistState();
  return gate;
}

export function setGitHubRequiredChecks(repositoryId: string, requiredChecks: string[]) {
  const repository = getRepositoryById(repositoryId);
  if (!repository) return null;
  const sanitized = Array.from(
    new Set(requiredChecks.map((check) => check.trim()).filter((check) => check.length > 0)),
  );
  if (!sanitized.includes(OUTPUT_CONTRACT_CHECK)) {
    sanitized.push(OUTPUT_CONTRACT_CHECK);
  }
  if (sanitized.length === 0) return null;
  const gate = githubGates.get(repositoryId) ?? {
    repositoryId,
    repositoryName: repository.fullName,
    requiredChecks: [...DEFAULT_REQUIRED_CHECKS],
    checks: {},
    updatedAt: new Date().toISOString(),
  };
  ensureOutputContractRequiredCheck(gate);
  gate.requiredChecks = sanitized;
  for (const check of sanitized) {
    if (!gate.checks[check]) gate.checks[check] = 'pending';
  }
  gate.updatedAt = new Date().toISOString();
  githubGates.set(repositoryId, gate);
  persistState();
  return gate;
}

export function evaluateGitHubGate(gate: GitHubGate): GitHubGateDecision {
  const missingChecks: string[] = [];
  const failedChecks: string[] = [];
  const pendingChecks: string[] = [];
  const blockedReasons: string[] = [];

  for (const check of gate.requiredChecks) {
    const status = gate.checks[check] ?? 'missing';
    if (status === 'missing') {
      missingChecks.push(check);
      blockedReasons.push(`Required check "${check}" is missing.`);
      continue;
    }
    if (status === 'failed') {
      failedChecks.push(check);
      blockedReasons.push(`Required check "${check}" failed.`);
      continue;
    }
    if (status === 'pending') {
      pendingChecks.push(check);
      blockedReasons.push(`Required check "${check}" is pending.`);
    }
  }

  return {
    pass: missingChecks.length === 0 && failedChecks.length === 0 && pendingChecks.length === 0,
    missingChecks,
    failedChecks,
    pendingChecks,
    blockedReasons,
  };
}

export function listPolicyRules(): PolicyRule[] {
  return policyRules.slice();
}

export function replacePolicyRules(next: PolicyRule[]) {
  policyRules = next.slice();
  addAuditLog({
    userId: 'policy_admin',
    action: 'policy.updated',
    resourceType: 'policy',
    resourceId: 'policy-bundle',
    details: { count: next.length },
  });
  persistState();
}

export function listApprovalRequests(): ApprovalRequest[] {
  return approvalRequests.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function decideApprovalRequest(
  approvalId: string,
  decision: 'approved' | 'rejected',
  decidedBy: string,
): ApprovalRequest | null {
  const approval = approvalRequests.find((item) => item.id === approvalId);
  if (!approval || approval.status !== 'pending') return null;
  approval.status = decision;
  approval.decidedAt = new Date().toISOString();
  approval.decidedBy = decidedBy;
  notify(
    decision === 'approved' ? 'approval.approved' : 'approval.rejected',
    `Approval ${decision}`,
    `${approval.repositoryName}: ${approval.reason}`,
  );
  addAuditLog({
    userId: decidedBy,
    action: `approval.${decision}`,
    resourceType: 'approval',
    resourceId: approval.id,
    details: { repositoryId: approval.repositoryId },
  });
  persistState();
  return approval;
}

export function recordSlackApprovalAction() {
  governanceMetrics.slackApprovalActions += 1;
  persistState();
}

export function recordGitHubPrCommentPosted() {
  governanceMetrics.prCommentsPosted += 1;
  persistState();
}

export function recordGitHubSyncSummary(input: {
  total: number;
  added: number;
  skipped: number;
  gateUpdated: number;
  backfilledRepositories: Array<{ id: string; name: string }>;
}) {
  governanceMetrics.lastGitHubSyncAt = new Date().toISOString();
  governanceMetrics.lastGitHubSync = {
    total: input.total,
    added: input.added,
    skipped: input.skipped,
    gateUpdated: input.gateUpdated,
    backfilledRepositories: input.backfilledRepositories.slice(0, 200),
  };
  persistState();
}

export function recordContractValidationResult(input: {
  contractType?: string;
  status: 'success' | 'failed' | 'pending';
}) {
  const contractType = input.contractType?.trim() || 'unspecified';
  governanceMetrics.contractValidationEvents.push({
    at: new Date().toISOString(),
    contractType,
    status: input.status,
  });
  if (governanceMetrics.contractValidationEvents.length > 1000) {
    governanceMetrics.contractValidationEvents =
      governanceMetrics.contractValidationEvents.slice(-1000);
  }
  persistState();
}

export function getContractValidationAnalytics(days = 30): {
  byType: Array<{
    contractType: string;
    total: number;
    success: number;
    failed: number;
    pending: number;
    passRate: number;
  }>;
  trend: Array<{
    date: string;
    success: number;
    failed: number;
    pending: number;
  }>;
  totals: {
    total: number;
    success: number;
    failed: number;
    pending: number;
    passRate: number;
  };
} {
  const cutoff = Date.now() - Math.max(1, days) * 24 * 60 * 60 * 1000;
  const events = governanceMetrics.contractValidationEvents.filter(
    (event) => Date.parse(event.at) >= cutoff,
  );
  const byTypeMap = new Map<
    string,
    { total: number; success: number; failed: number; pending: number }
  >();
  const trendMap = new Map<string, { success: number; failed: number; pending: number }>();

  let success = 0;
  let failed = 0;
  let pending = 0;

  for (const event of events) {
    const byType = byTypeMap.get(event.contractType) ?? {
      total: 0,
      success: 0,
      failed: 0,
      pending: 0,
    };
    byType.total += 1;
    byType[event.status] += 1;
    byTypeMap.set(event.contractType, byType);

    const day = event.at.slice(0, 10);
    const trend = trendMap.get(day) ?? { success: 0, failed: 0, pending: 0 };
    trend[event.status] += 1;
    trendMap.set(day, trend);

    if (event.status === 'success') success += 1;
    if (event.status === 'failed') failed += 1;
    if (event.status === 'pending') pending += 1;
  }

  const byType = Array.from(byTypeMap.entries())
    .map(([contractType, value]) => ({
      contractType,
      total: value.total,
      success: value.success,
      failed: value.failed,
      pending: value.pending,
      passRate: value.total > 0 ? Math.round((value.success / value.total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const trend = Array.from(trendMap.entries())
    .map(([date, value]) => ({
      date,
      success: value.success,
      failed: value.failed,
      pending: value.pending,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const total = success + failed + pending;
  return {
    byType,
    trend,
    totals: {
      total,
      success,
      failed,
      pending,
      passRate: total > 0 ? Math.round((success / total) * 1000) / 10 : 0,
    },
  };
}

function createApprovalRequest(input: {
  repositoryId: string;
  repositoryName: string;
  requestedBy: string;
  reason: string;
}): ApprovalRequest {
  const existing = approvalRequests.find(
    (item) =>
      item.repositoryId === input.repositoryId &&
      item.reason === input.reason &&
      item.status === 'pending',
  );
  if (existing) return existing;

  const created: ApprovalRequest = {
    id: `apr-${++nextApprovalId}`,
    repositoryId: input.repositoryId,
    repositoryName: input.repositoryName,
    requestedBy: input.requestedBy,
    reason: input.reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  approvalRequests.unshift(created);
  notify('approval.requested', 'Approval required', `${input.repositoryName}: ${input.reason}`);
  addAuditLog({
    userId: input.requestedBy,
    action: 'approval.requested',
    resourceType: 'approval',
    resourceId: created.id,
    details: { repositoryId: input.repositoryId, reason: input.reason },
  });
  persistState();
  return created;
}

export function listWorkflowNotifications(): WorkflowNotification[] {
  return notifications.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function markNotificationRead(id: string): boolean {
  const notification = notifications.find((item) => item.id === id);
  if (!notification) return false;
  notification.read = true;
  persistState();
  return true;
}

export function listTeamMembers(): TeamMember[] {
  return teamMembers.slice();
}

export function listRoleDefinitions() {
  return Object.values(BUILTIN_ROLES);
}

export function assignRole(memberId: string, roleId: string): TeamMember | null {
  if (!listRoleDefinitions().some((role) => role.id === roleId)) return null;
  const member = teamMembers.find((item) => item.id === memberId);
  if (!member) return null;
  member.roleId = roleId;
  addAuditLog({
    userId: 'rbac_admin',
    action: 'rbac.role.updated',
    resourceType: 'team-member',
    resourceId: memberId,
    details: { roleId },
  });
  persistState();
  return member;
}

export function setOwnership(memberId: string, repositoryIds: string[]): TeamMember | null {
  const member = teamMembers.find((item) => item.id === memberId);
  if (!member) return null;
  member.ownedRepositoryIds = repositoryIds;
  addAuditLog({
    userId: 'rbac_admin',
    action: 'ownership.updated',
    resourceType: 'team-member',
    resourceId: memberId,
    details: { repositoryIds },
  });
  persistState();
  return member;
}

export function getSsoConfig(): SsoConfig {
  return ssoConfig;
}

export function updateSsoConfig(input: Partial<SsoConfig>): SsoConfig {
  ssoConfig = {
    ...ssoConfig,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  addAuditLog({
    userId: 'sso_admin',
    action: 'sso.updated',
    resourceType: 'sso',
    resourceId: 'sso-config',
    details: { enabled: ssoConfig.enabled, provider: ssoConfig.provider },
  });
  persistState();
  return ssoConfig;
}

export function listComplianceArtifacts(): ComplianceArtifact[] {
  return complianceArtifacts.slice();
}

export function evaluateExecutionPreflight(input: {
  repository?: { id: string; fullName: string } | null;
  repositoryId?: string;
  repositoryName?: string;
  trigger: TriggerType;
  requestedBy: string;
  agentId?: string;
  agentsMdUrl?: string;
}): { allowed: true } | { allowed: false; code: string; reason: string; approvalId?: string } {
  const repository =
    input.repository ??
    (input.repositoryId ? getRepositoryById(input.repositoryId) : undefined) ??
    undefined;
  const repositoryId = repository?.id ?? input.repositoryId ?? 'external';
  const repositoryName = repository?.fullName ?? input.repositoryName ?? 'external/agent';
  const requestIdentity = input.requestedBy.trim().toLowerCase();
  const fingerprint = `${input.agentId ?? ''} ${input.agentsMdUrl ?? ''}`.toLowerCase();

  const owners = teamMembers.filter((member) => member.ownedRepositoryIds.includes(repositoryId));
  if (owners.length > 0) {
    const isOwner = owners.some(
      (owner) =>
        owner.id.toLowerCase() === requestIdentity || owner.email.toLowerCase() === requestIdentity,
    );
    const requesterMember = teamMembers.find(
      (member) =>
        member.id.toLowerCase() === requestIdentity ||
        member.email.toLowerCase() === requestIdentity,
    );
    const isPrivileged =
      requesterMember?.roleId === 'admin' || requesterMember?.roleId === 'approver';
    if (!isOwner && !isPrivileged) {
      const approval = createApprovalRequest({
        repositoryId,
        repositoryName,
        requestedBy: input.requestedBy,
        reason: 'Repository owner approval required for non-owner execution.',
      });
      governanceMetrics.approvalRequired += 1;
      persistState();
      return {
        allowed: false,
        code: 'OWNER_APPROVAL_REQUIRED',
        reason: 'Repository owner approval required.',
        approvalId: approval.id,
      };
    }
  }

  const gate = githubGates.get(repositoryId);
  if (gate) {
    const hadRequiredCheck = gate.requiredChecks.includes(OUTPUT_CONTRACT_CHECK);
    const hadStatus = gate.checks[OUTPUT_CONTRACT_CHECK] !== undefined;
    ensureOutputContractRequiredCheck(gate);
    if (!hadRequiredCheck || !hadStatus) {
      gate.updatedAt = new Date().toISOString();
      persistState();
    }
    const decision = evaluateGitHubGate(gate);
    if (!decision.pass) {
      const reason = decision.blockedReasons[0] ?? 'Required status checks are not satisfied.';
      governanceMetrics.blockedByStatusGate += 1;
      notify(
        'execution.blocked',
        'Execution blocked by status gate',
        `${repositoryName}: ${reason}`,
      );
      return {
        allowed: false,
        code: 'REQUIRED_STATUS_CHECK_FAILED',
        reason,
      };
    }
  }

  for (const rule of policyRules.filter((item) => item.enabled)) {
    for (const pattern of rule.blockPatterns) {
      if (fingerprint.includes(pattern.toLowerCase())) {
        governanceMetrics.blockedByPolicy += 1;
        notify(
          'execution.blocked',
          'Execution blocked by policy',
          `${repositoryName}: blocked by rule "${rule.name}" (${pattern})`,
        );
        return {
          allowed: false,
          code: 'POLICY_BLOCKED',
          reason: `Blocked by policy rule "${rule.name}" matching "${pattern}".`,
        };
      }
    }
  }

  for (const rule of policyRules.filter((item) => item.enabled)) {
    for (const pattern of rule.requireApprovalForPatterns) {
      if (fingerprint.includes(pattern.toLowerCase())) {
        const reason = `Matched policy "${rule.name}" (${pattern})`;
        const priorDecision = approvalRequests.find(
          (item) =>
            item.repositoryId === repositoryId &&
            item.reason === reason &&
            (item.status === 'approved' || item.status === 'rejected'),
        );
        if (priorDecision?.status === 'approved') {
          continue;
        }
        if (priorDecision?.status === 'rejected') {
          return {
            allowed: false,
            code: 'APPROVAL_REJECTED',
            reason: 'Execution blocked because the approval request was rejected.',
            approvalId: priorDecision.id,
          };
        }
        const approval = createApprovalRequest({
          repositoryId,
          repositoryName,
          requestedBy: input.requestedBy,
          reason,
        });
        governanceMetrics.approvalRequired += 1;
        persistState();
        return {
          allowed: false,
          code: 'APPROVAL_REQUIRED',
          reason: 'Execution requires approval before running.',
          approvalId: approval.id,
        };
      }
    }
  }

  return { allowed: true };
}

export function recordGitHubWebhookEvent(input: {
  event: string;
  result: 'received' | 'processed' | 'signature_failed' | 'error';
  error?: string;
}) {
  governanceMetrics.lastWebhookAt = new Date().toISOString();
  governanceMetrics.lastWebhookEvent = input.event;
  if (input.result === 'received') governanceMetrics.webhookReceived += 1;
  if (input.result === 'processed') governanceMetrics.webhookProcessed += 1;
  if (input.result === 'signature_failed') governanceMetrics.webhookSignatureFailures += 1;
  if (input.result === 'error') governanceMetrics.webhookErrors += 1;
  governanceMetrics.lastWebhookError = input.error;
  persistState();
}

export function getGovernanceOperationalStats() {
  return {
    blockedByStatusGate: governanceMetrics.blockedByStatusGate,
    blockedByPolicy: governanceMetrics.blockedByPolicy,
    approvalRequired: governanceMetrics.approvalRequired,
    webhookReceived: governanceMetrics.webhookReceived,
    webhookProcessed: governanceMetrics.webhookProcessed,
    webhookSignatureFailures: governanceMetrics.webhookSignatureFailures,
    webhookErrors: governanceMetrics.webhookErrors,
    prCommentsPosted: governanceMetrics.prCommentsPosted,
    slackApprovalActions: governanceMetrics.slackApprovalActions,
    webhookSuccessRate:
      governanceMetrics.webhookReceived > 0
        ? Math.round(
            (governanceMetrics.webhookProcessed / governanceMetrics.webhookReceived) * 1000,
          ) / 10
        : 100,
    lastWebhookAt: governanceMetrics.lastWebhookAt,
    lastWebhookEvent: governanceMetrics.lastWebhookEvent,
    lastWebhookError: governanceMetrics.lastWebhookError,
    lastGitHubSyncAt: governanceMetrics.lastGitHubSyncAt,
    lastGitHubSync: governanceMetrics.lastGitHubSync,
    contractValidationEventsLast30d: getContractValidationAnalytics(30).totals,
    pendingApprovals: approvalRequests.filter((item) => item.status === 'pending').length,
    unreadNotifications: notifications.filter((item) => !item.read).length,
    persistedStatePath: GOVERNANCE_STATE_PATH,
  };
}
