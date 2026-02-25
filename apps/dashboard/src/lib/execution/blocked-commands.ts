/**
 * Normalized blocked command schema for UI and persistence.
 * Stable shape independent of @agentmd/core plan schema.
 */

export interface BlockedCommand {
  command: string;
  type: string;
  section: string;
  line?: number;
  codes: string[];
  messages: string[];
  requiresShell: boolean;
  requiresApproval: boolean;
}

export interface NormalizedBlockedCommands {
  runnableCount: number;
  blockedCount: number;
  blockedCommands: BlockedCommand[];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? (value.filter((v) => typeof v === "string") as string[])
    : [];
}

function asReasonDetails(value: unknown): Array<{ code: string; message: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => v && typeof v === "object")
    .map((v) => v as { code?: string; message?: string })
    .filter((v) => typeof v.code === "string" && typeof v.message === "string")
    .map((v) => ({ code: v.code as string, message: v.message as string }));
}

/**
 * Normalize raw preflight plan from @agentmd/core into a stable blockedCommands array.
 * Use this when persisting executions so the UI doesn't depend on raw plan schema.
 */
export function normalizeBlockedCommands(preflightPlan: unknown): NormalizedBlockedCommands | null {
  if (!preflightPlan || typeof preflightPlan !== "object") return null;
  const plan = preflightPlan as {
    items?: Array<{
      command?: unknown;
      type?: unknown;
      section?: unknown;
      line?: unknown;
      runnable?: unknown;
      reasons?: unknown;
      reasonDetails?: unknown;
      requiresShell?: unknown;
      requiresApproval?: unknown;
    }>;
    runnableCount?: number;
    blockedCount?: number;
  };

  const rawItems = Array.isArray(plan.items) ? plan.items : [];
  const blockedCommands: BlockedCommand[] = [];

  for (const item of rawItems) {
    const runnable = Boolean(item?.runnable);
    if (runnable) continue;

    const command = typeof item?.command === "string" ? item.command : "";
    const type = typeof item?.type === "string" ? item.type : "";
    const section = typeof item?.section === "string" ? item.section : "";
    const line = typeof item?.line === "number" ? item.line : undefined;
    const reasons = asStringArray(item?.reasons);
    const reasonDetails = asReasonDetails(item?.reasonDetails);
    const codes =
      reasonDetails.length > 0
        ? Array.from(new Set(reasonDetails.map((d) => d.code)))
        : ["UNKNOWN"];
    const messages =
      reasonDetails.length > 0
        ? reasonDetails.map((d) => d.message)
        : reasons.length > 0
          ? reasons
          : ["Blocked"];

    blockedCommands.push({
      command,
      type,
      section,
      line,
      codes,
      messages,
      requiresShell: Boolean(item?.requiresShell),
      requiresApproval: Boolean(item?.requiresApproval),
    });
  }

  const runnableCount =
    typeof plan.runnableCount === "number"
      ? plan.runnableCount
      : rawItems.filter((i) => Boolean(i?.runnable)).length;
  const blockedCount =
    typeof plan.blockedCount === "number"
      ? plan.blockedCount
      : blockedCommands.length;

  return { runnableCount, blockedCount, blockedCommands };
}
