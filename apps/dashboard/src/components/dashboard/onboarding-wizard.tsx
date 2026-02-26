"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/core/utils";

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
  const [dismissed, setDismissed] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

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

      const derived: string[] = [];
      if (repos > 0) {
        derived.push("template", "connect", "validate");
      }
      if (execs > 0) derived.push("execute");

      setCompletedSteps((prev) => {
        const merged = Array.from(new Set([...prev, ...derived]));
        if (merged.length !== prev.length) {
          saveStoredState({ ...stored, completedSteps: merged });
        }
        return merged;
      });

      // Simulation of magic onboarding if we just connected
      if (repos > 0 && !stored.completedSteps.includes("connect")) {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 3000);
      }
    } catch {
      // Ignore fetch errors; onboarding state is best-effort
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

  const currentStep = STEPS.findIndex((s) => !completedSteps.includes(s.id));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="mb-8"
      >
        <Card className="relative overflow-hidden border-primary/30 bg-primary/[0.02] glass-card border-luminescent shadow-glow/5">
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
            >
              <div className="relative h-20 w-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t-2 border-primary shadow-glow"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse">Scanning Repositories...</p>
              <p className="mt-1 text-[10px] text-muted-foreground font-medium italic">Found agents in /docs and root...</p>
            </motion.div>
          )}

          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 mb-2">Accelerator Flow</p>
              <CardTitle className="text-2xl font-black tracking-tight text-gradient">Welcome to AgentMD</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
              Skip
            </Button>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              {STEPS.map((s, i) => {
                const done = completedSteps.includes(s.id);
                const current = i === currentStep;
                return (
                  <motion.div
                    key={s.id}
                    layout
                    className={cn(
                      "relative p-4 rounded-2xl border transition-all duration-500",
                      done ? "bg-primary/5 border-primary/20 shadow-glow-sm" :
                        current ? "bg-background border-primary shadow-glow/10" : "bg-muted/30 border-transparent opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black border",
                        done ? "bg-primary text-primary-foreground border-primary" :
                          current ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground border-muted-foreground/20"
                      )}>
                        {done ? <Check className="h-4 w-4" /> : i + 1}
                      </div>
                      <p className={cn("text-xs font-black uppercase tracking-widest", current ? "text-primary" : "text-foreground")}>
                        {s.title}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                      {s.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Link href={STEPS[currentStep >= 0 ? currentStep : 0]?.href ?? "/dashboard"}>
                <Button size="sm" className="btn-tactile rounded-xl px-8 font-black shadow-glow group">
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                {completedSteps.length} of {STEPS.length} Steps Complete
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
