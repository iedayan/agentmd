"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

const ITEMS = [
  { id: "github-app", title: "GitHub App Integration", desc: "Auto-validate on push, PR status checks", votes: 127 },
  { id: "datadog", title: "Datadog Integration", desc: "Send execution metrics to Datadog", votes: 89 },
];

export default function RoadmapPage() {
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleVote = (id: string) => {
    setVoted((prev) => new Set(prev).add(id));
    setFeedback("Vote recorded! Join Discord to suggest more.");
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <Logo size="md" />
            AgentMD
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard"><Button>Dashboard</Button></Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold">Public Roadmap</h1>
        <p className="mt-4 text-muted-foreground">
          Feature voting. We build what the community needs.
        </p>

        {feedback && (
          <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            {feedback}
          </div>
        )}

        <div className="mt-12 space-y-6">
          {ITEMS.map((item) => (
            <div key={item.id} className="rounded-lg border p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote(item.id)}
                  disabled={voted.has(item.id)}
                >
                  {voted.has(item.id) ? "Voted" : "Vote"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {item.votes + (voted.has(item.id) ? 1 : 0)} votes
              </p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-muted-foreground">
          <a href="https://discord.gg/agentmd" className="text-primary hover:underline">
            Join our Discord
          </a> to suggest features and vote.
        </p>
      </main>
    </div>
  );
}
