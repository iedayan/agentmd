"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function OpsSettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [pipelineFailures, setPipelineFailures] = useState(true);
  const [approvalRequests, setApprovalRequests] = useState(true);
  const [policyViolations, setPolicyViolations] = useState(false);
  const [apiKeyPrefix, setApiKeyPrefix] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/account/notifications", { cache: "no-store" }).then((r) =>
        r.json()
      ),
      fetch("/api/account/api-keys", { cache: "no-store" }).then((r) =>
        r.json()
      ),
    ])
      .then(([notif, keys]) => {
        const n = notif as {
          webhookUrl?: string;
          emailAlerts?: boolean;
          slackAlerts?: boolean;
        };
        const k = keys as { keys?: Array<{ prefix: string }> };
        if (typeof n.webhookUrl === "string") setWebhookUrl(n.webhookUrl);
        if (typeof n.emailAlerts === "boolean") {
          setPipelineFailures(n.emailAlerts);
          setApprovalRequests(n.emailAlerts);
        }
        if (typeof n.slackAlerts === "boolean")
          setPolicyViolations(n.slackAlerts);
        const first = k.keys?.[0];
        if (first?.prefix) setApiKeyPrefix(first.prefix);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/account/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl,
          emailAlerts: pipelineFailures || approvalRequests,
          slackAlerts: policyViolations,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(data.error ?? "Failed to save preferences.");
      }
    } catch {
      alert("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-[var(--radius-md)] border border-border bg-card p-8">
          <p className="font-mono text-sm text-muted-foreground animate-pulse">
            Loading settings…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="rounded-[var(--radius-md)] border border-border bg-card p-8">
        <h2 className="text-xl font-bold tracking-tight text-[var(--ops-primary)]">
          Settings
        </h2>
        <p className="mt-2 font-mono text-sm text-muted-foreground mb-8">
          Configure API keys, webhooks, and notifications.
        </p>
        <div className="space-y-6 max-w-xl">
          <div>
            <label className="font-mono text-xs text-muted-foreground block mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKeyPrefix ?? ""}
              readOnly
              placeholder="agentmd_••••••••••••••••"
              className="w-full rounded-[var(--radius-sm)] border border-input bg-muted px-3 py-2 font-mono text-sm text-foreground/80"
            />
            <p className="mt-1 font-mono text-xs text-muted-foreground/80">
              <Link
                href="/dashboard/settings"
                className="text-primary hover:underline"
              >
                Manage API keys in Dashboard → Settings
              </Link>
            </p>
          </div>
          <div>
            <label className="font-mono text-xs text-muted-foreground block mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="w-full rounded-[var(--radius-sm)] border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground"
            />
            <p className="mt-1 font-mono text-xs text-muted-foreground/80">
              Receive execution completion events
            </p>
          </div>
          <div>
            <label className="font-mono text-xs text-muted-foreground block mb-2">
              Notifications
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-mono text-sm text-foreground/80">
                <input
                  type="checkbox"
                  checked={pipelineFailures}
                  onChange={(e) => setPipelineFailures(e.target.checked)}
                  className="rounded-[var(--radius-sm)]"
                />
                Pipeline failures
              </label>
              <label className="flex items-center gap-2 font-mono text-sm text-foreground/80">
                <input
                  type="checkbox"
                  checked={approvalRequests}
                  onChange={(e) => setApprovalRequests(e.target.checked)}
                  className="rounded-[var(--radius-sm)]"
                />
                Approval requests
              </label>
              <label className="flex items-center gap-2 font-mono text-sm text-foreground/80">
                <input
                  type="checkbox"
                  checked={policyViolations}
                  onChange={(e) => setPolicyViolations(e.target.checked)}
                  className="rounded-[var(--radius-sm)]"
                />
                Policy violations
              </label>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-4 h-9 bg-primary px-4 font-mono text-sm font-medium text-primary-foreground rounded-[var(--radius-sm)] hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
