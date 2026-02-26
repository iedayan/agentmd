"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  History,
  Settings,
  Shield,
  BarChart3,
  Store,
  Activity,
  Menu,
  X,
  LogOut,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/core/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/brand/logo";

const nav = [
  { href: "/dashboard", label: "Repositories", icon: LayoutDashboard },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/dashboard/executions", label: "Executions", icon: History },
  { href: "/dashboard/approvals", label: "Approvals", icon: CheckCircle2 },
  { href: "/dashboard/enterprise", label: "Enterprise", icon: Shield },
  { href: "/dashboard/enterprise/runbook", label: "Ops Runbook", icon: Activity },
  { href: "/dashboard/audit", label: "Audit Logs", icon: History },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/workflows/approvals", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { ok?: boolean; approvals?: Array<{ status: string }> }) => {
        if (d.ok && Array.isArray(d.approvals)) {
          setPendingApprovals(d.approvals.filter((a) => a.status === "pending").length);
        }
      })
      .catch(() => setPendingApprovals(null));
  }, [pathname]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile header bar - only on small screens */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-xl px-4 md:hidden">
        <button
          type="button"
          className="p-2 -m-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="font-semibold">AgentMD</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      {/* Sidebar - drawer on mobile, static on desktop */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-border/40 bg-background transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "md:static md:z-auto md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/40 px-6">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="font-bold tracking-tight text-foreground/90">AgentMD</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              className="md:hidden p-2 -m-2 rounded-xl hover:bg-muted transition-colors"
              onClick={closeMobile}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {nav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const showBadge = item.href === "/dashboard/approvals" && pendingApprovals != null && pendingApprovals > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-primary/15 text-primary border-luminescent border-primary/25 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    : "text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-all duration-300 group-hover:scale-125",
                  isActive ? "text-primary filter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "text-muted-foreground/60 group-hover:text-foreground"
                )} />
                <span className="relative z-10">{item.label}</span>
                {showBadge && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black flex items-center justify-center animate-pulse border border-amber-500/30">
                    {pendingApprovals}
                  </span>
                )}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full shadow-[0_0_12px_hsl(var(--primary))]" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/40 p-5 space-y-4">
          <div className="glass-card bg-primary/5 border-primary/20 p-4 relative overflow-hidden group border-luminescent mb-2">
            <div className="absolute top-0 right-0 p-2 opacity-10 transition-all duration-500 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-12">
              <Shield className="h-14 w-14 -mr-4 -mt-4 text-primary" />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Free Plan</p>
            <p className="mt-1.5 text-xs font-bold text-foreground/80">3 repos · 100 min/mo</p>
            <Link href="/dashboard/settings/billing" onClick={closeMobile}>
              <span className="mt-4 block text-[11px] font-black text-primary hover:underline flex items-center gap-1.5 transition-all group-hover:gap-2.5">
                UPGRADE TO PRO
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
