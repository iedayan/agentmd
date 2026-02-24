import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { getRepositoryByFullName } from "@/lib/data/dashboard-data-facade";
import { recordGitHubWebhookEvent, setGitHubCheckStatus } from "@/lib/analytics/governance-data";
import {
  markWebhookDeliveryStatus,
  openIncident,
  registerWebhookDelivery,
} from "@/lib/analytics/reliability-data";

function verifySignature(body: string, signatureHeader: string, secret: string) {
  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const headerBuffer = Buffer.from(signatureHeader);
  if (expectedBuffer.length !== headerBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, headerBuffer);
}

function mapGitHubStatus(status?: string, conclusion?: string): "success" | "failed" | "pending" {
  if (conclusion === "success") return "success";
  if (conclusion === "failure" || conclusion === "cancelled" || conclusion === "timed_out") {
    return "failed";
  }
  if (status === "completed" && !conclusion) return "failed";
  return "pending";
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return apiError("Server misconfigured: GITHUB_WEBHOOK_SECRET missing", {
      status: 500,
      requestId,
      code: "MISSING_WEBHOOK_SECRET",
    });
  }

  const event = req.headers.get("x-github-event")?.trim();
  const signature = req.headers.get("x-hub-signature-256")?.trim();
  const deliveryId = req.headers.get("x-github-delivery")?.trim() ?? `no-delivery-${requestId}`;
  if (!event || !signature) {
    markWebhookDeliveryStatus(deliveryId, "failed", "Missing GitHub event headers");
    openIncident({
      source: "github.webhook",
      severity: "medium",
      summary: "Missing GitHub webhook headers",
    });
    return apiError("Missing GitHub event headers", {
      status: 400,
      requestId,
      code: "MISSING_HEADERS",
    });
  }
  const delivery = registerWebhookDelivery(deliveryId, event);
  if (delivery.alreadyProcessed) {
    recordGitHubWebhookEvent({ event, result: "processed" });
    return apiOk({ duplicate: true, ignored: true, reason: "Delivery already processed" }, { requestId });
  }

  const rawBody = await req.text();
  recordGitHubWebhookEvent({ event, result: "received" });
  if (!verifySignature(rawBody, signature, secret)) {
    markWebhookDeliveryStatus(deliveryId, "failed", "Invalid webhook signature");
    recordGitHubWebhookEvent({
      event,
      result: "signature_failed",
      error: "Invalid webhook signature",
    });
    openIncident({
      source: "github.webhook",
      severity: "high",
      summary: "Invalid webhook signature detected",
    });
    return apiError("Invalid webhook signature", {
      status: 401,
      requestId,
      code: "INVALID_SIGNATURE",
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    markWebhookDeliveryStatus(deliveryId, "failed", "Invalid JSON payload");
    recordGitHubWebhookEvent({ event, result: "error", error: "Invalid JSON payload" });
    openIncident({
      source: "github.webhook",
      severity: "medium",
      summary: "Invalid JSON payload in webhook",
    });
    return apiError("Invalid JSON payload", {
      status: 400,
      requestId,
      code: "INVALID_PAYLOAD",
    });
  }

  let repositoryFullName: string | undefined;
  let checkName: string | undefined;
  let status: "success" | "failed" | "pending" = "pending";

  if (event === "check_run") {
    const checkRun = payload.check_run as Record<string, unknown> | undefined;
    repositoryFullName = (payload.repository as { full_name?: string } | undefined)?.full_name;
    checkName = typeof checkRun?.name === "string" ? checkRun.name : undefined;
    status = mapGitHubStatus(
      typeof checkRun?.status === "string" ? checkRun.status : undefined,
      typeof checkRun?.conclusion === "string" ? checkRun.conclusion : undefined
    );
  } else if (event === "check_suite") {
    const checkSuite = payload.check_suite as Record<string, unknown> | undefined;
    repositoryFullName = (payload.repository as { full_name?: string } | undefined)?.full_name;
    checkName = "github/check-suite";
    status = mapGitHubStatus(
      typeof checkSuite?.status === "string" ? checkSuite.status : undefined,
      typeof checkSuite?.conclusion === "string" ? checkSuite.conclusion : undefined
    );
  } else if (event === "pull_request") {
    repositoryFullName = (payload.repository as { full_name?: string } | undefined)?.full_name;
    checkName = "agentmd/pull-request";
    const action = typeof payload.action === "string" ? payload.action : "";
    status =
      action === "closed"
        ? "success"
        : action === "opened" || action === "reopened" || action === "synchronize"
        ? "pending"
        : "pending";
  } else {
    markWebhookDeliveryStatus(deliveryId, "processed");
    recordGitHubWebhookEvent({ event, result: "processed" });
    return apiOk({ ignored: true, reason: `Unsupported event ${event}` }, { requestId });
  }

  if (!repositoryFullName || !checkName) {
    markWebhookDeliveryStatus(deliveryId, "failed", "Missing repository/check fields");
    recordGitHubWebhookEvent({ event, result: "error", error: "Missing repository/check fields" });
    openIncident({
      source: "github.webhook",
      severity: "medium",
      summary: "Webhook missing repository/check fields",
    });
    return apiError("Missing repository/check fields", {
      status: 400,
      requestId,
      code: "MISSING_FIELDS",
    });
  }

  const repository = await getRepositoryByFullName(repositoryFullName!);
  if (!repository) {
    markWebhookDeliveryStatus(deliveryId, "failed", "Repository not connected");
    recordGitHubWebhookEvent({
      event,
      result: "error",
      error: "Repository is not connected in AgentMD",
    });
    return apiError("Repository is not connected in AgentMD", {
      status: 404,
      requestId,
      code: "REPOSITORY_NOT_CONNECTED",
    });
  }

  const updatedGate = setGitHubCheckStatus(repository.id, checkName, status, repository.fullName);
  markWebhookDeliveryStatus(deliveryId, "processed");
  recordGitHubWebhookEvent({ event, result: "processed" });
  return apiOk({ gate: updatedGate, event, duplicate: delivery.duplicate, attempts: delivery.attempts }, { requestId });
}
