/**
 * Contact form API — sends submissions to iedayan03@gmail.com via Resend.
 */
import { NextRequest } from "next/server";
import { Resend } from "resend";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { rateLimit } from "@/lib/core/rate-limit";
import { getClientKey } from "@/lib/core/request-context";

const CONTACT_EMAIL = "iedayan03@gmail.com";

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const rate = await rateLimit(getClientKey(req), {
    scope: "contact-form",
    maxRequests: 5,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return apiError("Too many requests. Please try again later.", {
      status: 429,
      requestId,
      headers: { "X-RateLimit-Remaining": String(rate.remaining) },
      code: "RATE_LIMITED",
    });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return apiError("Contact form is not configured. Please email us directly.", {
      status: 503,
      requestId,
      headers: { "X-RateLimit-Remaining": String(rate.remaining) },
      code: "CONTACT_NOT_CONFIGURED",
    });
  }

  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return apiError("Invalid request payload", {
        status: 400,
        requestId,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
        code: "INVALID_PAYLOAD",
      });
    }
    const body = raw as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || name.length < 2) {
      return apiError("Name is required (min 2 characters)", {
        status: 400,
        requestId,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
        code: "INVALID_NAME",
      });
    }
    if (!email || !email.includes("@") || email.length > 254) {
      return apiError("Valid email is required", {
        status: 400,
        requestId,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
        code: "INVALID_EMAIL",
      });
    }
    if (!message || message.length < 10) {
      return apiError("Message is required (min 10 characters)", {
        status: 400,
        requestId,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
        code: "INVALID_MESSAGE",
      });
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: "AgentMD Contact <onboarding@resend.dev>",
      to: [CONTACT_EMAIL],
      replyTo: email,
      subject: `[AgentMD Contact] ${name}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px;">
          <h2>New contact form submission</h2>
          <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
          <p><strong>Message:</strong></p>
          <pre style="white-space: pre-wrap; background: #f4f4f4; padding: 1rem; border-radius: 8px;">${escapeHtml(message)}</pre>
          <p style="color: #666; font-size: 12px; margin-top: 2rem;">Sent via AgentMD contact form</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend contact error:", error);
      return apiError("Failed to send message. Please try again or email directly.", {
        status: 500,
        requestId,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
        code: "SEND_FAILED",
      });
    }

    return apiOk(
      { ok: true, id: data?.id },
      { requestId, headers: { "X-RateLimit-Remaining": String(rate.remaining) } }
    );
  } catch (err) {
    console.error("Contact form error:", err);
    return apiError("Failed to send message. Please try again.", {
      status: 500,
      requestId,
      headers: { "X-RateLimit-Remaining": String(rate.remaining) },
      code: "CONTACT_ERROR",
    });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
