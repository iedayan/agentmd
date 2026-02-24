"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Shield, ArrowLeft, ChevronRight } from "lucide-react";
import type { AgentListing } from "@agentmd/core";

export function AgentDetail({ slug }: { slug: string }) {
  const [agent, setAgent] = useState<AgentListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadAgent = useCallback(async () => {
    try {
      setError(null);
      setNotFound(false);
      const res = await fetch(`/api/marketplace/agents/${slug}`, {
        cache: "no-store",
      });
      if (res.status === 404) {
        setAgent(null);
        setNotFound(true);
        return;
      }
      const data = (await res.json()) as {
        ok?: boolean;
        agent?: AgentListing;
        error?: string;
      };
      if (!res.ok || data.ok === false || !data.agent) {
        throw new Error(data.error ?? "Failed to load agent details.");
      }
      setAgent(data.agent);
    } catch (loadError) {
      setAgent(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load agent details."
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    void loadAgent();
  }, [loadAgent]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-4">
          <div className="h-10 w-64 animate-pulse rounded bg-muted/50" />
          <div className="h-28 animate-pulse rounded bg-muted/50" />
          <div className="h-28 animate-pulse rounded bg-muted/50" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-lg font-semibold">Agent not found</p>
        <p className="text-muted-foreground mt-1">
          The requested listing does not exist or was removed.
        </p>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-lg font-semibold">Unable to load agent</p>
        <p className="text-destructive mt-1 text-sm">{error ?? "Unknown error"}</p>
        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" onClick={() => void loadAgent()}>
            Retry
          </Button>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = () => {
    const p = agent.pricing;
    if (p.model === "free") return "Free";
    if (p.subscriptionPrice) return `$${(p.subscriptionPrice / 100).toFixed(2)}/month`;
    if (p.oneTimePrice) return `$${(p.oneTimePrice / 100).toFixed(2)} one-time`;
    if (p.usagePrice) return `$${(p.usagePrice / 100).toFixed(2)} per execution`;
    return "—";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              {agent.certified && (
                <Badge variant="secondary">
                  <Shield className="mr-1 h-3 w-3" />
                  Certified AGENTS.md Compatible
                </Badge>
              )}
              <Badge variant="outline">Trust {agent.trustScore}</Badge>
            </div>
            <p className="text-muted-foreground">{agent.description}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Capabilities</CardTitle>
              <CardDescription>What this agent can do</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {agent.capabilities.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Permissions</CardTitle>
              <CardDescription>From AGENTS.md</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {agent.requiredPermissions.map((p) => (
                  <Badge key={p} variant="secondary">
                    {p}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example AGENTS.md</CardTitle>
              <CardDescription>Configuration snippet</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="rounded bg-muted p-4 text-sm overflow-x-auto">
                {agent.exampleAgentsMd}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>{agent.pricing.model}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatPrice()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                15% platform fee on paid transactions
              </p>
              <Button className="w-full mt-4">
                Get Agent
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>
                {agent.rating} · {agent.reviewCount} reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-bold">{agent.rating}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{agent.sellerName}</p>
              {agent.sourceUrl && (
                <a
                  href={agent.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View source
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
