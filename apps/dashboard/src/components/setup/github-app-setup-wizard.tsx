"use client";

import { useState, useCallback } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={copy}
      className="shrink-0"
      aria-label={label ?? "Copy"}
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

function ConfigRow({ label, value, description }: { label: string; value: string; description?: string }) {
  return (
    <div className="flex items-start gap-2 py-2">
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        <p className="font-mono text-sm text-muted-foreground truncate mt-1" title={value}>
          {value}
        </p>
      </div>
      <CopyButton value={value} label={`Copy ${label}`} />
    </div>
  );
}

export function GithubAppSetupWizard() {
  const [baseUrl, setBaseUrl] = useState("https://agentmd.io");
  const [webhookSecret, setWebhookSecret] = useState("");

  const normalized = baseUrl.replace(/\/$/, "");
  const isHttps = normalized.startsWith("https://");

  const oauthCallback = `${normalized}/api/auth/callback/github`;
  const webhookUrl = `${normalized}/api/github/webhooks`;
  const callbackUrl = `${normalized}/api/github/callback`;
  const setupUrl = `${normalized}/dashboard`;

  const generatedWebhookSecret = webhookSecret || "[run: openssl rand -hex 32]";

  const envSnippet = `# GitHub OAuth App (required for login)
GITHUB_ID=your_client_id
GITHUB_SECRET=your_client_secret

# GitHub App (optional — repo connection & webhooks)
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\\n...\\n-----END RSA PRIVATE KEY-----"
GITHUB_APP_SLUG=your-app-slug
GITHUB_WEBHOOK_SECRET=${webhookSecret || "your_webhook_secret"}
`;

  const generateSecret = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setWebhookSecret(hex);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Base URL</CardTitle>
          <CardDescription>
            Your app URL (e.g. https://agentmd.io for production, http://localhost:3001 for local dev)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label htmlFor="base-url" className="text-sm font-medium">
              Base URL
            </label>
            <Input
              id="base-url"
              type="url"
              placeholder="https://agentmd.io"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. GitHub OAuth App</CardTitle>
          <CardDescription>
            Required for Sign in with GitHub. Create at{" "}
            <a
              href="https://github.com/settings/developers"
              target="_blank"
              rel="noopener noreferrer"
              className="underline inline-flex items-center gap-1"
            >
              GitHub → OAuth Apps <ExternalLink className="h-3 w-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <ConfigRow
            label="Authorization callback URL"
            value={oauthCallback}
            description="Paste this into the OAuth App settings"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. GitHub App</CardTitle>
          <CardDescription>
            Optional — for repo connection and webhooks. Create at{" "}
            <a
              href="https://github.com/settings/apps/new"
              target="_blank"
              rel="noopener noreferrer"
              className="underline inline-flex items-center gap-1"
            >
              GitHub → GitHub Apps <ExternalLink className="h-3 w-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <ConfigRow label="Webhook URL" value={webhookUrl} />
          <ConfigRow label="Callback URL" value={callbackUrl} />
          <ConfigRow label="Setup URL" value={setupUrl} />
          <div className="flex items-start gap-2 py-2">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm font-medium">Webhook secret</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generate a random string and paste into GitHub App webhook settings
              </p>
              <p className="font-mono text-sm text-muted-foreground mt-1 break-all">
                {generatedWebhookSecret}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={generateSecret}>
                Generate
              </Button>
              <CopyButton value={webhookSecret || "openssl rand -hex 32"} label="Copy webhook secret" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Environment variables</CardTitle>
          <CardDescription>
            Add these to your deployment (Vercel, Railway, etc.) or .env.local
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative flex items-start gap-2">
            <pre className="flex-1 p-4 rounded-lg bg-muted text-sm overflow-x-auto min-w-0">
              <code>{envSnippet}</code>
            </pre>
            <CopyButton value={envSnippet} label="Copy env snippet" />
          </div>
        </CardContent>
      </Card>

      {!isHttps && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-amber-600 dark:text-amber-400">Local development</CardTitle>
            <CardDescription>
              For localhost, create a separate OAuth App with callback{" "}
              <code className="bg-muted px-1 rounded">http://localhost:3001/api/auth/callback/github</code>.
              GitHub requires HTTPS for production.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
