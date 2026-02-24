"use client";

import type { PolicyResult } from "@/app/ops/mock-data";

export function PolicyValidation({ results }: { results: PolicyResult[] }) {
  return (
    <div className="border border-[var(--ops-border)] bg-[var(--ops-panel)]">
      <div className="border-b border-[var(--ops-border)] px-4 py-2 font-mono text-xs font-medium text-[var(--ops-primary)]/70">
        Policy Validation
      </div>
      <ul className="divide-y divide-[var(--ops-border)] p-4">
        {results.map((r) => (
          <li key={r.id} className="flex items-start gap-3 py-2 font-mono text-sm">
            <span
              className="mt-0.5 shrink-0"
              style={{
                color: r.passed ? "var(--ops-passed)" : "var(--ops-failed)",
              }}
            >
              {r.passed ? "✓" : "✕"}
            </span>
            <div>
              <span className="font-medium text-[var(--ops-primary)]">
                {r.ruleId}
              </span>
              {!r.passed && (
                <span className="ml-1 text-[var(--ops-pending)]">
                  → {r.enforcement === "require_approval" ? "triggered approval gate" : "blocked"}
                </span>
              )}
              <div className="mt-0.5 text-xs text-[var(--ops-primary)]/60">
                {r.description}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
