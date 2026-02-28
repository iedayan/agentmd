'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarketplaceHeader } from '@/components/marketplace/marketplace-header';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function SandboxPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    parsed: {
      sections: { title: string }[];
      commands: { command: string; type: string }[];
      lineCount: number;
    };
    validation: { valid: boolean; errors: { message: string }[]; warnings: { message: string }[] };
    score: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/demo/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to run test');
        return;
      }
      setResult(data);
    } catch {
      setError('Failed to run test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold">Testing Sandbox</h1>
        <p className="text-muted-foreground mt-2">
          Test your AGENTS.md before publishing. We parse and validate without executing.
        </p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Run in Sandbox</CardTitle>
            <CardDescription>
              Paste your AGENTS.md URL (GitHub, GitLab, Bitbucket). We&apos;ll parse and validate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="url"
              placeholder="https://github.com/owner/repo/blob/main/AGENTS.md"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button className="w-full" onClick={handleRun} disabled={loading || !url.trim()}>
              {loading ? 'Running...' : 'Run Test'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Supports GitHub, GitLab, Bitbucket raw URLs.
            </p>
          </CardContent>
        </Card>

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>Parse and validation output</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{result.score}</span>
                  <span className="text-muted-foreground">Agent-readiness score</span>
                </div>
                {result.validation.valid ? (
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-destructive" />
                )}
              </div>
              <div className="text-sm">
                <p>
                  {result.parsed.lineCount} lines · {result.parsed.sections.length} sections ·{' '}
                  {result.parsed.commands.length} commands
                </p>
              </div>
              {result.validation.errors.length > 0 && (
                <div>
                  <p className="font-medium text-destructive mb-2">Errors</p>
                  <ul className="list-disc list-inside text-sm text-destructive">
                    {result.validation.errors.map((e, i) => (
                      <li key={i}>{e.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.validation.warnings.length > 0 && (
                <div>
                  <p className="font-medium text-amber-600 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Warnings
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {result.validation.warnings.map((w, i) => (
                      <li key={i}>{w.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.parsed.commands.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Commands</p>
                  <ul className="space-y-1 text-sm font-mono">
                    {result.parsed.commands.slice(0, 10).map((c, i) => (
                      <li key={i}>
                        [{c.type}] {c.command}
                      </li>
                    ))}
                    {result.parsed.commands.length > 10 && (
                      <li className="text-muted-foreground">
                        ... and {result.parsed.commands.length - 10} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
