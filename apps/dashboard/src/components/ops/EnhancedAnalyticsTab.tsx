'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  GitPullRequest,
  Activity,
  Target,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { OpsAnalytics } from '@/lib/ops/use-ops-data';

interface EnhancedAnalyticsTabProps {
  analytics: OpsAnalytics;
}

interface InsightCard {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  description: string;
  actionable?: boolean;
  action?: string;
}

export function EnhancedAnalyticsTab({ analytics }: EnhancedAnalyticsTabProps) {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const insights: InsightCard[] = [
    {
      title: 'Pipeline Success Rate',
      value: `${analytics.agentSuccessRate}%`,
      trend:
        analytics.agentSuccessRate >= 90
          ? 'up'
          : analytics.agentSuccessRate >= 70
            ? 'neutral'
            : 'down',
      trendValue:
        analytics.agentSuccessRate >= 90
          ? '+5%'
          : analytics.agentSuccessRate >= 70
            ? 'stable'
            : '-3%',
      icon: <Target className="h-5 w-5" />,
      description: 'Overall success rate across all pipelines',
      actionable: analytics.agentSuccessRate < 90,
      action: analytics.agentSuccessRate < 90 ? 'Review failed pipelines' : undefined,
    },
    {
      title: 'Avg Approval Time',
      value: `${analytics.avgApprovalTimeHours}h`,
      trend: analytics.approvalTimeTrend,
      trendValue: analytics.approvalTimeTrend === 'down' ? '-2h' : '+1h',
      icon: <Clock className="h-5 w-5" />,
      description: 'Average time for pipeline approvals',
      actionable: analytics.avgApprovalTimeHours > 4,
      action: analytics.avgApprovalTimeHours > 4 ? 'Optimize approval process' : undefined,
    },
    {
      title: 'Policy Violations',
      value: `${analytics.policyViolationRate}%`,
      trend: analytics.policyViolationTrend === 'down' ? 'up' : 'down',
      trendValue: analytics.policyViolationTrend === 'down' ? '-2%' : '+1%',
      icon: <AlertTriangle className="h-5 w-5" />,
      description: 'Rate of policy violations in pipelines',
      actionable: analytics.policyViolationRate > 10,
      action: analytics.policyViolationRate > 10 ? 'Review policy settings' : undefined,
    },
    {
      title: 'Pipelines Run',
      value: analytics.pipelinesRun,
      trend: 'up',
      trendValue: '+12%',
      icon: <Activity className="h-5 w-5" />,
      description: 'Total pipelines executed in the last 30 days',
    },
  ];

  const getSeverityColor = (count: number, max: number) => {
    const percentage = (count / max) * 100;
    if (percentage >= 80) return 'text-red-600 bg-red-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Actionable insights from your pipeline performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              insight.actionable ? 'border-l-4 border-l-orange-500' : ''
            } ${selectedInsight === insight.title ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedInsight(insight.title)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {insight.icon}
                  <span className="text-sm font-medium text-muted-foreground">{insight.title}</span>
                </div>
                {getTrendIcon(insight.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">{insight.value}</span>
                  <span className={`text-sm font-medium ${getTrendColor(insight.trend)}`}>
                    {insight.trendValue}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
                {insight.actionable && insight.action && (
                  <Button variant="outline" size="sm" className="mt-2 text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    {insight.action}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policy Violations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Policy Violations by Rule
            </CardTitle>
            <CardDescription>Most common policy violations requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.violationsByRule.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No policy violations detected</p>
                </div>
              ) : (
                analytics.violationsByRule.map((violation, index) => {
                  const maxCount = Math.max(...analytics.violationsByRule.map((v) => v.count));
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{violation.rule}</span>
                        <Badge className={getSeverityColor(violation.count, maxCount)}>
                          {violation.count}
                        </Badge>
                      </div>
                      <Progress value={(violation.count / maxCount) * 100} className="h-2" />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Most Blocked Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitPullRequest className="h-5 w-5" />
              Most Blocked Agents
            </CardTitle>
            <CardDescription>Agents that frequently get blocked by policies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.mostBlockedAgents.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No agents blocked recently</p>
                </div>
              ) : (
                analytics.mostBlockedAgents.map((agent, index) => {
                  const maxCount = Math.max(...analytics.mostBlockedAgents.map((a) => a.count));
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono">{agent.sourceRef}</span>
                        <Badge variant="outline">{agent.count} blocks</Badge>
                      </div>
                      <Progress value={(agent.count / maxCount) * 100} className="h-2" />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Volume Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Pipeline Volume Trend
          </CardTitle>
          <CardDescription>Daily pipeline execution volume over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.pipelineVolume.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">No pipeline data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.pipelineVolume.reduce((sum, day) => sum + day.completed, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.pipelineVolume.reduce((sum, day) => sum + day.running, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Running</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {analytics.pipelineVolume.reduce((sum, day) => sum + day.failed, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>

              {/* Simple sparkline visualization */}
              <div className="h-20 flex items-end gap-1">
                {analytics.pipelineVolume.slice(-14).map((day, index) => {
                  const maxVolume = Math.max(
                    ...analytics.pipelineVolume.map((d) => d.completed + d.running + d.failed),
                  );
                  const totalVolume = day.completed + day.running + day.failed;
                  const height = maxVolume > 0 ? (totalVolume / maxVolume) * 100 : 0;

                  return (
                    <div
                      key={index}
                      className="flex-1 bg-primary rounded-t-sm transition-all duration-200 hover:opacity-80"
                      style={{ height: `${height}%` }}
                      title={`${day.date}: ${totalVolume} pipelines`}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground text-center">Last 14 days</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Insight Detail */}
      {selectedInsight && (
        <Card>
          <CardHeader>
            <CardTitle>Insight Details: {selectedInsight}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Detailed analysis and recommendations for {selectedInsight}.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Monitor trends over the next 7 days</li>
                    <li>• Set up alerts for significant changes</li>
                    <li>• Review related policies if needed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Impact Assessment</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Affects overall system performance</li>
                    <li>• May require policy adjustments</li>
                    <li>• Consider team training opportunities</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
