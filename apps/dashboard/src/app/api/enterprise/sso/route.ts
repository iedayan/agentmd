import { NextRequest } from "next/server";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { getSsoConfig, updateSsoConfig } from "@/lib/analytics/governance-data";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  return apiOk({ sso: getSsoConfig() }, { requestId });
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return apiError("Invalid payload", { status: 400, requestId, code: "INVALID_PAYLOAD" });
    }
    const body = raw as Record<string, unknown>;
    const provider = body.provider;
    if (
      provider !== undefined &&
      provider !== "okta" &&
      provider !== "azure-ad" &&
      provider !== "google-workspace" &&
      provider !== "custom"
    ) {
      return apiError("Invalid provider", { status: 400, requestId, code: "INVALID_PROVIDER" });
    }
    const entityId = typeof body.entityId === "string" ? body.entityId.trim() : undefined;
    const ssoUrl = typeof body.ssoUrl === "string" ? body.ssoUrl.trim() : undefined;
    if (ssoUrl) {
      try {
        const parsed = new URL(ssoUrl);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          return apiError("ssoUrl must use http or https", {
            status: 400,
            requestId,
            code: "INVALID_SSO_URL",
          });
        }
      } catch {
        return apiError("ssoUrl must be a valid URL", {
          status: 400,
          requestId,
          code: "INVALID_SSO_URL",
        });
      }
    }

    const updated = updateSsoConfig({
      enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
      provider: provider as "okta" | "azure-ad" | "google-workspace" | "custom" | undefined,
      entityId,
      ssoUrl,
      enforceSso: typeof body.enforceSso === "boolean" ? body.enforceSso : undefined,
    });
    return apiOk({ sso: updated }, { requestId });
  } catch {
    return apiError("Invalid payload", { status: 400, requestId, code: "INVALID_PAYLOAD" });
  }
}
