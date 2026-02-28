import type { AgentListing } from '@agentmd-dev/core';
import type { Execution, ExecutionStep, Repository, TriggerType } from '@/types';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
}

export interface ApiExecutionRecord {
  id: string;
  agentsMdUrl: string;
  repositoryId: string | null;
  status: 'queued';
  createdAt: string;
  platformFeePercent: number;
}

const repositories: Repository[] = [
  {
    id: '1',
    name: 'agentmd',
    fullName: 'agentmd/agentmd',
    owner: 'agentmd',
    healthScore: 85,
    lastValidated: '2024-02-21T14:30:00Z',
    agentsMdCount: 1,
  },
  {
    id: '2',
    name: 'my-app',
    fullName: 'user/my-app',
    owner: 'user',
    healthScore: 62,
    lastValidated: '2024-02-20T10:15:00Z',
    agentsMdCount: 3,
    healthDrift: true,
  },
  {
    id: '3',
    name: 'monorepo',
    fullName: 'org/monorepo',
    owner: 'org',
    healthScore: 92,
    lastValidated: '2024-02-21T12:00:00Z',
    agentsMdCount: 5,
  },
];

const executions: Execution[] = [
  {
    id: '1',
    repositoryId: '1',
    repositoryName: 'agentmd/agentmd',
    trigger: 'push',
    status: 'failed',
    startedAt: '2024-02-21T14:30:00Z',
    completedAt: '2024-02-21T14:30:45Z',
    durationMs: 45000,
    commandsRun: 4,
    commandsPassed: 3,
    commandsFailed: 1,
    executionMode: 'mock',
    agentsMdUrl: 'https://github.com/agentmd/agentmd/blob/main/AGENTS.md',
    preflightRunnableCount: 3,
    preflightBlockedCount: 1,
    blockedCommands: [
      {
        command: 'pnpm run lint',
        type: 'lint',
        section: 'Lint',
        line: 4,
        codes: ['PERMISSION_DENIED'],
        messages: ['Blocked by policy: lint is not allowed to run in this environment.'],
        requiresShell: false,
        requiresApproval: false,
      },
    ],
    preflightPlan: {
      runnableCount: 3,
      blockedCount: 1,
      items: [
        {
          runnable: true,
          command: 'pnpm install',
          type: 'install',
          section: 'Install',
          line: 1,
          reasons: [],
          reasonDetails: [],
          requiresShell: false,
          requiresApproval: false,
        },
        {
          runnable: true,
          command: 'pnpm run build',
          type: 'build',
          section: 'Build',
          line: 2,
          reasons: [],
          reasonDetails: [],
          requiresShell: false,
          requiresApproval: false,
        },
        {
          runnable: true,
          command: 'pnpm test',
          type: 'test',
          section: 'Test',
          line: 3,
          reasons: [],
          reasonDetails: [],
          requiresShell: false,
          requiresApproval: false,
        },
        {
          runnable: false,
          command: 'pnpm run lint',
          type: 'lint',
          section: 'Lint',
          line: 4,
          reasons: ['Blocked by policy: lint is not allowed to run in this environment.'],
          reasonDetails: [
            {
              code: 'PERMISSION_DENIED',
              message: 'Blocked by policy: lint is not allowed to run in this environment.',
            },
          ],
          requiresShell: false,
          requiresApproval: false,
        },
      ],
    },
  },
  {
    id: '2',
    repositoryId: '2',
    repositoryName: 'user/my-app',
    trigger: 'pull_request',
    status: 'failed',
    startedAt: '2024-02-21T12:00:00Z',
    completedAt: '2024-02-21T12:01:30Z',
    durationMs: 90000,
    commandsRun: 8,
    commandsPassed: 6,
    commandsFailed: 2,
  },
  {
    id: '3',
    repositoryId: '1',
    repositoryName: 'agentmd/agentmd',
    trigger: 'manual',
    status: 'running',
    startedAt: '2024-02-21T15:00:00Z',
    commandsRun: 0,
    commandsPassed: 0,
    commandsFailed: 0,
  },
];

const executionStepsByExecutionId = new Map<string, ExecutionStep[]>([
  [
    '1',
    [
      {
        id: '1',
        command: 'pnpm install',
        type: 'install',
        status: 'success',
        durationMs: 12000,
        output: 'Progress: resolved 165 packages',
      },
      {
        id: '2',
        command: 'pnpm run build',
        type: 'build',
        status: 'success',
        durationMs: 8500,
        output: 'Build completed successfully',
      },
      {
        id: '3',
        command: 'pnpm test',
        type: 'test',
        status: 'success',
        durationMs: 4200,
        output: '23 tests passed',
      },
      {
        id: '4',
        command: 'pnpm run lint',
        type: 'lint',
        status: 'blocked',
        reasons: [
          'Blocked by policy: lint is not allowed to run in this environment.',
          'Hint: allow this command in permissions.shell.allow or run in an isolated worker.',
        ],
        reasonDetails: [
          {
            code: 'PERMISSION_DENIED',
            message: 'Blocked by policy: lint is not allowed to run in this environment.',
          },
        ],
        durationMs: 20,
      },
    ],
  ],
]);

const auditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2024-02-21T15:30:00Z',
    userId: 'user_abc',
    userEmail: '[EMAIL_REDACTED]',
    action: 'execution.started',
    resourceType: 'execution',
    resourceId: 'exec_1',
    details: { repository: 'agentmd/agentmd', trigger: 'manual' },
  },
  {
    id: '2',
    timestamp: '2024-02-21T15:29:45Z',
    userId: 'user_abc',
    action: 'execution.approved',
    resourceType: 'approval',
    resourceId: 'apr_1',
    details: { command: 'pnpm run deploy' },
  },
  {
    id: '3',
    timestamp: '2024-02-21T14:00:00Z',
    userId: 'user_xyz',
    action: 'repository.connected',
    resourceType: 'repository',
    resourceId: 'repo_2',
  },
];

const marketplaceAgents: AgentListing[] = [
  {
    id: '1',
    name: 'PR Labeler',
    slug: 'pr-labeler',
    description:
      'Automatically apply size labels (XS, S, M, L, XL) to pull requests based on diff stats.',
    capabilities: ['PR analysis', 'Size labeling', 'GitHub integration'],
    requiredPermissions: ['pull_requests: write'],
    pricing: { model: 'free' },
    license: 'MIT',
    exampleAgentsMd: 'agent:\n  name: pr-labeler\n  triggers: [pull_request.opened]',
    agentsMdUrl: 'https://github.com/agentmd/pr-labeler/AGENTS.md',
    category: 'pr-labeler',
    trustScore: 92,
    certified: true,
    rating: 4.8,
    reviewCount: 124,
    sellerId: 'agentmd',
    sellerName: 'AgentMD',
    updatedAt: '2024-02-20T10:00:00Z',
  },
  {
    id: '2',
    name: 'Test Runner',
    slug: 'test-runner',
    description:
      'Run pytest, jest, or vitest in CI. Supports parallel execution and coverage reports.',
    capabilities: ['Testing', 'CI', 'Coverage'],
    requiredPermissions: ['contents: read', 'workflows: write'],
    pricing: { model: 'usage-based', usagePrice: 500 },
    license: 'Commercial',
    exampleAgentsMd: 'agent:\n  name: test-runner\n  triggers: [push]',
    agentsMdUrl: 'https://github.com/agentmd/test-runner/AGENTS.md',
    category: 'testing',
    trustScore: 88,
    certified: true,
    rating: 4.6,
    reviewCount: 89,
    sellerId: 'agentmd',
    sellerName: 'AgentMD',
    updatedAt: '2024-02-19T14:00:00Z',
  },
  {
    id: '3',
    name: 'Code Review Agent',
    slug: 'code-review',
    description: 'Review PRs for security, style, and best practices. Configurable rules.',
    capabilities: ['Code review', 'Security', 'Linting'],
    requiredPermissions: ['pull_requests: read', 'pull_requests: write'],
    pricing: { model: 'subscription', subscriptionPrice: 1999 },
    license: 'Commercial',
    exampleAgentsMd: 'agent:\n  name: code-review\n  model: gpt-4o',
    agentsMdUrl: 'https://github.com/agentmd/code-review/AGENTS.md',
    category: 'code-review',
    trustScore: 85,
    certified: true,
    rating: 4.5,
    reviewCount: 67,
    sellerId: 'acme',
    sellerName: 'Acme Agents',
    updatedAt: '2024-02-18T09:00:00Z',
  },
  {
    id: '4',
    name: 'React Template',
    slug: 'react-template',
    description: 'Scaffold React + TypeScript + Vite projects with AGENTS.md pre-configured.',
    capabilities: ['Scaffolding', 'Templates', 'React'],
    requiredPermissions: ['contents: write'],
    pricing: { model: 'one-time', oneTimePrice: 999 },
    license: 'BSL',
    exampleAgentsMd: 'agent:\n  name: react-template\n  purpose: Scaffold React apps',
    agentsMdUrl: 'https://github.com/agentmd/react-template/AGENTS.md',
    category: 'template',
    trustScore: 78,
    certified: false,
    rating: 4.2,
    reviewCount: 23,
    sellerId: 'indie',
    sellerName: 'Indie Dev',
    updatedAt: '2024-02-15T12:00:00Z',
  },
];

