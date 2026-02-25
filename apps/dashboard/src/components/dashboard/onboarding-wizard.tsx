"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "agentmd-onboarding";
const STEPS = [
  { id: "template", title: "Get AGENTS.md", desc: "Use the setup wizard to create your first AGENTS.md", href: "/dashboard/setup/agent" },
  { id: "connect", title: "Connect a repo", desc: "Add your repository to start monitoring AGENTS.md", href: "/docs/quickstart" },
  { id: "validate", title: "Validate", desc: "AgentMD parses and scores your AGENTS.md on every push", href: "/docs/parse" },
  { id: "execute", title: "Run execution", desc: "Trigger a run or connect GitHub for automatic runs", href: "/docs/execution" },
];

interface StoredState {
  dismissed: boolean;
  completedSteps: string[];
}

function loadStoredState(): StoredState {
  if (typeof window === "undefined") return { dismissed: false, completedSteps: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dismissed: false, completedSteps: [] };
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      dismissed: parsed.dismissed ?? false,
      completedSteps: Array.isArray(parsed.completedSteps) ? parsed.completedSteps : [],
    };
  } catch {
    return { dismissed: false, completedSteps: [] };
  }
}

function saveStoredState(state: StoredState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function OnboardingWizard() {
  const [dismissed, setDismissed] = useState(true); // start hidden until we load
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [reposCount, setReposCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    const stored = loadStoredState();
    setDismissed(stored.dismissed);
    setCompletedSteps(stored.completedSteps);

    try {
      const [reposRes, execsRes] = await Promise.all([
        fetch("/api/repositories", { cache: "no-store" }),
        fetch("/api/executions?limit=1", { cache: "no-store" }),
      ]);
      const reposData = (await reposRes.json()) as { repositories?: unknown[] };
      const execsData = (await execsRes.json()) as { executions?: unknown[]; meta?: { total?: number } };
      const repos = reposData.repositories?.length ?? 0;
      const execs = execsData.meta?.total ?? execsData.executions?.length ?? 0;
      setReposCount(repos);

      const derived: string[] = [];
      if (repos > 0) {
        derived.push("template");
        derived.push("connect");
        derived.push("validate");
      }
      if (execs > 0) derived.push("execute");
      setCompletedSteps((prev) => {
        const merged = Array.from(new Set([...prev, ...derived]));
        if (merged.length !== prev.length) {
          const next = { ...stored, completedSteps: merged };
          saveStoredState(next);
        }
        return merged;
      });
    } catch {
      // keep stored state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  const handleDismiss = () => {
    setDismissed(true);
    saveStoredState({ dismissed: true, completedSteps });
  };

  if (loading || dismissed) return null;

  const allComplete = STEPS.every((s) => completedSteps.includes(s.id));
  if (allComplete) return null;

  const currentStepIndex = STEPS.findIndex((s) => !completedSteps.includes(s.id));
  const currentStep = currentStepIndex >= 0 ? currentStepIndex : STEPS.length - 1;

  return (
    <Card className="mb-8 border-primary/30 bg-primary/5">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Welcome to AgentMD</CardTitle>
          <CardDescription>
            Make your repository agent-ready in 3 steps
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          Skip
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 gap-y-4">
          {STEPS.map((s, i) => {
            const done = completedSteps.includes(s.id);
            const current = i === currentStep;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`
                    flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium
                    ${done ? "bg-primary text-primary-foreground" : current ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}
                  `}
                >
                  {done ? <Check className="h-5 w-5" /> : i + 1}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {STEPS[currentStep]?.href && (
            <Link href={STEPS[currentStep].href}>
              <Button variant="outline">View Guide</Button>
            </Link>
          )}
          <Link href="/dashboard/setup/agent">
            <Button size="sm" className="btn-tactile rounded-xl shadow-glow">Setup Agent</Button>
          </Link>
          <Link href="/docs/quickstart">
            <Button variant="ghost" size="sm">Quickstart</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
