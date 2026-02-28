'use client';

import type { AuditEntry } from '@/lib/ops/mock-data';

const RESULT_COLORS = {
  pass: 'var(--ops-passed)',
  fail: 'var(--ops-failed)',
  approved: 'var(--ops-passed)',
  rejected: 'var(--ops-failed)',
};

export function AuditTab({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by pipeline..."
            className="h-9 w-48 rounded-[var(--radius-sm)] border border-input bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground"
          />
          <select className="h-9 rounded-[var(--radius-sm)] border border-input bg-background px-3 font-mono text-sm text-foreground">
            <option>All actors</option>
            <option>Human only</option>
            <option>Agent only</option>
          </select>
          <select className="h-9 rounded-[var(--radius-sm)] border border-input bg-background px-3 font-mono text-sm text-foreground">
            <option>All results</option>
            <option>Pass</option>
            <option>Fail</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
        <button className="h-9 rounded-[var(--radius-sm)] border border-input bg-background px-4 font-mono text-sm font-medium text-foreground hover:bg-muted transition-colors">
          Export CSV
        </button>
      </div>
      <div className="rounded-[var(--radius-md)] border border-border bg-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pipeline
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Stage
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actor
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Action
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Result
              </th>
              <th className="w-16 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i} className="border-b border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{e.timestamp}</td>
                <td className="px-4 py-3 font-mono text-sm">{e.pipeline}</td>
                <td className="px-4 py-3 font-mono text-sm text-foreground/80">{e.stage}</td>
                <td className="px-4 py-3 font-mono text-sm">
                  {e.actor}
                  <span className="ml-1 text-muted-foreground">({e.actorType})</span>
                </td>
                <td className="px-4 py-3 font-mono text-sm">{e.action}</td>
                <td className="px-4 py-3">
                  <span
                    className="font-mono text-sm font-medium"
                    style={{ color: RESULT_COLORS[e.result] }}
                  >
                    {e.result}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {e.details && (
                    <button className="font-mono text-xs text-muted-foreground underline hover:text-foreground">
                      Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
