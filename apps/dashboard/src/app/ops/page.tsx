"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { OpsNav } from "@/components/ops/OpsNav";
import { PipelineSidebar } from "@/components/ops/PipelineSidebar";
import { PipelineDiagram } from "@/components/ops/PipelineDiagram";
import { AgentsMdPreview } from "@/components/ops/AgentsMdPreview";
import { PolicyValidation } from "@/components/ops/PolicyValidation";
import { ApprovalGate } from "@/components/ops/ApprovalGate";
import { ExecutionLog } from "@/components/ops/ExecutionLog";
import { useOpsData } from "@/lib/ops/use-ops-data";

const PoliciesTab = dynamic(
  () => import("@/components/ops/PoliciesTab").then((mod) => mod.PoliciesTab),
  { loading: () => <div className="p-6 font-mono text-sm">Loading policies…</div> }
);

const AuditTab = dynamic(
  () => import("@/components/ops/AuditTab").then((mod) => mod.AuditTab),
  { loading: () => <div className="p-6 font-mono text-sm">Loading audit log…</div> }
);

const AnalyticsTab = dynamic(
  () => import("@/components/ops/AnalyticsTab").then((mod) => mod.AnalyticsTab),
  { loading: () => <div className="p-6 font-mono text-sm">Loading analytics…</div> }
);

export default function OpsPage() {
  const [activeTab, setActiveTab] = useState("pipelines");
  const { pipelines, policies, audit, analytics, loading, error } = useOpsData({
    loadAnalytics: activeTab === "analytics",
  });
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pipelines.length > 0 && !selectedPipelineId) {
      setSelectedPipelineId(pipelines[0].id);
    }
  }, [pipelines, selectedPipelineId]);

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);
  const isStreaming = selectedPipeline?.status === "running";

  const handleStageClick = (stageId: string) => {
    logRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-auto">
      <OpsNav activeTab={activeTab} onTabChange={setActiveTab} />
      {error && (
        <div className="mx-6 mt-4 rounded border border-amber-500/50 bg-amber-500/10 px-4 py-2 font-mono text-sm text-amber-700 dark:text-amber-400">
          {error} (using cached data)
        </div>
      )}

      {activeTab === "pipelines" && (
        <div className="flex">
          <PipelineSidebar
            pipelines={pipelines}
            selectedId={selectedPipelineId}
            onSelect={setSelectedPipelineId}
          />
          <main className="flex-1 overflow-auto p-8">
            {selectedPipeline ? (
              <div className="space-y-6 animate-fade-up">
                <div className="bento-card border-luminescent bg-card p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {selectedPipeline.name}
                      </h1>
                      <div className="mt-2 flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.5)]" />
                          {selectedPipeline.sourceRef}
                        </span>
                        <span>·</span>
                        <span>{selectedPipeline.trigger}</span>
                        <span>·</span>
                        <span>{selectedPipeline.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <PipelineDiagram
                      stages={selectedPipeline.stages}
                      onStageClick={handleStageClick}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AgentsMdPreview content={selectedPipeline.agentsMdContent} />
                  <PolicyValidation results={selectedPipeline.policyResults} />
                </div>

                {selectedPipeline.approvalGate && (
                  <div className="bento-card border-luminescent bg-card">
                    <ApprovalGate gate={selectedPipeline.approvalGate} />
                  </div>
                )}

                <div ref={logRef} className="bento-card border-luminescent bg-card">
                  <ExecutionLog
                    lines={selectedPipeline.logLines}
                    isStreaming={isStreaming}
                  />
                </div>
              </div>
            ) : loading ? (
              <div className="flex h-[400px] items-center justify-center bento-card border-border bg-card/50">
                <p className="font-mono text-sm font-bold tracking-widest text-muted-foreground animate-pulse">
                  SYNCING PIPELINES...
                </p>
              </div>
            ) : (
              <div className="flex h-[400px] items-center justify-center bento-card border-border bg-card/50">
                <p className="font-mono text-sm font-bold tracking-widest text-muted-foreground">
                  SELECT A PIPELINE
                </p>
              </div>
            )}
          </main>
        </div>
      )}

      {activeTab === "policies" && <PoliciesTab policies={policies} />}
      {activeTab === "audit" && <AuditTab entries={audit} />}
      {activeTab === "analytics" && <AnalyticsTab analytics={analytics} />}

      {activeTab === "settings" && (
        <div className="p-6">
          <div className="rounded-[var(--radius-md)] border border-border bg-card p-8">
            <h2 className="text-xl font-bold tracking-tight text-[var(--ops-primary)]">
              Settings
            </h2>
            <p className="mt-2 font-mono text-sm text-muted-foreground mb-8">
              Configure API keys, webhooks, and notifications.
            </p>
            <div className="space-y-6 max-w-xl">
              <div>
                <label className="font-mono text-xs text-muted-foreground block mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="agentmd_••••••••••••••••"
                  readOnly
                  className="w-full rounded-[var(--radius-sm)] border border-input bg-muted px-3 py-2 font-mono text-sm text-foreground/80"
                />
                <p className="mt-1 font-mono text-xs text-muted-foreground/80">
                  Regenerate in Dashboard → Settings
                </p>
              </div>
              <div>
                <label className="font-mono text-xs text-muted-foreground block mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-server.com/webhook"
                  className="w-full rounded-[var(--radius-sm)] border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground"
                />
                <p className="mt-1 font-mono text-xs text-muted-foreground/80">
                  Receive execution completion events
                </p>
              </div>
              <div>
                <label className="font-mono text-xs text-muted-foreground block mb-2">
                  Notifications
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-mono text-sm text-foreground/80">
                    <input type="checkbox" defaultChecked className="rounded-[var(--radius-sm)]" />
                    Pipeline failures
                  </label>
                  <label className="flex items-center gap-2 font-mono text-sm text-foreground/80">
                    <input type="checkbox" defaultChecked className="rounded-[var(--radius-sm)]" />
                    Approval requests
                  </label>
                  <label className="flex items-center gap-2 font-mono text-sm text-foreground/80">
                    <input type="checkbox" className="rounded-[var(--radius-sm)]" />
                    Policy violations
                  </label>
                </div>
              </div>
              <button className="mt-4 h-9 bg-primary px-4 font-mono text-sm font-medium text-primary-foreground rounded-[var(--radius-sm)] hover:bg-primary/90 transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
