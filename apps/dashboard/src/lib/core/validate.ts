/**
 * Shared validation utilities using Zod.
 * Use parseJson + schema.parse() for type-safe request body validation.
 */
import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { apiError } from './api-response';

/** Parse JSON body; returns null if invalid. */
export async function parseJsonBody(req: NextRequest | Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/** Validate body with schema; returns apiError Response on failure. */
export function validateBody<T>(
  raw: unknown,
  schema: z.ZodType<T>,
  options: {
    requestId: string;
    rateLimitRemaining?: string;
    code?: string;
  },
): { ok: true; data: T } | { ok: false; response: Response } {
  const result = schema.safeParse(raw);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  const first = result.error.errors[0];
  const message = first
    ? `${first.path.join('.') || 'body'}: ${first.message}`
    : 'Invalid request payload';
  return {
    ok: false,
    response: apiError(message, {
      status: 400,
      requestId: options.requestId,
      code: options.code ?? 'INVALID_PAYLOAD',
      headers: options.rateLimitRemaining
        ? { 'X-RateLimit-Remaining': options.rateLimitRemaining }
        : undefined,
    }),
  };
}

/** Helper: parse JSON and validate in one call. Returns validated data or error Response. */
export async function parseAndValidate<T>(
  req: NextRequest | Request,
  schema: z.ZodType<T>,
  options: { requestId: string; rateLimitRemaining?: string; code?: string },
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  const raw = await parseJsonBody(req as NextRequest);
  if (raw === null) {
    return {
      ok: false,
      response: apiError('Invalid JSON body', {
        status: 400,
        requestId: options.requestId,
        code: 'INVALID_JSON',
        headers: options.rateLimitRemaining
          ? { 'X-RateLimit-Remaining': options.rateLimitRemaining }
          : undefined,
      }),
    };
  }
  return validateBody(raw, schema, options);
}

// --- Shared schemas ---

export const triggerTypeSchema = z.enum(['manual', 'push', 'pull_request', 'schedule']);

const trimOptional = (s: unknown) => (typeof s === 'string' && s.trim() ? s.trim() : undefined);

export const executeBodySchema = z
  .object({
    agentsMdUrl: z.preprocess(trimOptional, z.string().url().optional()),
    agentId: z.preprocess(
      trimOptional,
      z
        .string()
        .regex(/^[a-z0-9-]+$/i)
        .optional(),
    ),
    repositoryId: z.preprocess(trimOptional, z.string().optional()),
    trigger: triggerTypeSchema.optional(),
  })
  .refine((d: { agentsMdUrl?: string; agentId?: string }) => !!d.agentsMdUrl || !!d.agentId, {
    message: 'agentsMdUrl or agentId required',
    path: ['agentsMdUrl'],
  })
  .transform((d) => ({
    agentsMdUrl: d.agentsMdUrl as string | undefined,
    agentId: d.agentId as string | undefined,
    repositoryId: d.repositoryId as string | undefined,
    trigger: (d.trigger ?? 'manual') as 'manual' | 'push' | 'pull_request' | 'schedule',
  }));

export type ExecuteBody = z.infer<typeof executeBodySchema>;

export const preflightBodySchema = z
  .object({
    repositoryId: z.string().trim().optional(),
    repositoryName: z.string().trim().optional(),
    requestedBy: z.string().trim().default('api_user'),
    agentId: z.string().trim().optional(),
    agentsMdUrl: z.union([z.string().url(), z.literal('')]).optional(),
    trigger: triggerTypeSchema.optional(),
  })
  .transform((d) => ({
    repositoryId: d.repositoryId,
    repositoryName: d.repositoryName,
    requestedBy: d.requestedBy,
    agentId: d.agentId?.trim() || undefined,
    agentsMdUrl: d.agentsMdUrl?.trim() || undefined,
    trigger: (d.trigger ?? 'manual') as 'manual' | 'push' | 'pull_request' | 'schedule',
  }));

export const demoParseBodySchema = z.object({
  content: z
    .string({ required_error: 'Content is required' })
    .min(1, 'Content is required')
    .max(50_000, 'Content too long (max 50,000 characters)')
    .refine((s) => s.trim().length > 0, 'Content is required'),
  sourceType: z.enum(['agentsmd', 'readme']).default('agentsmd'),
});

export const demoSandboxBodySchema = z
  .object({
    url: z.string().url().optional(),
    content: z.string().optional(),
  })
  .refine(
    (d: { url?: string; content?: string }) =>
      (d.url && d.url.length > 0) || (d.content && d.content.trim().length > 0),
    { message: 'url or content required' },
  );
