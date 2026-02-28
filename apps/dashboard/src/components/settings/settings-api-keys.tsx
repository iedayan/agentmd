'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ApiKey = { id: string; name: string; prefix: string; lastUsed: string; createdAt?: string };

export function SettingsApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState<{ key: string; name: string } | null>(null);

  const fetchKeys = useCallback(() => {
    fetch('/api/account/api-keys', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d: { ok?: boolean; keys?: ApiKey[] }) => {
        setKeys(d.keys ?? []);
      });
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleGenerate = async () => {
    setGenerating(true);
    setNewKey(null);
    try {
      const res = await fetch('/api/account/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'API Key' }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        key?: string;
        name?: string;
        prefix?: string;
        error?: string;
      };
      if (res.ok && data.key) {
        setNewKey({ key: data.key, name: data.name ?? 'API Key' });
        fetchKeys();
      } else {
        alert(data.error ?? 'Failed to generate key.');
      }
    } catch {
      alert('Failed to generate key.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this key? It will stop working immediately.')) return;
    const res = await fetch(`/api/account/api-keys/${id}`, { method: 'DELETE' });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (res.ok && data.ok) {
      fetchKeys();
    } else {
      alert(data.error ?? 'Failed to revoke key.');
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
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
        {newKey && (
          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Copy your new key now. It won&apos;t be shown again.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-sm">
                {newKey.key}
              </code>
              <Button variant="outline" size="sm" onClick={() => handleCopy(newKey.key)}>
                Copy
              </Button>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {keys.map((key) => (
            <div key={key.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{key.name}</p>
                <p className="text-sm text-muted-foreground font-mono">{key.prefix}</p>
                <p className="text-xs text-muted-foreground mt-1">Last used {key.lastUsed}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleRevoke(key.id)}>
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating...' : 'Generate new key'}
        </Button>
      </CardContent>
    </Card>
  );
}
