/**
 * Get and update notification preferences.
 */
import { NextRequest } from "next/server";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { requireSessionUserId } from "@/lib/auth/session";
import { getPool } from "@/lib/data/db";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  const pool = getPool();
  if (!pool) {
    return apiOk(
      { webhookUrl: "", emailAlerts: true, slackAlerts: false },
      { requestId }
    );
  }

  try {
    const res = await pool.query(
      `SELECT webhook_url, email_alerts, slack_alerts
       FROM user_preferences
       WHERE user_id = $1`,
      [userId]
    );
    const row = res.rows[0];
    return apiOk(
      {
        webhookUrl: row?.webhook_url ?? "",
        emailAlerts: row?.email_alerts ?? true,
        slackAlerts: row?.slack_alerts ?? false,
      },
      { requestId }
    );
  } catch {
    return apiOk(
      { webhookUrl: "", emailAlerts: true, slackAlerts: false },
      { requestId }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  const raw = (await req.json()) as unknown;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return apiError("Invalid request body", {
      status: 400,
      requestId,
      code: "INVALID_PAYLOAD",
    });
  }

  const body = raw as Record<string, unknown>;
  const webhookUrl =
    typeof body.webhookUrl === "string" ? body.webhookUrl.trim() : undefined;
  const emailAlerts =
    typeof body.emailAlerts === "boolean" ? body.emailAlerts : undefined;
  const slackAlerts =
    typeof body.slackAlerts === "boolean" ? body.slackAlerts : undefined;

  const pool = getPool();
  if (!pool) {
    return apiError("Database not configured.", { status: 503, requestId });
  }

  try {
    await pool.query(
      `INSERT INTO user_preferences (user_id, webhook_url, email_alerts, slack_alerts, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         webhook_url = EXCLUDED.webhook_url,
         email_alerts = EXCLUDED.email_alerts,
         slack_alerts = EXCLUDED.slack_alerts,
         updated_at = NOW()`,
      [userId, webhookUrl ?? "", emailAlerts ?? true, slackAlerts ?? false]
    );
    return apiOk({ ok: true }, { requestId });
  } catch (err) {
    console.error("Notifications update error:", err);
    return apiError("Failed to save preferences", { status: 500, requestId });
  }
}
