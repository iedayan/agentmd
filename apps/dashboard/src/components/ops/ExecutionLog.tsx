'use client';

import type { LogLine } from '@/lib/ops/mock-data';

export function ExecutionLog({
  lines,
  isStreaming = false,
}: {
  lines: LogLine[];
  isStreaming?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-muted/30">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-xs font-medium text-muted-foreground">Execution Log</span>
        {isStreaming && (
          <span className="ops-pulse-running font-mono text-xs text-primary">Streaming</span>
        )}
      </div>
      <pre className="max-h-[240px] overflow-auto p-4 font-mono text-xs leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2">
            <span className="shrink-0 text-muted-foreground">[{line.timestamp}]</span>
            <span className="shrink-0" style={{ color: line.stageColor }}>
              [{line.stage}]
            </span>
            <span className="text-foreground">{line.message}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}
