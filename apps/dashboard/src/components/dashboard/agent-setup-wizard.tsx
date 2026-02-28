'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronRight, ChevronLeft, Shield, Lock, Zap, Copy } from 'lucide-react';
import {
  GOVERNANCE_TEMPLATES,
  BASELINE_SECURITY_TEMPLATE,
  type GovernanceTemplate,
} from '@/lib/agents/governance-templates';
import { cn } from '@/lib/core/utils';

const PROJECT_TYPES = [
  {
    id: 'node',
    name: 'Node.js (pnpm/npm)',
    icon: Zap,
    commands: '## Build\n`pnpm install`\n`pnpm run build`\n\n## Test\n`pnpm test`',
  },
  {
    id: 'python',
    name: 'Python (pip/poetry)',
    icon: Zap,
    commands: '## Setup\n`pip install -r requirements.txt`\n\n## Test\n`pytest`',
  },
  {
    id: 'rust',
    name: 'Rust (cargo)',
    icon: Zap,
    commands: '## Build\n`cargo build`\n\n## Test\n`cargo test`',
  },
  {
    id: 'go',
    name: 'Go',
    icon: Zap,
    commands: '## Build\n`go build ./...`\n\n## Test\n`go test ./...`',
  },
];

export function AgentSetupWizard() {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    name: '',
    type: 'node',
    templateId: BASELINE_SECURITY_TEMPLATE.id,
  });
  const [copied, setCopied] = useState(false);

  const selectedType = PROJECT_TYPES.find((t) => t.id === projectData.type) || PROJECT_TYPES[0];
  const selectedTemplate =
    (GOVERNANCE_TEMPLATES as GovernanceTemplate[]).find((t) => t.id === projectData.templateId) ||
    BASELINE_SECURITY_TEMPLATE;

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const generatedMd = `---
name: ${projectData.name || 'my-agent'}
version: "1.0"
${JSON.stringify(selectedTemplate.frontmatter, null, 2).replace(/^{|}$/g, '').trim()}
---

# ${projectData.name || 'Agent'} instructions

${selectedType.commands}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center font-bold',
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {step > 1 ? <Check className="h-5 w-5" /> : '1'}
          </div>
          <div className={cn('h-px w-12 bg-border', step > 1 && 'bg-primary')} />
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center font-bold',
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {step > 2 ? <Check className="h-5 w-5" /> : '2'}
          </div>
          <div className={cn('h-px w-12 bg-border', step > 2 && 'bg-primary')} />
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center font-bold',
              step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            3
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Step {step} of 3
          </p>
          <p className="text-sm font-semibold">
            {step === 1 ? 'Project Identity' : step === 2 ? 'Governance Policy' : 'Final Review'}
          </p>
        </div>
      </div>

      {step === 1 && (
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle>Define your Agent</CardTitle>
            <CardDescription>Tell us about the repository this agent will govern.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent Name</label>
              <Input
                placeholder="e.g. backend-reviewer"
                value={projectData.name}
                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Type</label>
              <div className="grid grid-cols-2 gap-4">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setProjectData({ ...projectData, type: t.id })}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                      projectData.type === t.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50',
                    )}
                  >
                    <t.icon
                      className={cn(
                        'h-5 w-5',
                        projectData.type === t.id ? 'text-primary' : 'text-muted-foreground',
                      )}
                    />
                    <span className="font-medium text-sm">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button onClick={nextStep} disabled={!projectData.name}>
              Next: Governance <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle>Choose Governance Template</CardTitle>
            <CardDescription>Select the guardrails and permissions for this agent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(GOVERNANCE_TEMPLATES as GovernanceTemplate[]).map((t) => (
              <button
                key={t.id}
                onClick={() => setProjectData({ ...projectData, templateId: t.id })}
                className={cn(
                  'w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all',
                  projectData.templateId === t.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50',
                )}
              >
                <div
                  className={cn(
                    'mt-1 p-2 rounded-lg',
                    projectData.templateId === t.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {t.id === 'strict-compliance' ? (
                    <Lock className="h-5 w-5" />
                  ) : (
                    <Shield className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                </div>
                {projectData.templateId === t.id && <Check className="mt-1 h-5 w-5 text-primary" />}
              </button>
            ))}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={nextStep}>
              Next: Review <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle>Review AGENTS.md</CardTitle>
            <CardDescription>
              Your agent is ready. Place this file in your repository root.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative group">
              <pre className="p-6 rounded-xl bg-muted/50 border border-border/50 text-sm font-mono overflow-auto max-h-[400px]">
                <code>{generatedMd}</code>
              </pre>
              <Button
                size="icon"
                variant="outline"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20 flex gap-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary h-fit">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Pro Tip: CLI Initialization</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You can also run <code className="bg-muted px-1 rounded">agentmd init</code> in
                  your terminal to achieve the same result with auto-detection.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyToClipboard}>
                {copied ? 'Copied!' : 'Copy Markdown'}
              </Button>
              <Button className="bg-primary hover:bg-primary/90">Go to Repository</Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
