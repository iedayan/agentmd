"use client";

import type { LogLine } from "@/app/ops/mock-data";

export function ExecutionLog({
  lines,
  isStreaming = false,
}: {
  lines: LogLine[];
  isStreaming?: boolean;
}) {
  return (
    <div className="border border-[var(--ops-border)] bg-[var(--ops-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--ops-border)] px-4 py-2">
        <span className="font-mono text-xs font-medium text-[var(--ops-primary)]/70">
          Execution Log
        </span>
        {isStreaming && (
          <span className="ops-pulse-running font-mono text-xs text-[var(--ops-running)]">
            Streaming
          </span>
        )}
      </div>
      <pre className="max-h-[240px] overflow-auto p-4 font-mono text-xs leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2">
            <span className="shrink-0 text-[var(--ops-primary)]/50">
              [{line.timestamp}]
            </span>
            <span
              className="shrink-0"
              style={{ color: line.stageColor }}
            >
              [{line.stage}]
            </span>
            <span className="text-[var(--ops-primary)]">{line.message}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}
