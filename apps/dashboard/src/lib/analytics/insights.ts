import type { Repository } from '@/types';

export type InsightPriority = 'high' | 'medium' | 'low';
export type InsightIcon = 'warning' | 'shield' | 'success' | 'rocket';

export type Insight = {
  id: string;
  title: string;
  description: string;
  priority: InsightPriority;
  actionLabel: string;
  actionHref: string;
  icon: InsightIcon;
};

export function buildInsights(
  repositories: Repository[],
  repositoryLimit: number | 'unlimited',
): Insight[] {
  const insights: Insight[] = [];
  const failingRepos = repositories.filter((repo) => repo.latestExecutionStatus === 'failed');
  const lowReadinessRepos = repositories.filter((repo) => repo.healthScore < 70);
  const staleRepos = repositories.filter((repo) => !repo.lastValidated);
  const averageReadiness =
    repositories.length > 0
      ? Math.round(
          repositories.reduce((sum, repository) => sum + repository.healthScore, 0) /
            repositories.length,
        )
      : 0;

  if (repositories.length === 0) {
    insights.push({
      id: 'connect-first-repo',
      title: 'Connect your first repository',
      description:
        'No repositories are currently connected. Add one repository to unlock validation and execution workflows.',
      priority: 'high',
      actionLabel: 'Open Quickstart',
      actionHref: '/docs/quickstart',
      icon: 'rocket',
    });
    return insights;
  }

  if (failingRepos.length > 0) {
    const top = failingRepos[0];
    insights.push({
      id: 'failing-execution',
      title: `${failingRepos.length} repository execution${
        failingRepos.length === 1 ? ' is' : 's are'
      } failing`,
      description: `Latest run failed for ${top.fullName}. Investigate logs and rerun after fixing AGENTS.md or command issues.`,
      priority: 'high',
      actionLabel: 'View Execution Logs',
      actionHref: top.latestExecutionId
        ? `/dashboard/executions/${top.latestExecutionId}`
        : '/dashboard/executions',
      icon: 'shield',
    });
  }

  if (lowReadinessRepos.length > 0) {
    const weakest = [...lowReadinessRepos].sort((a, b) => a.healthScore - b.healthScore)[0];
    insights.push({
      id: 'low-readiness',
      title: `${lowReadinessRepos.length} repositories below readiness target`,
      description: `${weakest.fullName} is at ${weakest.healthScore}/100. Add clearer build/test/lint sections in AGENTS.md to reduce execution failures.`,
      priority: 'medium',
      actionLabel: 'Open Parse Guide',
      actionHref: '/docs/parse',
      icon: 'warning',
    });
  }

  if (staleRepos.length > 0) {
    insights.push({
      id: 'stale-validation',
      title: `${staleRepos.length} repositories were never validated`,
      description:
        'Run a manual execution to generate baseline health and command reliability metrics for those repos.',
      priority: 'medium',
      actionLabel: 'Run Executions',
      actionHref: '/dashboard/executions',
      icon: 'warning',
    });
  }

  if (typeof repositoryLimit === 'number' && repositories.length >= repositoryLimit) {
    insights.push({
      id: 'upgrade-capacity',
      title: 'Repository limit reached on current plan',
      description:
        'Upgrade to connect more repositories and centralize execution policies for your whole organization.',
      priority: 'low',
      actionLabel: 'Upgrade Plan',
      actionHref: '/dashboard/settings/billing',
      icon: 'rocket',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'healthy',
      title: `Workspace is healthy (${averageReadiness}/100 average readiness)`,
      description:
        'Your repositories look stable. Next step is expanding automation with marketplace agents.',
      priority: 'low',
      actionLabel: 'Explore Marketplace',
      actionHref: '/marketplace',
      icon: 'success',
    });
  }

  return insights.slice(0, 3);
}
