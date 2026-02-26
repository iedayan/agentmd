"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  FileText,
  BarChart3,
  Server,
  CheckCircle,
  Activity,
  Lock,
  Globe,
  Database,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/core/utils";

const ENTERPRISE_FEATURES = [
  {
    icon: Server,
    title: "Self-Hosted",
    desc: "Docker, Kubernetes, air-gapped support for full data sovereignty.",
    href: "/dashboard/enterprise/deploy",
    status: "available"
  },
  {
    icon: Shield,
    title: "SSO/SAML",
    desc: "Okta, Azure AD, Google Workspace integration.",
    href: "/dashboard/enterprise/sso",
    status: "available"
  },
  {
    icon: Users,
    title: "RBAC",
    desc: "Custom roles, granular permissions, and team isolation.",
    href: "/dashboard/enterprise/team",
    status: "available"
  },
  {
    icon: FileText,
    title: "Audit Logs",
    desc: "Who ran what when — SOC2, HIPAA ready with PII masking.",
    href: "/dashboard/audit",
    status: "available"
  },
  {
    icon: CheckCircle,
    title: "Approval Workflows",
    desc: "Human-in-the-loop governance for high-stakes agent actions.",
    href: "/dashboard/enterprise/approvals",
    status: "available"
  },
  {
    icon: Terminal,
    title: "Policy-as-Code",
    desc: "YAML guardrails enforced at runtime by the AgentMD engine.",
    href: "/dashboard/enterprise/policies",
    status: "available"
  },
];

export function EnterpriseOverview() {
  return (
    <div className="space-y-10">
      <div className="glass-card bg-gradient-to-br from-primary/10 via-background to-background p-1 border-beam relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-700">
          <Shield className="h-32 w-32 -mr-8 -mt-8 text-primary group-hover:rotate-12 group-hover:scale-110" />
        </div>
        <CardHeader className="relative z-10 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <Lock className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase border-primary/30 text-primary">Active Subscription</Badge>
          </div>
          <CardTitle className="text-3xl font-black text-gradient">Enterprise Control Plane</CardTitle>
          <CardDescription className="text-base font-medium text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Your high-security infrastructure for governed agentic operations.
            $249/month — SOC2 certified, air-gapped ready, 99.9% uptime SLA.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 relative z-10">
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Globe, label: "SSO Active" },
              { icon: Database, label: "Vault Sync" },
              { icon: Shield, label: "SOC2 Compliance" }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 text-[11px] font-bold text-primary/80">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ENTERPRISE_FEATURES.map((f) => (
          <Link key={f.title} href={f.href} className="group h-full">
            <div className={cn(
              "bento-card h-full p-1 transition-all duration-500 hover:border-primary/40",
              f.status === "locked" && "opacity-80 grayscale-[0.5]"
            )}>
              <CardHeader className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 shadow-sm border border-border/40">
                    <f.icon className="h-6 w-6" />
                  </div>
                  {f.status === "locked" ? (
                    <Badge variant="secondary" className="text-[9px] font-black tracking-widest uppercase opacity-60">Locked</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase border-emerald-500/30 text-emerald-500 bg-emerald-500/5 animate-glow-pulse">Active</Badge>
                  )}
                </div>
                <CardTitle className="text-xl font-black text-foreground/90 tracking-tight">{f.title}</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground leading-relaxed mt-2 line-clamp-2">
                  {f.desc}
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <span className="text-[10px] font-black text-primary group-hover:underline tracking-widest uppercase flex items-center gap-2">
                  Manage Module
                  <Activity className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
