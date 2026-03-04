import { parseAgentsMd, validateAgentsMd, computeAgentReadinessScore } from '@agentmd-dev/core';
import { convertToAgentsMd } from '@/lib/agents/migrate-to-agents-md';
import { rateLimit } from '@/lib/core/rate-limit';
import { getClientKey } from '@/lib/core/request-context';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { parseAndValidate, demoParseBodySchema } from '@/lib/core/validate';

/**
 * Demo-only endpoint for interactive product UX.
 * Not part of the stable public API contract.
 */
export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const key = getClientKey(request);
  const { allowed, remaining } = await rateLimit(key, {
    scope: 'demo-parse',
    maxRequests: 30,
    windowMs: 60_000,
  });
  if (!allowed) {
    return apiError('Rate limit exceeded. Try again in a minute.', {
      status: 429,
      requestId,
      headers: { 'X-RateLimit-Remaining': '0' },
      code: 'RATE_LIMITED',
    });
  }

  try {
    const validated = await parseAndValidate(request, demoParseBodySchema, {
      requestId,
      rateLimitRemaining: String(remaining),
    });
    if (!validated.ok) return validated.response;
    const { content, sourceType } = validated.data;

    let parseContent = String(content);
    if (sourceType === 'readme') {
      parseContent = convertToAgentsMd(String(content), 'generic') || String(content);
    }

    const parsed = parseAgentsMd(parseContent);
    const validation = await validateAgentsMd(parsed);
    const score = await computeAgentReadinessScore(parsed);

    return apiOk(
      {
        parsed: {
          sections: parsed.sections.map((s) => ({
            title: s.title,
            level: s.level,
            lineStart: s.lineStart,
            lineEnd: s.lineEnd,
            commandCount: parsed.commands.filter((c) => c.section === s.title).length,
          })),
          commands: parsed.commands.map((c) => ({
            command: c.command,
            section: c.section,
            type: c.type,
            line: c.line,
          })),
          lineCount: parsed.lineCount,
          hasFrontmatter: !!parsed.frontmatter && Object.keys(parsed.frontmatter).length > 0,
        },
        validation: {
          valid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings,
          suggestions: validation.suggestions,
        },
        score,
      },
      {
        requestId,
        headers: { 'X-RateLimit-Remaining': String(remaining) },
      },
    );
  } catch (err) {
    console.error('Demo parse error:', err);
    return apiError('Failed to parse AGENTS.md', {
      status: 500,
      requestId,
      headers: { 'X-RateLimit-Remaining': String(remaining) },
    });
  }
}