let nextExecutionNumericId = 1000;
let nextAuditId = 1000;
const apiExecutionByDashboardId = new Map<string, ApiExecutionRecord>();
const idempotencyToDashboardExecutionId = new Map<string, string>();
const executionTimers = new Map<string, ReturnType<typeof setTimeout>[]>();

function buildDefaultSteps(): ExecutionStep[] {
  return [
    {
      id: '1',
      command: 'pnpm install',
      type: 'install',
      status: 'pending',
    },
    {
      id: '2',
      command: 'pnpm run build',
      type: 'build',
      status: 'pending',
    },
    {
      id: '3',
      command: 'pnpm test',
      type: 'test',
      status: 'pending',
    },
    {
      id: '4',
      command: 'pnpm run lint',
      type: 'lint',
      status: 'pending',
    },
  ];
}

function scheduleExecutionLifecycle(executionId: string) {
  const timers = executionTimers.get(executionId);
  if (timers && timers.length > 0) return;

  const startTimer = setTimeout(() => {
    const execution = getExecutionById(executionId);
    if (!execution || execution.status !== 'pending') return;

    execution.status = 'running';
    execution.startedAt = new Date().toISOString();
    const steps = listExecutionSteps(executionId);
    if (steps.length > 0) {
      steps[0].status = 'running';
      steps[0].output = 'Installing dependencies...';
    }
  }, 120);

  const completeTimer = setTimeout(() => {
    const execution = getExecutionById(executionId);
    if (!execution || execution.status !== 'running') return;

    const completedAt = new Date().toISOString();
    execution.status = 'success';
    execution.completedAt = completedAt;
    execution.durationMs = 4200;
    execution.commandsRun = 4;
    execution.commandsPassed = 4;
    execution.commandsFailed = 0;

    const steps = listExecutionSteps(executionId);
    steps.forEach((step, index) => {
      step.status = 'success';
      step.durationMs = [950, 1600, 1100, 550][index] ?? 500;
      step.output = [
        'Dependencies installed',
        'Build completed successfully',
        'All tests passed',
        'No lint issues found',
      ][index];
      step.error = undefined;
    });

    const scheduledTimers = executionTimers.get(executionId);
    if (scheduledTimers) {
      scheduledTimers.forEach((timer) => clearTimeout(timer));
      executionTimers.delete(executionId);
    }
  }, 1350);

  executionTimers.set(executionId, [startTimer, completeTimer]);
}

export function listRepositories(options?: { owner?: string; search?: string }): Repository[] {
  const owner = options?.owner?.trim().toLowerCase();
  const search = options?.search?.trim().toLowerCase();
  return repositories
    .filter((repo) => {
      if (owner && repo.owner.toLowerCase() !== owner) return false;
      if (search) {
        return (
          repo.name.toLowerCase().includes(search) || repo.fullName.toLowerCase().includes(search)
        );
      }
      return true;
    })
    .map((repo) => {
      const latest = executions
        .filter((execution) => execution.repositoryId === repo.id)
        .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))[0];
      return {
        ...repo,
        latestExecutionId: latest?.id,
        latestExecutionStatus: latest?.status,
        healthDrift: repo.healthDrift,
      };
    });
}

export function getRepositoryById(id: string): Repository | undefined {
  return repositories.find((repo) => repo.id === id);
}

export function addRepository(input: {
  name: string;
  fullName: string;
  owner: string;
  healthScore?: number;
  agentsMdCount?: number;
}): Repository {
  const id = String(
    repositories.reduce((max, repository) => Math.max(max, Number(repository.id) || 0), 0) + 1,
  );
  const repository: Repository = {
    id,
    name: input.name,
    fullName: input.fullName,
    owner: input.owner,
    healthScore: input.healthScore ?? 70,
    agentsMdCount: input.agentsMdCount ?? 1,
    lastValidated: new Date().toISOString(),
  };
  repositories.unshift(repository);
  return repository;
}

export function hasRepositoryFullName(fullName: string): boolean {
  const normalized = fullName.trim().toLowerCase();
  return repositories.some((repository) => repository.fullName.toLowerCase() === normalized);
}

export function listExecutions(options?: {
  repositoryId?: string;
  status?: Execution['status'];
  limit?: number;
}): Execution[] {
  const limit = options?.limit && options.limit > 0 ? options.limit : 100;
  return executions
    .filter((execution) => {
      if (options?.repositoryId && execution.repositoryId !== options.repositoryId) return false;
      if (options?.status && execution.status !== options.status) return false;
      return true;
    })
    .slice()
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
    .slice(0, limit);
}

export function getExecutionById(id: string): Execution | undefined {
  return executions.find((execution) => execution.id === id);
}

