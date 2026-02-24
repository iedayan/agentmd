"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";
import { FRAMEWORK_TEMPLATES } from "@/lib/agents/agents-md-templates";

const FRAMEWORKS = Object.keys(FRAMEWORK_TEMPLATES);

export default function GeneratorPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [output, setOutput] = useState("");

  const handleGenerate = () => {
    const template = selected
      ? FRAMEWORK_TEMPLATES[selected]
      : FRAMEWORK_TEMPLATES["Node.js / pnpm"];
    setOutput(template);
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold">AGENTS.md Generator</h1>
        <p className="text-muted-foreground mt-2">
          Generate AGENTS.md for popular frameworks
        </p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Select Framework</CardTitle>
            <CardDescription>
              We&apos;ll generate a tailored AGENTS.md with build, test, and lint commands
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {FRAMEWORKS.map((fw) => (
              <Button
                key={fw}
                variant={selected === fw ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelected(fw)}
              >
                {fw}
              </Button>
            ))}
            <Button
              className="w-full mt-4"
              onClick={handleGenerate}
            >
              Generate AGENTS.md
            </Button>
          </CardContent>
        </Card>

        {output && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Generated AGENTS.md</CardTitle>
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
                onClick={() => navigator.clipboard.writeText(output)}
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
