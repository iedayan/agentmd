"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const TABS = [
  { id: "pipelines", label: "Pipelines" },
  { id: "policies", label: "Policies" },
  { id: "audit", label: "Audit Log" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
] as const;

export function OpsNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (id: string) => void }) {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/" className="font-bold text-lg tracking-tight text-foreground group">
          Agent<span className="text-primary">MD</span>
          <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">Live Demo</span>
        </Link>
        <nav className="flex items-center gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-4 py-2 font-mono text-xs font-bold transition-all duration-[var(--duration-base)] ${isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
                )}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button className="h-8 rounded-[var(--radius-sm)] bg-primary px-4 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 transition-all btn-tactile">
            Deploy
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
