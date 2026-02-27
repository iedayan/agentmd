/**
 * Sandbox: fetch AGENTS.md from URL and parse/validate.
 * Used by marketplace sandbox page.
 */
import { NextRequest } from "next/server";
import {
  parseAgentsMd,
  validateAgentsMd,
  computeAgentReadinessScore,
} from "@agentmd-dev/core";
import { rateLimit } from "@/lib/core/rate-limit";
import { getClientKey } from "@/lib/core/request-context";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";

const ALLOWED_HOSTS = [
  "github.com",
  "raw.githubusercontent.com",
  "gist.githubusercontent.com",
  "gitlab.com",
  "bitbucket.org",
];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const key = getClientKey(req);
  const { allowed, remaining } = await rateLimit(key, {
    scope: "sandbox",
    maxRequests: 20,
    windowMs: 60_000,
  });
  if (!allowed) {
    return apiError("Rate limit exceeded. Try again in a minute.", {
      status: 429,
      requestId,
      headers: { "X-RateLimit-Remaining": "0" },
      code: "RATE_LIMITED",
    });
  }

  try {
    const body = (await req.json()) as { url?: string; content?: string };
    let content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content && typeof body.url === "string" && body.url.trim()) {
      const url = body.url.trim();
      if (!isAllowedUrl(url)) {
        return apiError(
          "URL must be from GitHub, GitLab, or Bitbucket raw content",
          {
            status: 400,
            requestId,
            code: "INVALID_URL",
          }
        );
      }
      let rawUrl = url;
      if (url.includes("github.com") && !url.includes("raw.githubusercontent.com")) {
        rawUrl = url
          .replace("github.com", "raw.githubusercontent.com")
          .replace(/\/blob\/([^/]+)\//, "/$1/");
      } else if (url.includes("gitlab.com") && url.includes("/-/blob/")) {
        rawUrl = url.replace(/\/-\/blob\//, "/-/raw/");
      } else if (url.includes("bitbucket.org") && url.includes("/src/")) {
        rawUrl = url.replace(/\/src\//, "/raw/");
      }
      const res = await fetch(rawUrl, {
        headers: { "User-Agent": "AgentMD-Sandbox/1.0" },
      });
      if (!res.ok) {
        return apiError(`Failed to fetch: ${res.status}`, {
          status: 502,
          requestId,
          code: "FETCH_FAILED",
        });
      }
      content = await res.text();
    }

    if (!content || content.length > 50_000) {
      return apiError("Content is required and must be under 50,000 characters", {
        status: 400,
        requestId,
        code: "INVALID_CONTENT",
      });
    }

    const parsed = parseAgentsMd(content);
    const validation = await validateAgentsMd(parsed);
    const score = await computeAgentReadinessScore(parsed);

    return apiOk(
      {
        parsed: {
          sections: parsed.sections.map((s) => ({
            title: s.title,
            level: s.level,
            commandCount: parsed.commands.filter((c) => c.section === s.title).length,
          })),
          commands: parsed.commands.map((c) => ({
            command: c.command,
            section: c.section,
            type: c.type,
          })),
          lineCount: parsed.lineCount,
        },
        validation: {
          valid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings,
        },
        score,
      },
      {
        requestId,
        headers: { "X-RateLimit-Remaining": String(remaining) },
      }
    );
  } catch (err) {
    console.error("Sandbox error:", err);
    return apiError("Failed to parse AGENTS.md", {
      status: 500,
      requestId,
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  }
}
