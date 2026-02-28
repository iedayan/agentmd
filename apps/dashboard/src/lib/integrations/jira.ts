/**
 * Jira integration: Post execution status to Jira via webhook or REST API.
 * Configure JIRA_WEBHOOK_URL for incoming webhooks, or JIRA_BASE_URL + JIRA_API_TOKEN for REST.
 */

export interface ExecutionWebhookPayload {
  executionId: string;
  repositoryName: string;
  status: 'success' | 'failed' | 'cancelled';
  trigger: string;
  durationMs?: number;
  commandsRun: number;
  commandsPassed: number;
  commandsFailed: number;
  startedAt: string;
  completedAt?: string;
}

/**
 * Send execution completion to Jira.
 * Uses JIRA_WEBHOOK_URL if set (incoming webhook format).
 * Falls back to no-op if not configured.
 */
export async function notifyJiraExecutionComplete(payload: ExecutionWebhookPayload): Promise<void> {
  const webhookUrl = process.env.JIRA_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  try {
    const body = {
      executionId: payload.executionId,
      repositoryName: payload.repositoryName,
      status: payload.status,
      trigger: payload.trigger,
      durationMs: payload.durationMs,
      commandsRun: payload.commandsRun,
      commandsPassed: payload.commandsPassed,
      commandsFailed: payload.commandsFailed,
      startedAt: payload.startedAt,
      completedAt: payload.completedAt,
      summary:
        payload.status === 'failed'
          ? `AgentMD execution failed: ${payload.repositoryName} (${payload.commandsFailed} commands failed)`
          : `AgentMD execution completed: ${payload.repositoryName}`,
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn(`[jira] webhook failed: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.warn('[jira] webhook error:', err);
  }
}
