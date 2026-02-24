"use client";

import type { ApprovalGate as ApprovalGateType } from "@/app/ops/mock-data";

export function ApprovalGate({ gate }: { gate: ApprovalGateType }) {
  return (
    <div className="border-2 border-[var(--ops-pending)] bg-[var(--ops-panel)] p-6">
      <h3 className="font-mono text-sm font-semibold text-[var(--ops-pending)]">
        Awaiting Approval
      </h3>
      <div className="mt-4 space-y-2 font-mono text-sm">
        <p>
          <span className="text-[var(--ops-primary)]/60">Approver:</span>{" "}
          <span className="font-medium">{gate.approver}</span>
        </p>
        <p>
          <span className="text-[var(--ops-primary)]/60">Policy:</span>{" "}
          <span className="font-medium">{gate.policyId}</span>
        </p>
        <p className="mt-2 text-[var(--ops-primary)]">{gate.summary}</p>
      </div>
      <div className="mt-6 flex gap-3">
        <button className="h-10 bg-[var(--ops-passed)] px-4 font-mono text-sm font-medium text-white">
          Approve & Continue
        </button>
        <button className="h-10 rounded border border-[var(--ops-failed)] bg-[var(--ops-panel)] px-4 font-mono text-sm font-medium text-[var(--ops-failed)] hover:bg-[var(--ops-bg)] transition-colors">
          Reject
        </button>
        <button className="ml-auto self-center font-mono text-xs text-[var(--ops-primary)]/60 underline">
          Request Changes
        </button>
      </div>
    </div>
  );
}
