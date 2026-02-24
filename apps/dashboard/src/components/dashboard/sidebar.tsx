"use client";

import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/core/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/brand/logo";

const nav = [
  { href: "/dashboard", label: "Repositories", icon: LayoutDashboard },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/dashboard/executions", label: "Executions", icon: History },
  { href: "/dashboard/enterprise", label: "Enterprise", icon: Shield },
  { href: "/dashboard/enterprise/runbook", label: "Ops Runbook", icon: Activity },
  { href: "/dashboard/audit", label: "Audit Logs", icon: History },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          "fixed top-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl transition-transform duration-200 ease-out",
          "md:static md:z-auto md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-semibold">AgentMD</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="md:hidden p-2 -m-2 rounded-lg hover:bg-muted transition-colors"
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
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4 space-y-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">Free Plan</p>
            <p className="mt-1 text-sm">3 repos · 100 min/mo</p>
            <Link href="/dashboard/settings/billing" onClick={closeMobile}>
              <span className="mt-2 block text-xs text-primary hover:underline">
                Upgrade to Pro
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
