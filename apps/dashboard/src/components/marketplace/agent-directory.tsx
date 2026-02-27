"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Shield, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { AgentListing } from "@agentmd-dev/core";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "pr-labeler", label: "PR Labeler" },
  { value: "testing", label: "Testing" },
  { value: "code-review", label: "Code Review" },
  { value: "template", label: "Templates" },
  { value: "security", label: "Security" },
];

export function AgentDirectory() {
  const [agents, setAgents] = useState<AgentListing[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAgents = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/marketplace/agents", { cache: "no-store" });
      const data = (await res.json()) as {
        ok?: boolean;
        agents?: AgentListing[];
        error?: string;
      };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error ?? "Failed to load marketplace agents.");
      }
      setAgents(data.agents ?? []);
    } catch (loadError) {
      setAgents([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load marketplace agents."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  const filtered = useMemo(
    () =>
      agents
        .filter((a) => {
          const matchSearch =
            !search ||
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.description.toLowerCase().includes(search.toLowerCase());
          const matchCategory = category === "all" || a.category === category;
          const matchCertified = !certifiedOnly || a.certified;
          return matchSearch && matchCategory && matchCertified;
        })
        .sort((a, b) => b.trustScore - a.trustScore || b.rating - a.rating),
    [agents, category, certifiedOnly, search]
  );

  const formatPrice = (a: AgentListing) => {
    const p = a.pricing;
    if (p.model === "free") return "Free";
    if (p.subscriptionPrice) return `$${(p.subscriptionPrice / 100).toFixed(2)}/mo`;
    if (p.oneTimePrice) return `$${(p.oneTimePrice / 100).toFixed(2)}`;
    if (p.usagePrice) return `$${(p.usagePrice / 100).toFixed(2)}/run`;
    return "—";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Discover, purchase, and execute certified agents through AGENTS.md
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={certifiedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setCertifiedOnly(!certifiedOnly)}
          >
            <Shield className="mr-2 h-4 w-4" />
            Certified only
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-32 rounded bg-muted" />
                <div className="h-4 w-48 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-20 w-full rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" className="mt-3" onClick={() => void loadAgents()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No agents match your filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => (
            <Link key={agent.id} href={`/marketplace/${agent.slug}`}>
              <Card className="h-full hover:border-primary/50 transition-colors flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    {"license" in agent && agent.license && (
                      <Badge variant="outline" className="text-[10px] font-black uppercase text-muted-foreground/60 border-border/40">
                        {String(agent.license)}
                      </Badge>
                    )}
                    {agent.certified && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="mr-1 h-3 w-3" />
                        Certified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1">
                  <CardDescription className="line-clamp-2">
                    {agent.description}
                  </CardDescription>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{agent.rating}</span>
                    <span className="text-muted-foreground">
                      ({agent.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-wider">Starting at</span>
                      <span className="font-bold text-lg">{formatPrice(agent)}</span>
                    </div>
                    {agent.pricing.model === "free" ? (
                      <Button variant="outline" size="sm" className="rounded-xl border-border/40 font-bold" asChild>
                        <Link href={`/marketplace/${agent.slug}`}>Install Free</Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="rounded-xl bg-primary shadow-glow font-bold"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.success(`Opening checkout for ${agent.name}...`);
                        }}
                      >
                        <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                        Buy
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
