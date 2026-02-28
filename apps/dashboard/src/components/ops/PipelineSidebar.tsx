'use client';

import type { Pipeline, PipelineStatus } from '@/lib/ops/mock-data';

const STATUS_GROUPS: { status: PipelineStatus; label: string }[] = [
  { status: 'running', label: 'Running' },
  { status: 'awaiting_approval', label: 'Awaiting Approval' },
  { status: 'failed', label: 'Failed' },
  { status: 'completed', label: 'Completed' },
];

export function PipelineSidebar({
  pipelines,
  selectedId,
  onSelect,
}: {
  pipelines: Pipeline[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const byStatus = STATUS_GROUPS.map(({ status, label }) => ({
    label,
    status,
    items: pipelines.filter((p) => p.status === status),
  }));

  return (
    <aside className="w-[280px] shrink-0 border-r border-border bg-card/50 p-4 space-y-8">
      {byStatus.map((group) => (
        <div key={group.status}>
          <h3 className="mb-3 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {group.label} — {group.items.length}
          </h3>
          <ul className="space-y-1">
            {group.items.map((p) => {
              const isActive = selectedId === p.id;
              return (
                <li key={p.id}>
                  <button
                    onClick={() => onSelect(p.id)}
                    className={`w-full group relative overflow-hidden rounded-[var(--radius-md)] px-4 py-3 text-left transition-all duration-base ${
                      isActive
                        ? 'bg-[hsl(var(--primary-dim))] text-primary border border-primary/20'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <div className="font-bold text-sm tracking-tight truncate">{p.name}</div>
                    <div className="mt-1 flex items-center justify-between font-mono text-[9px] font-bold uppercase tracking-widest opacity-60">
                      <span>{p.sourceRef}</span>
                      <span>{p.timestamp}</span>
                    </div>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-primary rounded-r-full shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
