"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SettingsNotifications() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    // Placeholder: would call API to save preferences
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved" : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
