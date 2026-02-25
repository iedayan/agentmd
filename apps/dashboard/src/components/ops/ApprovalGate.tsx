"use client";

import type { ApprovalGate as ApprovalGateType } from "@/lib/ops/mock-data";

export function ApprovalGate({ gate }: { gate: ApprovalGateType }) {
  return (
    <div className="rounded-[var(--radius-md)] border-2 border-amber-500/50 bg-card p-6">
      <h3 className="font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">
        Awaiting Approval
      </h3>
      <div className="mt-4 space-y-2 font-mono text-sm">
        <p>
          <span className="text-muted-foreground">Approver:</span>{" "}
          <span className="font-medium">{gate.approver}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Policy:</span>{" "}
          <span className="font-medium">{gate.policyId}</span>
        </p>
        <p className="mt-2 text-foreground">{gate.summary}</p>
      </div>
      <div className="mt-6 flex gap-3">
        <button className="h-10 rounded-[var(--radius-sm)] bg-primary px-4 font-mono text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Approve & Continue
        </button>
        <button className="h-10 rounded-[var(--radius-sm)] border border-destructive bg-card px-4 font-mono text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
          Reject
        </button>
        <button className="ml-auto self-center font-mono text-xs text-muted-foreground underline hover:text-foreground">
          Request Changes
        </button>
      </div>
    </div>
  );
}
