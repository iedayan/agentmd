'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import type { OpsAnalytics } from '@/lib/ops/use-ops-data';

export function AnalyticsTab({ analytics }: { analytics: OpsAnalytics }) {
  const a = analytics;

  return (
    <div className="w-full min-w-0 overflow-x-auto p-6">
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[var(--radius-md)] border border-border bg-card p-4">
          <div className="font-mono text-xs text-muted-foreground">Pipelines run (this week)</div>
          <div className="mt-1 font-mono text-2xl font-bold">{a.pipelinesRun}</div>
          <div className="mt-2 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={a.pipelinesRunSparkline.map((v, i) => ({ v, i }))}>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                  strokeWidth={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-card p-4">
          <div className="font-mono text-xs text-muted-foreground">Policy violation rate</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold">{a.policyViolationRate}%</span>
            <span
              className="font-mono text-sm"
              style={{
                color:
                  a.policyViolationTrend === 'down' ? 'var(--ops-passed)' : 'var(--ops-failed)',
              }}
            >
              {a.policyViolationTrend === 'down' ? '↓' : '↑'}
            </span>
          </div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-card p-4">
          <div className="font-mono text-xs text-muted-foreground">Avg time in approval gate</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold">{a.avgApprovalTimeHours}h</span>
            <span
              className="font-mono text-sm"
              style={{
                color: a.approvalTimeTrend === 'down' ? 'var(--ops-passed)' : 'var(--ops-failed)',
              }}
            >
              {a.approvalTimeTrend === 'down' ? '↓' : '↑'}
            </span>
          </div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-card p-4">
          <div className="font-mono text-xs text-muted-foreground">Agent success rate</div>
          <div className="mt-1 font-mono text-2xl font-bold">{a.agentSuccessRate}%</div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6">
        <div className="rounded-[var(--radius-md)] border border-border bg-card p-6">
          <h3 className="mb-4 font-mono text-sm font-semibold">
            Policy violations by rule (last 30 days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.violationsByRule} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="rule"
                  tick={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}
                  tickFormatter={(v) => v.slice(0, 20) + (v.length > 20 ? '…' : '')}
                />
                <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    fontFamily: 'var(--font-mono)',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--destructive))" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-card p-6">
          <h3 className="mb-4 font-mono text-sm font-semibold">Pipeline volume over time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={a.pipelineVolume} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10 }} />
                <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    fontFamily: 'var(--font-mono)',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="running"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={1}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-md)] border border-border bg-card">
        <div className="border-b border-border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Most blocked agents
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold text-muted-foreground">
                AGENTS.md source
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold text-muted-foreground">
                Gates hit
              </th>
            </tr>
          </thead>
          <tbody>
            {a.mostBlockedAgents.map((agent, i) => (
              <tr key={i} className="border-b border-[var(--ops-border)]">
                <td className="px-4 py-3 font-mono text-sm">{agent.sourceRef}</td>
                <td className="px-4 py-3 font-mono text-sm font-medium text-amber-600 dark:text-amber-400">
                  {agent.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
