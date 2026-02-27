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

const OpsSettingsTab = dynamic(
  () => import("@/components/ops/OpsSettingsTab").then((mod) => mod.OpsSettingsTab),
  { loading: () => <div className="p-6 font-mono text-sm">Loading settings…</div> }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- onStageClick signature requires stageId
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

      {activeTab === "settings" && <OpsSettingsTab />}
    </div>
  );
}
