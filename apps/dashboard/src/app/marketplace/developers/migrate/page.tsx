"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";
import { convertToAgentsMd } from "@/lib/agents/migrate-to-agents-md";

const SOURCES = [
  { id: "claude", name: "CLAUDE.md", desc: "Claude Code / Cursor" },
  { id: "cursorrules", name: ".cursorrules", desc: "Cursor rules file" },
  { id: "aider", name: ".aider.conf.yml", desc: "Aider conventions" },
  { id: "gemini", name: ".gemini/settings.json", desc: "Gemini CLI" },
];

export default function MigratePage() {
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [converting, setConverting] = useState(false);

  const handleConvert = async (id: string) => {
    setSourceId(id);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setConverting(true);
    try {
      const result = convertToAgentsMd(input, id);
      setOutput(result);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold">Migration Tools</h1>
        <p className="text-muted-foreground mt-2">
          Convert from CLAUDE.md, .cursorrules, and other formats to AGENTS.md
        </p>

        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-sm">
            <strong>Tip:</strong> Use the{" "}
            <a
              href="https://github.com/getsentry/skills"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              agents-md skill
            </a>
            {" "}
            in Cursor or Claude to help generate and manage AGENTS.md files.
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Paste your source content</CardTitle>
            <CardDescription>
              We&apos;ll convert your existing agent instructions to AGENTS.md format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste CLAUDE.md, .cursorrules, or similar content here..."
              className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y"
              rows={6}
            />
            <div className="flex flex-wrap gap-2">
              {SOURCES.map((s) => (
                <Button
                  key={s.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleConvert(s.id)}
                  disabled={converting || !input.trim()}
                >
                  {converting && sourceId === s.id ? "Converting..." : `From ${s.name}`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {output && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>AGENTS.md output</CardTitle>
              <CardDescription>
                Copy and save as AGENTS.md in your repo root
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                {output}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  navigator.clipboard.writeText(output);
                }}
              >
                Copy to clipboard
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
