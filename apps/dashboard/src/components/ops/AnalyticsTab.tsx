"use client";

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
} from "recharts";
import type { OpsAnalytics } from "@/hooks/use-ops-data";

export function AnalyticsTab({ analytics }: { analytics: OpsAnalytics }) {
  const a = analytics;

  return (
    <div className="w-full min-w-0 overflow-x-auto p-6">
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[var(--ops-border)] bg-[var(--ops-panel)] p-4">
          <div className="font-mono text-xs text-[var(--ops-primary)]/60">
            Pipelines run (this week)
          </div>
          <div className="mt-1 font-mono text-2xl font-bold">{a.pipelinesRun}</div>
          <div className="mt-2 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={a.pipelinesRunSparkline.map((v, i) => ({ v, i }))}>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--ops-primary)"
                  fill="var(--ops-primary)"
                  fillOpacity={0.1}
                  strokeWidth={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="border border-[var(--ops-border)] bg-[var(--ops-panel)] p-4">
          <div className="font-mono text-xs text-[var(--ops-primary)]/60">
            Policy violation rate
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold">{a.policyViolationRate}%</span>
            <span
              className="font-mono text-sm"
              style={{
                color: a.policyViolationTrend === "down" ? "var(--ops-passed)" : "var(--ops-failed)",
              }}
            >
              {a.policyViolationTrend === "down" ? "↓" : "↑"}
            </span>
          </div>
        </div>
        <div className="border border-[var(--ops-border)] bg-[var(--ops-panel)] p-4">
          <div className="font-mono text-xs text-[var(--ops-primary)]/60">
            Avg time in approval gate
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold">{a.avgApprovalTimeHours}h</span>
            <span
              className="font-mono text-sm"
              style={{
                color: a.approvalTimeTrend === "down" ? "var(--ops-passed)" : "var(--ops-failed)",
              }}
            >
              {a.approvalTimeTrend === "down" ? "↓" : "↑"}
            </span>
          </div>
        </div>
        <div className="border border-[var(--ops-border)] bg-[var(--ops-panel)] p-4">
          <div className="font-mono text-xs text-[var(--ops-primary)]/60">
            Agent success rate
          </div>
          <div className="mt-1 font-mono text-2xl font-bold">{a.agentSuccessRate}%</div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6">
        <div className="border border-[var(--ops-border)] bg-[var(--ops-panel)] p-6">
          <h3 className="mb-4 font-mono text-sm font-semibold">
            Policy violations by rule (last 30 days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.violationsByRule} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="rule"
                  tick={{ fontFamily: "var(--font-mono-ops)", fontSize: 10 }}
                  tickFormatter={(v) => v.slice(0, 20) + (v.length > 20 ? "…" : "")}
                />
                <YAxis tick={{ fontFamily: "var(--font-mono-ops)", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    fontFamily: "var(--font-mono-ops)",
                    border: "1px solid var(--ops-border)",
                  }}
                />
                <Bar dataKey="count" fill="var(--ops-failed)" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="border border-[var(--ops-border)] bg-[var(--ops-panel)] p-6">
          <h3 className="mb-4 font-mono text-sm font-semibold">
            Pipeline volume over time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={a.pipelineVolume} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="date"
                  tick={{ fontFamily: "var(--font-mono-ops)", fontSize: 10 }}
                />
                <YAxis tick={{ fontFamily: "var(--font-mono-ops)", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    fontFamily: "var(--font-mono-ops)",
                    border: "1px solid var(--ops-border)",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: "var(--font-mono-ops)", fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="running"
                  stroke="var(--ops-running)"
                  strokeWidth={1}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--ops-passed)"
                  strokeWidth={1}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  stroke="var(--ops-failed)"
                  strokeWidth={1}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="border border-[var(--ops-border)] bg-[var(--ops-panel)]">
        <div className="border-b border-[var(--ops-border)] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ops-primary)]/70">
          Most blocked agents
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--ops-border)]">
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold text-[var(--ops-primary)]/70">
                AGENTS.md source
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold text-[var(--ops-primary)]/70">
                Gates hit
              </th>
            </tr>
          </thead>
          <tbody>
            {a.mostBlockedAgents.map((agent, i) => (
              <tr key={i} className="border-b border-[var(--ops-border)]">
                <td className="px-4 py-3 font-mono text-sm">{agent.sourceRef}</td>
                <td className="px-4 py-3 font-mono text-sm font-medium text-[var(--ops-pending)]">
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
