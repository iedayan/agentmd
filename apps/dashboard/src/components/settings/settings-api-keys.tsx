"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_KEYS = [
  { id: "1", name: "CLI / CI", prefix: "agentmd_", lastUsed: "2 hours ago" },
  { id: "2", name: "API integrations", prefix: "agentmd_", lastUsed: "1 day ago" },
];

export function SettingsApiKeys() {
  const [keys] = useState(PLACEHOLDER_KEYS);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    // Placeholder: would call API to generate key
    await new Promise((r) => setTimeout(r, 800));
    setGenerating(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Use API keys for CLI, CI/CD, and programmatic access. Keep them secret.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">{key.name}</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {key.prefix}••••••••••••••••
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last used {key.lastUsed}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" disabled>
                  Copy
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating..." : "Generate new key"}
        </Button>
      </CardContent>
    </Card>
  );
}