export function cancelExecution(_id: string, _userId: string): Execution | null {
  void _userId; // Reserved for future auth checks
  const execution = executions.find((e) => e.id === _id);
  if (!execution || (execution.status !== 'pending' && execution.status !== 'running')) {
    return null;
  }
  execution.status = 'cancelled';
  execution.completedAt = new Date().toISOString();
  const timers = executionTimers.get(_id);
  if (timers) {
    timers.forEach((t) => clearTimeout(t));
    executionTimers.delete(_id);
  }
  return execution;
}

export function listExecutionSteps(executionId: string): ExecutionStep[] {
  return executionStepsByExecutionId.get(executionId) ?? [];
}

export function createQueuedExecution(input: {
  repositoryId?: string;
  repositoryName?: string;
  trigger: TriggerType;
  agentsMdUrl: string;
  idempotencyKey?: string;
}): {
  apiExecution: ApiExecutionRecord;
  dashboardExecution: Execution;
  idempotentReplay: boolean;
} {
  const idempotencyKey = input.idempotencyKey?.trim();
  if (idempotencyKey) {
    const existingDashboardId = idempotencyToDashboardExecutionId.get(idempotencyKey);
    if (existingDashboardId) {
      const existingExecution = getExecutionById(existingDashboardId);
      const existingApiExecution = apiExecutionByDashboardId.get(existingDashboardId);
      if (existingExecution && existingApiExecution) {
        return {
          apiExecution: existingApiExecution,
          dashboardExecution: existingExecution,
          idempotentReplay: true,
        };
      }
    }
  }

  const now = new Date().toISOString();
  const repository =
    input.repositoryId !== undefined ? getRepositoryById(input.repositoryId) : undefined;
  const id = String(++nextExecutionNumericId);

  const dashboardExecution: Execution = {
    id,
    repositoryId: repository?.id ?? input.repositoryId ?? 'external',
    repositoryName: repository?.fullName ?? input.repositoryName ?? 'external/agent',
    trigger: input.trigger,
    status: 'pending',
    startedAt: now,
    commandsRun: 0,
    commandsPassed: 0,
    commandsFailed: 0,
  };
  executions.unshift(dashboardExecution);
  executionStepsByExecutionId.set(id, buildDefaultSteps());

  const apiExecution: ApiExecutionRecord = {
    id: `exec_${id}`,
    agentsMdUrl: input.agentsMdUrl,
    repositoryId: input.repositoryId ?? null,
    status: 'queued',
    createdAt: now,
    platformFeePercent: 15,
  };
  apiExecutionByDashboardId.set(id, apiExecution);
  if (idempotencyKey) {
    idempotencyToDashboardExecutionId.set(idempotencyKey, id);
  }
  scheduleExecutionLifecycle(id);

  return {
    apiExecution,
    dashboardExecution,
    idempotentReplay: false,
  };
}

export function listAuditLogs(limit = 100): AuditLog[] {
  return auditLogs
    .slice()
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, limit);
}

export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
  const created: AuditLog = {
    id: String(++nextAuditId),
    timestamp: new Date().toISOString(),
    ...log,
  };
  auditLogs.unshift(created);
  return created;
}

export function listMarketplaceAgents(options?: {
  category?: string;
  certifiedOnly?: boolean;
  search?: string;
}): AgentListing[] {
  const category = options?.category?.trim().toLowerCase();
  const search = options?.search?.trim().toLowerCase();
  return marketplaceAgents.filter((agent) => {
    if (category && category !== 'all' && agent.category !== category) return false;
    if (options?.certifiedOnly && !agent.certified) return false;
    if (search) {
      return (
        agent.name.toLowerCase().includes(search) ||
        agent.description.toLowerCase().includes(search) ||
        agent.capabilities.some((capability) => capability.toLowerCase().includes(search))
      );
    }
    return true;
  });
}

export function getMarketplaceAgentBySlug(slug: string): AgentListing | undefined {
  return marketplaceAgents.find((agent) => agent.slug === slug);
}

export function getDashboardCounts() {
  const completedExecutions = executions.filter((execution) => execution.status !== 'pending');
  const totalDurationMs = completedExecutions.reduce(
    (sum, execution) => sum + (execution.durationMs ?? 0),
    0,
  );
  const totalCommandsRun = completedExecutions.reduce(
    (sum, execution) => sum + execution.commandsRun,
    0,
  );
  const totalCommandsFailed = completedExecutions.reduce(
    (sum, execution) => sum + execution.commandsFailed,
    0,
  );

  return {
    repositories: repositories.length,
    executions: executions.length,
    agents: marketplaceAgents.length,
    executionMinutesUsed: Math.round((totalDurationMs / 60000) * 100) / 100,
    totalCommandsRun,
    totalCommandsFailed,
  };
}
