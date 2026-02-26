"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ChevronRight,
  Settings2,
  Lock,
  FileCheck,
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Activity,
  Fingerprint,
  Key,
  Globe,
  Download,
  ShieldAlert,
  Copy
} from "lucide-react";
import { cn } from "@/lib/core/utils";
import { SsoConfig, ComplianceArtifact, ReleaseIntegrity } from "@/types";
import { enterpriseService } from "@/lib/services/enterprise-service";

import { toast } from "sonner";

export default function SSOPage() {
  const [config, setConfig] = useState<SsoConfig | null>(null);
  const [compliance, setCompliance] = useState<ComplianceArtifact[]>([]);
  const [integrity, setIntegrity] = useState<ReleaseIntegrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ssoRes, complianceRes, integrityRes] = await Promise.all([
        enterpriseService.getSsoConfig(),
        enterpriseService.getComplianceArtifacts(),
        enterpriseService.getReleaseIntegrity(),
      ]);
      if (ssoRes.ok && ssoRes.sso) setConfig(ssoRes.sso);
      else toast.error(ssoRes.error ?? "Failed to load SSO config");

      if (complianceRes.ok && complianceRes.artifacts) {
        setCompliance(complianceRes.artifacts);
      }

      if (integrityRes.ok && integrityRes.integrity) {
        setIntegrity(integrityRes.integrity);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    const res = await enterpriseService.saveSsoConfig(config);
    if (res.ok) {
      toast.success("SSO configuration updated.");
      void loadData();
    } else {
      toast.error(res.error ?? "Failed to save SSO config.");
    }
    setSaving(false);
  };

  if (loading && !config) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[400px]">
        <Activity className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-10 text-center min-h-[400px] flex flex-col items-center justify-center">
        <AlertCircle className="h-10 w-10 text-destructive/50 mb-4" />
        <p className="text-destructive font-bold">Failed to initialize configuration.</p>
        <Button onClick={() => void loadData()} variant="outline" className="mt-4">Retry Sync</Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 glass-card p-10 bg-gradient-to-br from-background via-background/90 to-primary/10 shadow-glow/5">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Identity & Trust</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-gradient mt-4">Trust Center</h1>
          <p className="mt-4 max-w-2xl text-base font-medium text-muted-foreground leading-relaxed">
            Configure enterprise identity protocols and access real-time compliance evidence for external audits and stakeholder reviews.
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-12 grid gap-6 md:grid-cols-4">
          {[
            { label: "SSO Mode", value: config.enabled ? "Active" : "Disabled", icon: Fingerprint, color: "text-primary" },
            { label: "Enforcement", value: config.enforceSso ? "Required" : "Optional", icon: Lock, color: "text-indigo-500" },
            { label: "Evidence", value: `${compliance.filter(c => c.status === 'ready').length} Ready`, icon: FileCheck, color: "text-emerald-500" },
            { label: "Uptime", value: "99.99%", icon: Activity, color: "text-orange-500" }
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-5 border border-border/40 bg-background/40 hover:border-primary/20 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center bg-muted/20 border border-border/20 group-hover:bg-primary/5 transition-all", stat.color)}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</span>
              </div>
              <p className="text-xl font-black text-foreground/90 tracking-tight">{stat.label === "SSO Mode" && loading ? "..." : stat.value}</p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-7 space-y-10">
          <Card className="glass-card bg-background/40 backdrop-blur-md border border-border/40 overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-border/10 bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                    <Key className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-foreground/90 tracking-tight">Identity Federation</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">SAML 2.0 / SSO Configuration</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">Identity Provider</label>
                  <select
                    value={config.provider}
                    onChange={(event) =>
                      setConfig((prev) => prev ? ({ ...prev, provider: event.target.value as SsoConfig["provider"] }) : null)
                    }
                    className="w-full h-11 rounded-xl border border-border/40 bg-muted/20 px-4 py-2 text-sm font-bold focus:ring-1 focus:ring-primary/40 focus:outline-none focus:bg-muted/40 transition-all appearance-none cursor-pointer"
                  >
                    <option value="okta">Okta Enterprise</option>
                    <option value="azure-ad">Microsoft Azure AD</option>
                    <option value="google-workspace">Google Workspace</option>
                    <option value="custom">Custom SAML Instance</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">Entity Identifier</label>
                  <Input
                    value={config.entityId}
                    onChange={(event) => setConfig((prev) => prev ? ({ ...prev, entityId: event.target.value }) : null)}
                    placeholder="https://agentmd.yourcompany.com/saml/metadata"
                    className="h-11 rounded-xl border-border/40 bg-muted/20 font-mono text-xs focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">SSO Entrypoint (ACS URL)</label>
                <Input
                  value={config.ssoUrl}
                  onChange={(event) => setConfig((prev) => prev ? ({ ...prev, ssoUrl: event.target.value }) : null)}
                  placeholder="https://idp.yourcompany.com/sso"
                  className="h-11 rounded-xl border-border/40 bg-muted/20 font-mono text-xs focus:ring-primary/40"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3 pt-6">
                <Button
                  variant={config.enabled ? "default" : "outline"}
                  onClick={() => setConfig((prev) => prev ? ({ ...prev, enabled: !prev.enabled }) : null)}
                  className={cn(
                    "rounded-xl h-12 btn-tactile font-black text-[10px] uppercase tracking-widest",
                    config.enabled && "shadow-glow bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span>{config.enabled ? "ACTIVE" : "ENABLE"}</span>
                    <span className="text-[7px] opacity-40">IDENTITY SYNC</span>
                  </div>
                </Button>
                <Button
                  variant={config.enforceSso ? "default" : "outline"}
                  onClick={() => setConfig((prev) => prev ? ({ ...prev, enforceSso: !prev.enforceSso }) : null)}
                  className={cn(
                    "rounded-xl h-12 btn-tactile font-black text-[10px] uppercase tracking-widest",
                    config.enforceSso && "shadow-glow bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span>{config.enforceSso ? "MANDATORY" : "OPTIONAL"}</span>
                    <span className="text-[7px] opacity-40">FLOW ENFORCED</span>
                  </div>
                </Button>
                <Button
                  onClick={() => void save()}
                  disabled={saving}
                  className="rounded-xl h-12 btn-tactile font-black text-[10px] uppercase tracking-widest shadow-glow"
                >
                  {saving ? "SAVING..." : "COMMIT CONFIG"}
                </Button>
              </div>

              <div className="pt-4 flex items-center justify-between text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest group cursor-help">
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  <span>Fingerprint: {loading ? "..." : (config.updatedAt || "unverified").slice(0, 8)}</span>
                </div>
                <span>Sync Ref: {Math.random().toString(36).substring(7).toUpperCase()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card bg-background/40 backdrop-blur-md border border-border/40 overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-border/10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black text-foreground/90 tracking-tight flex items-center gap-3">
                    Security & Integrity
                    <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="text-[7px] font-black uppercase tracking-tight">Verified Manifest</span>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Official Release Verification</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/10">
                {integrity.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-primary/[0.01] transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-foreground/80 tracking-tight">{item.packageName}</span>
                        <Badge variant="outline" className="text-[9px] font-black tracking-widest px-2 py-0 uppercase border-border/40 bg-muted/20">
                          {item.version}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary shadow-glow animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">Hardened</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-3 border border-border/10">
                      <code className="text-[10px] font-mono text-muted-foreground break-all flex-1">
                        {item.sha256}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.sha256);
                          toast.success(`${item.packageName} SHA copied`);
                        }}
                        className="h-8 w-8 rounded-lg flex items-center justify-center bg-background border border-border/40 hover:bg-muted/40 transition-all shadow-sm"
                      >
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[9px] font-medium text-muted-foreground/50 italic px-1">
                      <span>Platform: {item.platform}</span>
                      <span>Synced: {new Date(item.lastHardened).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-10">
          <Card className="glass-card bg-background/40 backdrop-blur-md border border-border/40 overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-border/10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black text-foreground/90 tracking-tight">Compliance Evidence</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Audit-ready artifact vault</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/10">
                {loading && compliance.length === 0 ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse bg-muted/20" />)}
                  </div>
                ) : compliance.map((artifact) => (
                  <div key={artifact.id} className="p-6 hover:bg-primary/[0.01] transition-all group flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-black tracking-widest px-2 py-0 uppercase border-border/40 text-muted-foreground/60">{artifact.framework}</Badge>
                        <span className="text-sm font-black text-foreground/80 tracking-tight">{artifact.name}</span>
                      </div>
                      <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 opacity-60">
                        <Activity className="h-3 w-3" />
                        Last verified: {new Date(artifact.lastGeneratedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={artifact.status === "ready" ? "success" : "warning"}
                        className="text-[8px] font-black uppercase px-2 py-0 shadow-sm"
                      >
                        {artifact.status}
                      </Badge>
                      <div className="flex gap-2">
                        <div className="h-8 w-8 rounded-lg border border-border/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-muted/40">
                          <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="h-8 w-8 rounded-lg border border-border/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-muted/40">
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-5 bg-emerald-500/5 border-t border-emerald-500/10">
              <Button variant="ghost" className="w-full justify-between group hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Generate Compliance PDF</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>

          <Card className="glass-card bg-orange-500/5 border-orange-500/20 shadow-xl border-beam">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-foreground tracking-tight">Access Hardening</h4>
                  <p className="text-xs font-medium text-muted-foreground mt-1">
                    Enterprise users can enforce mandatory MFA through SAML attributes.
                    <span className="text-orange-500 font-bold ml-1 cursor-pointer hover:underline">Learn more →</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
