export type IntegrationEventType =
  | "contract.failed"
  | "quality_gate.failed"
  | "artifacts.missing"
  | "exit_criteria.unmet";

export interface IntegrationEventPayload {
  repositoryId: string;
  repositoryName: string;
  pullRequestNumber: number;
  type: IntegrationEventType;
  details: Record<string, unknown>;
  occurredAt: string;
}

export async function emitIntegrationEvent(event: IntegrationEventPayload) {
  const webhookUrl = process.env.AGENTMD_EVENTS_WEBHOOK_URL?.trim();
  if (!webhookUrl) return { delivered: false, reason: "AGENTMD_EVENTS_WEBHOOK_URL missing" };
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    return {
      delivered: response.ok,
      reason: response.ok ? "delivered" : `receiver responded ${response.status}`,
    };
  } catch {
    return { delivered: false, reason: "delivery failed" };
  }
}
