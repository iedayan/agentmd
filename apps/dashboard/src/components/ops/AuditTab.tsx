"use client";

import type { AuditEntry } from "@/app/ops/mock-data";

const RESULT_COLORS = {
  pass: "var(--ops-passed)",
  fail: "var(--ops-failed)",
  approved: "var(--ops-passed)",
  rejected: "var(--ops-failed)",
};

export function AuditTab({ entries }: { entries: AuditEntry[] }) {

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by pipeline..."
            className="h-9 w-48 rounded border border-[var(--ops-border)] bg-[var(--ops-panel)] px-3 font-mono text-sm text-[var(--ops-primary)] placeholder:text-[var(--ops-primary)]/50"
          />
          <select className="h-9 rounded border border-[var(--ops-border)] bg-[var(--ops-panel)] px-3 font-mono text-sm text-[var(--ops-primary)]">
            <option>All actors</option>
            <option>Human only</option>
            <option>Agent only</option>
          </select>
          <select className="h-9 rounded border border-[var(--ops-border)] bg-[var(--ops-panel)] px-3 font-mono text-sm text-[var(--ops-primary)]">
            <option>All results</option>
            <option>Pass</option>
            <option>Fail</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
        <button className="h-9 rounded border border-[var(--ops-border)] bg-[var(--ops-panel)] px-4 font-mono text-sm font-medium text-[var(--ops-primary)] hover:bg-[var(--ops-bg)] transition-colors">
          Export CSV
        </button>
      </div>
      <div className="border border-[var(--ops-border)] bg-[var(--ops-panel)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--ops-border)]">
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ops-primary)]/70">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ops-primary)]/70">
                Pipeline
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ops-primary)]/70">
                Stage
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ops-primary)]/70">
                Actor
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ops-primary)]/70">
                Action
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ops-primary)]/70">
                Result
              </th>
              <th className="w-16 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr
                key={i}
                className="border-b border-[var(--ops-border)] hover:bg-[var(--ops-bg)]"
              >
                <td className="px-4 py-3 font-mono text-sm text-[var(--ops-primary)]/70">
                  {e.timestamp}
                </td>
                <td className="px-4 py-3 font-mono text-sm">{e.pipeline}</td>
                <td className="px-4 py-3 font-mono text-sm text-[var(--ops-primary)]/80">
                  {e.stage}
                </td>
                <td className="px-4 py-3 font-mono text-sm">
                  {e.actor}
                  <span className="ml-1 text-[var(--ops-primary)]/50">
                    ({e.actorType})
                  </span>
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
                    <button className="font-mono text-xs text-[var(--ops-primary)]/60 underline">
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
