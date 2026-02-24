"use client";

import { useState } from "react";
import type { PolicyRule } from "@/app/ops/mock-data";

export function PoliciesTab({ policies }: { policies: PolicyRule[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = policies.filter(
    (p) =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <input
          type="text"
          placeholder="Search policies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-64 rounded border border-[var(--ops-border)] bg-[var(--ops-panel)] px-3 font-mono text-sm text-[var(--ops-primary)] placeholder:text-[var(--ops-primary)]/50"
        />
        <button className="h-9 rounded bg-[var(--ops-primary)] px-4 font-mono text-sm font-medium text-white hover:opacity-90 transition-opacity">
          New Policy Rule
        </button>
      </div>
      <div className="border border-[var(--ops-border)] bg-[var(--ops-panel)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--ops-border)]">
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ops-primary)]/70">
                Rule ID
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ops-primary)]/70">
                Description
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ops-primary)]/70">
                Enforcement
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ops-primary)]/70">
                Scope
              </th>
              <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ops-primary)]/70">
                Last Triggered
              </th>
              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-b border-[var(--ops-border)] hover:bg-[var(--ops-bg)]"
              >
                <td className="px-4 py-3 font-mono text-sm">{p.id}</td>
                <td className="px-4 py-3 font-mono text-sm text-[var(--ops-primary)]/90">
                  {p.description}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-[2px] px-2 py-0.5 font-mono text-xs"
                    style={{
                      backgroundColor:
                        p.enforcement === "block"
                          ? "rgba(220,38,38,0.1)"
                          : p.enforcement === "require_approval"
                          ? "rgba(217,119,6,0.1)"
                          : "rgba(22,163,74,0.1)",
                      color:
                        p.enforcement === "block"
                          ? "var(--ops-failed)"
                          : p.enforcement === "require_approval"
                          ? "var(--ops-pending)"
                          : "var(--ops-passed)",
                    }}
                  >
                    {p.enforcement === "block"
                      ? "Block"
                      : p.enforcement === "require_approval"
                      ? "Require Approval"
                      : "Warn"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-[var(--ops-primary)]/70">
                  {p.scope}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-[var(--ops-primary)]/60">
                  {p.lastTriggered}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditing(p.id)}
                    className="font-mono text-xs text-[var(--ops-primary)]/70 underline hover:text-[var(--ops-primary)]"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md border-l border-[var(--ops-border)] bg-[var(--ops-panel)] p-6 shadow-[-4px_0_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-semibold">Edit Policy</h3>
            <button
              onClick={() => setEditing(null)}
              className="font-mono text-xs text-[var(--ops-primary)]/60"
            >
              Close
            </button>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block font-mono text-xs text-[var(--ops-primary)]/70">
                Rule name
              </label>
              <input
                type="text"
                defaultValue={policies.find((p) => p.id === editing)?.id}
                className="w-full rounded border border-[var(--ops-border)] bg-[var(--ops-panel)] p-2 font-mono text-sm text-[var(--ops-primary)] placeholder:text-[var(--ops-primary)]/50"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs text-[var(--ops-primary)]/70">
                Condition expression
              </label>
              <textarea
                rows={4}
                className="w-full rounded border border-[var(--ops-border)] bg-[var(--ops-panel)] p-2 font-mono text-sm text-[var(--ops-primary)] placeholder:text-[var(--ops-primary)]/50"
                placeholder="tool == 'web_search'"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs text-[var(--ops-primary)]/70">
                Enforcement level
              </label>
              <select className="w-full rounded border border-[var(--ops-border)] bg-[var(--ops-panel)] p-2 font-mono text-sm text-[var(--ops-primary)]">
                <option>Block</option>
                <option>Warn</option>
                <option>Require Approval</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs text-[var(--ops-primary)]/70">
                Approver group
              </label>
              <input
                type="text"
                placeholder="platform-team"
                className="w-full rounded border border-[var(--ops-border)] bg-[var(--ops-panel)] p-2 font-mono text-sm text-[var(--ops-primary)] placeholder:text-[var(--ops-primary)]/50"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
