"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type SsoConfig = {
  enabled: boolean;
  provider: "okta" | "azure-ad" | "google-workspace" | "custom";
  entityId: string;
  ssoUrl: string;
  enforceSso: boolean;
  updatedAt: string;
};

type ComplianceArtifact = {
  id: string;
  framework: "SOC2" | "ISO27001" | "HIPAA";
  name: string;
  status: "ready" | "in_progress";
  lastGeneratedAt: string;
};

export default function SSOPage() {
  const [config, setConfig] = useState<SsoConfig>({
    enabled: false,
    provider: "okta",
    entityId: "",
    ssoUrl: "",
    enforceSso: false,
    updatedAt: "",
  });
  const [compliance, setCompliance] = useState<ComplianceArtifact[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [ssoRes, complianceRes] = await Promise.all([
      fetch("/api/enterprise/sso", { cache: "no-store" }),
      fetch("/api/enterprise/compliance", { cache: "no-store" }),
    ]);
    const ssoBody = (await ssoRes.json()) as {
      ok?: boolean;
      sso?: SsoConfig;
      error?: string;
    };
    const complianceBody = (await complianceRes.json()) as {
      ok?: boolean;
      artifacts?: ComplianceArtifact[];
      error?: string;
    };
    if (!ssoRes.ok || ssoBody.ok === false) {
      setError(ssoBody.error ?? "Failed to load SSO.");
      return;
    }
    if (!complianceRes.ok || complianceBody.ok === false) {
      setError(complianceBody.error ?? "Failed to load compliance artifacts.");
      return;
    }
    setConfig(ssoBody.sso ?? config);
    setCompliance(complianceBody.artifacts ?? []);
    setError(null);
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    const res = await fetch("/api/enterprise/sso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      sso?: SsoConfig;
      error?: string;
    };
    if (!res.ok || body.ok === false) {
      setError(body.error ?? "Failed to save SSO config.");
      return;
    }
    setConfig(body.sso ?? config);
    setMessage("SSO configuration updated.");
  };

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SSO / Enterprise Controls</h1>
        <p className="text-muted-foreground">
          Configure SAML SSO and review compliance artifacts for audits.
        </p>
      </div>
      {message ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Identity Provider Configuration</CardTitle>
          <CardDescription>Configure SAML provider and SSO enforcement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Provider</span>
              <select
                value={config.provider}
                onChange={(event) =>
                  setConfig((prev) => ({ ...prev, provider: event.target.value as SsoConfig["provider"] }))
                }
                className="w-full rounded border bg-background px-3 py-2"
              >
                <option value="okta">Okta</option>
                <option value="azure-ad">Azure AD</option>
                <option value="google-workspace">Google Workspace</option>
                <option value="custom">Custom SAML</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Entity ID</span>
              <Input
                value={config.entityId}
                onChange={(event) => setConfig((prev) => ({ ...prev, entityId: event.target.value }))}
                placeholder="https://agentmd.yourcompany.com/saml/metadata"
              />
            </label>
          </div>
          <label className="space-y-1 text-sm">
            <span className="font-medium">SSO URL</span>
            <Input
              value={config.ssoUrl}
              onChange={(event) => setConfig((prev) => ({ ...prev, ssoUrl: event.target.value }))}
              placeholder="https://idp.yourcompany.com/sso"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={config.enabled ? "default" : "outline"}
              onClick={() => setConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
            >
              {config.enabled ? "SSO Enabled" : "Enable SSO"}
            </Button>
            <Button
              variant={config.enforceSso ? "default" : "outline"}
              onClick={() => setConfig((prev) => ({ ...prev, enforceSso: !prev.enforceSso }))}
            >
              {config.enforceSso ? "Enforce SSO" : "Optional SSO"}
            </Button>
            <Button onClick={() => void save()}>Save Configuration</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Last updated: {config.updatedAt ? new Date(config.updatedAt).toLocaleString() : "Never"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Artifacts</CardTitle>
          <CardDescription>Evidence packs for SOC2, ISO27001, and HIPAA audits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {compliance.map((artifact) => (
            <div key={artifact.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {artifact.framework}: {artifact.name}
                </p>
                <Badge variant={artifact.status === "ready" ? "success" : "warning"}>
                  {artifact.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last generated: {new Date(artifact.lastGeneratedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
