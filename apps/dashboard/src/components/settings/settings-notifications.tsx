"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SettingsNotifications() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);

  useEffect(() => {
    fetch("/api/account/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { ok?: boolean; webhookUrl?: string; emailAlerts?: boolean; slackAlerts?: boolean }) => {
        if (typeof d.webhookUrl === "string") setWebhookUrl(d.webhookUrl);
        if (typeof d.emailAlerts === "boolean") setEmailAlerts(d.emailAlerts);
        if (typeof d.slackAlerts === "boolean") setSlackAlerts(d.slackAlerts);
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
        body: JSON.stringify({ webhookUrl, emailAlerts, slackAlerts }),
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure how you receive execution alerts and updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium block mb-2">Webhook URL</label>
          <Input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.slack.com/..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Receive execution completion events. Slack, Discord, or custom endpoint.
          </p>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium block">Email</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Pipeline failures and approval requests</span>
          </label>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium block">Slack</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={slackAlerts}
              onChange={(e) => setSlackAlerts(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Connect Slack workspace (Pro)</span>
          </label>
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? "Saving..." : saved ? "Saved" : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
