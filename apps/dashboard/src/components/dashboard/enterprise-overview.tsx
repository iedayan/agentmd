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
} from "lucide-react";

const ENTERPRISE_FEATURES = [
  { icon: Server, title: "Self-Hosted", desc: "Docker, Kubernetes, air-gapped", href: "/dashboard/enterprise/deploy" },
  { icon: Shield, title: "SSO/SAML", desc: "Okta, Azure AD, Google Workspace", href: "/dashboard/enterprise/sso" },
  { icon: Users, title: "RBAC", desc: "Custom roles, granular permissions", href: "/dashboard/enterprise/team" },
  { icon: FileText, title: "Audit Logs", desc: "Who ran what when — SOC2, HIPAA", href: "/dashboard/audit" },
  { icon: CheckCircle, title: "Approval Workflows", desc: "Human-in-the-loop, escalation", href: "/dashboard/enterprise/policies" },
  { icon: FileText, title: "Policy-as-Code", desc: "YAML rules, guardrails at runtime", href: "/dashboard/enterprise/policies" },
  { icon: Activity, title: "Ops Runbook", desc: "Readiness checks, webhook health, incident context", href: "/dashboard/enterprise/runbook" },
  { icon: BarChart3, title: "Analytics", desc: "Custom dashboards, ROI, forecasting", href: "/dashboard/analytics" },
];

export function EnterpriseOverview() {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Enterprise Plan
          </CardTitle>
          <CardDescription>
            $249/month — Self-hosted, unlimited seats, 99.9% SLA, dedicated support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Self-Hosted</Badge>
            <Badge variant="secondary">SSO/SAML</Badge>
            <Badge variant="secondary">RBAC</Badge>
            <Badge variant="secondary">Audit Logs</Badge>
            <Badge variant="secondary">Approval Workflows</Badge>
            <Badge variant="secondary">Policy-as-Code</Badge>
            <Badge variant="secondary">99.9% SLA</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ENTERPRISE_FEATURES.map((f) => (
          <Link key={f.title} href={f.href}>
            <Card className="hover:border-primary/50 transition-colors h-full">
              <CardHeader>
                <f.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base">{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
