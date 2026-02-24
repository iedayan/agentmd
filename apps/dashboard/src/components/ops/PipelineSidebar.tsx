"use client";

import type { Pipeline, PipelineStatus } from "@/app/ops/mock-data";

const STATUS_GROUPS: { status: PipelineStatus; label: string }[] = [
  { status: "running", label: "Running" },
  { status: "awaiting_approval", label: "Awaiting Approval" },
  { status: "failed", label: "Failed" },
  { status: "completed", label: "Completed" },
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
    <aside className="w-[260px] shrink-0 border-r border-[var(--ops-border)] bg-[var(--ops-panel)] p-4">
      {byStatus.map((group) => (
        <div key={group.status} className="mb-6">
          <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ops-primary)]/60">
            {group.label} ({group.items.length})
          </h3>
          <ul className="space-y-1">
            {group.items.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => onSelect(p.id)}
                  className={`w-full rounded-none border-l-2 px-3 py-2 text-left transition-colors ${
                    selectedId === p.id
                      ? "border-[var(--ops-primary)] bg-[var(--ops-bg)]"
                      : "border-transparent hover:bg-[var(--ops-bg)]"
                  }`}
                >
                  <div className="font-display text-[var(--ops-primary)]">
                    {p.name}
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-[var(--ops-primary)]/60">
                    {p.sourceRef}
                  </div>
                  <div className="mt-1 flex items-center gap-2 font-mono text-xs text-[var(--ops-primary)]/50">
                    <span>{p.trigger}</span>
                    <span>·</span>
                    <span>{p.timestamp}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
