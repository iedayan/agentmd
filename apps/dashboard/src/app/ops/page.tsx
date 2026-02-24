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
import { useOpsData } from "@/hooks/use-ops-data";

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
    <div className="min-h-screen bg-[var(--ops-bg)] overflow-x-auto">
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
          <main className="flex-1 overflow-auto">
            {selectedPipeline ? (
              <div className="rounded-lg border border-[var(--ops-border)] bg-[var(--ops-panel)] m-6 p-6 shadow-sm">
                <h1 className="font-display text-2xl italic text-[var(--ops-primary)]">
                  {selectedPipeline.name}
                </h1>
                <div className="mt-2 font-mono text-xs text-[var(--ops-primary)]/60">
                  {selectedPipeline.sourceRef} · {selectedPipeline.trigger} ·{" "}
                  {selectedPipeline.timestamp}
                </div>

                <div className="mt-6">
                  <PipelineDiagram
                    stages={selectedPipeline.stages}
                    onStageClick={handleStageClick}
                  />
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AgentsMdPreview content={selectedPipeline.agentsMdContent} />
                  <PolicyValidation results={selectedPipeline.policyResults} />
                </div>

                {selectedPipeline.approvalGate && (
                  <div className="mt-6">
                    <ApprovalGate gate={selectedPipeline.approvalGate} />
                  </div>
                )}

                <div ref={logRef} className="mt-8">
                  <ExecutionLog
                    lines={selectedPipeline.logLines}
                    isStreaming={isStreaming}
                  />
                </div>
              </div>
            ) : loading ? (
              <div className="m-6 flex items-center justify-center rounded-lg border border-[var(--ops-border)] bg-[var(--ops-panel)] p-24">
                <p className="font-mono text-sm text-[var(--ops-primary)]/60">
                  Loading pipelines…
                </p>
              </div>
            ) : (
              <div className="m-6 flex items-center justify-center rounded-lg border border-[var(--ops-border)] bg-[var(--ops-panel)] p-24">
                <p className="font-mono text-sm text-[var(--ops-primary)]/60">
                  Select a pipeline from the sidebar
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
          <div className="rounded-lg border border-[var(--ops-border)] bg-[var(--ops-panel)] p-8">
            <h2 className="font-display text-xl italic text-[var(--ops-primary)]">
              Settings
            </h2>
            <p className="mt-2 font-mono text-sm text-[var(--ops-primary)]/60 mb-8">
              Configure API keys, webhooks, and notifications.
            </p>
            <div className="space-y-6 max-w-xl">
              <div>
                <label className="font-mono text-xs text-[var(--ops-primary)]/70 block mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="agentmd_••••••••••••••••"
                  readOnly
                  className="w-full rounded border border-[var(--ops-border)] bg-[var(--ops-bg)] px-3 py-2 font-mono text-sm text-[var(--ops-primary)]/80"
                />
                <p className="mt-1 font-mono text-xs text-[var(--ops-primary)]/50">
                  Regenerate in Dashboard → Settings
                </p>
              </div>
              <div>
                <label className="font-mono text-xs text-[var(--ops-primary)]/70 block mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-server.com/webhook"
                  className="w-full rounded border border-[var(--ops-border)] bg-[var(--ops-bg)] px-3 py-2 font-mono text-sm text-[var(--ops-primary)]/80 placeholder:text-[var(--ops-primary)]/40"
                />
                <p className="mt-1 font-mono text-xs text-[var(--ops-primary)]/50">
                  Receive execution completion events
                </p>
              </div>
              <div>
                <label className="font-mono text-xs text-[var(--ops-primary)]/70 block mb-2">
                  Notifications
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-mono text-sm text-[var(--ops-primary)]/80">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Pipeline failures
                  </label>
                  <label className="flex items-center gap-2 font-mono text-sm text-[var(--ops-primary)]/80">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Approval requests
                  </label>
                  <label className="flex items-center gap-2 font-mono text-sm text-[var(--ops-primary)]/80">
                    <input type="checkbox" className="rounded" />
                    Policy violations
                  </label>
                </div>
              </div>
              <button className="mt-4 h-9 bg-[var(--ops-primary)] px-4 font-mono text-sm font-medium text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
