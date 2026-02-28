import type { Execution, Repository } from '@/types';

export type ImpactMetrics = {
  automationHoursSaved: number;
  commandSuccessRate: number;
  executionFailureRate: number;
  avgExecutionSeconds: number;
  stabilityScore: number;
  completedExecutions: number;
  summary: string;
};

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function buildImpactMetrics(
  repositories: Repository[],
  executions: Execution[],
  totalCommandsRun: number,
  totalCommandsFailed: number,
): ImpactMetrics {
  const completed = executions.filter(
    (execution) => execution.status === 'success' || execution.status === 'failed',
  );
  const failedExecutions = completed.filter((execution) => execution.status === 'failed').length;
  const successCommands = Math.max(0, totalCommandsRun - totalCommandsFailed);
  const commandSuccessRate =
    totalCommandsRun > 0 ? round((successCommands / totalCommandsRun) * 100, 1) : 100;
  const executionFailureRate =
    completed.length > 0 ? round((failedExecutions / completed.length) * 100, 1) : 0;

  const totalDurationMs = completed.reduce(
    (sum, execution) => sum + (execution.durationMs ?? 0),
    0,
  );
  const avgExecutionSeconds =
    completed.length > 0 ? round(totalDurationMs / completed.length / 1000, 1) : 0;

  // Heuristic: one automated run typically replaces ~8 minutes of manual CI triage.
  const automationHoursSaved = round((completed.length * 8) / 60, 1);

  const averageReadiness =
    repositories.length > 0
      ? repositories.reduce((sum, repository) => sum + repository.healthScore, 0) /
        repositories.length
      : 0;
  const stabilityScore = round(
    averageReadiness * 0.6 + commandSuccessRate * 0.4 - executionFailureRate * 0.25,
    1,
  );

  const summary =
    stabilityScore >= 85
      ? 'High operational stability. Focus on scaling automation coverage.'
      : stabilityScore >= 70
        ? 'Stable foundation with room to reduce failed runs and improve readiness.'
        : 'Execution quality is at risk. Prioritize AGENTS.md hardening and failed-run triage.';

  return {
    automationHoursSaved,
    commandSuccessRate,
    executionFailureRate,
    avgExecutionSeconds,
    stabilityScore: Math.max(0, Math.min(100, stabilityScore)),
    completedExecutions: completed.length,
    summary,
  };
}
