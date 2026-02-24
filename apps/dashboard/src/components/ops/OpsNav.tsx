"use client";

import Link from "next/link";
import { User } from "lucide-react";

const TABS = [
  { id: "pipelines", label: "Pipelines" },
  { id: "policies", label: "Policies" },
  { id: "audit", label: "Audit Log" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
] as const;

export function OpsNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (id: string) => void }) {
  return (
    <header className="border-b border-[var(--ops-border)] bg-[var(--ops-panel)]">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/ops" className="font-mono text-lg font-bold text-[var(--ops-primary)]">
          Agent<sup className="text-[var(--ops-accent)]">MD</sup>
        </Link>
        <nav className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 font-mono text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-[var(--ops-primary)] text-[var(--ops-primary)]"
                  : "text-[var(--ops-primary)]/70 hover:text-[var(--ops-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <button className="h-9 rounded bg-[var(--ops-primary)] px-4 font-mono text-sm font-medium text-white hover:opacity-90 transition-opacity">
            New Pipeline
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--ops-border)] text-[var(--ops-primary)]">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
