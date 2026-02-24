import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export function getRequestId(request?: Request): string {
  const inbound = request?.headers.get("x-request-id")?.trim();
  if (inbound) return inbound.slice(0, 128);
  return randomUUID();
}

function defaultHeaders(requestId: string): Record<string, string> {
  return {
    "Cache-Control": "no-store",
    "X-Request-Id": requestId,
  };
}

export function apiOk<T extends Record<string, unknown>>(
  payload: T,
  options?: {
    status?: number;
    requestId?: string;
    headers?: Record<string, string>;
  }
) {
  const requestId = options?.requestId ?? randomUUID();
  return NextResponse.json(
    {
      ok: true,
      requestId,
      ...payload,
    },
    {
      status: options?.status ?? 200,
      headers: {
        ...defaultHeaders(requestId),
        ...(options?.headers ?? {}),
      },
    }
  );
}

export function apiError(
  message: string,
  options?: {
    status?: number;
    requestId?: string;
    code?: string;
    details?: unknown;
    headers?: Record<string, string>;
  }
) {
  const requestId = options?.requestId ?? randomUUID();
  return NextResponse.json(
    {
      ok: false,
      requestId,
      error: message,
      code: options?.code,
      details: options?.details,
    },
    {
      status: options?.status ?? 400,
      headers: {
        ...defaultHeaders(requestId),
        ...(options?.headers ?? {}),
      },
    }
  );
}
