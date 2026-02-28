'use client';

import type { PolicyResult } from '@/lib/ops/mock-data';

export function PolicyValidation({ results }: { results: PolicyResult[] }) {
  return (
    <div className="bento-card border-luminescent bg-card">
      <div className="border-b border-border px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Policy Compliance
      </div>
      <div className="p-4 space-y-3">
        {results.map((r, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-border bg-muted/30 p-4"
          >
            <div>
              <div className="font-bold text-sm text-foreground">{r.ruleId}</div>
              <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                {r.description}
              </div>
            </div>
            <div
              className={`mt-0.5 h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${
                r.passed
                  ? 'text-[var(--ops-passed)] bg-current'
                  : r.enforcement === 'warn'
                    ? 'text-[var(--ops-pending)] bg-current'
                    : 'text-[var(--ops-failed)] bg-current'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
