import { createHmac } from 'crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { POST } from '../route';

function sign(body: string, secret: string) {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

function createWebhookRequest(input: {
  secret: string;
  event: string;
  deliveryId: string;
  payload: Record<string, unknown>;
}) {
  const body = JSON.stringify(input.payload);
  const signature = sign(body, input.secret);
  return new Request('http://localhost/api/github/webhooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-github-event': input.event,
      'x-github-delivery': input.deliveryId,
      'x-hub-signature-256': signature,
    },
    body,
  });
}

function createRawWebhookRequest(input: {
  secret: string;
  event: string;
  deliveryId: string;
  rawBody: string;
  signatureOverride?: string;
  includeHeaders?: boolean;
}) {
  const signature = input.signatureOverride ?? sign(input.rawBody, input.secret);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (input.includeHeaders !== false) {
    headers['x-github-event'] = input.event;
    headers['x-github-delivery'] = input.deliveryId;
    headers['x-hub-signature-256'] = signature;
  }
  return new Request('http://localhost/api/github/webhooks', {
    method: 'POST',
    headers,
    body: input.rawBody,
  });
}

describe('POST /api/github/webhooks', () => {
  afterEach(() => {
    delete process.env.GITHUB_WEBHOOK_SECRET;
  });

  it('returns 500 when webhook secret is missing', async () => {
    const req = new Request('http://localhost/api/github/webhooks', { method: 'POST' });
    const res = await POST(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.code).toBe('MISSING_WEBHOOK_SECRET');
  });

  it('processes a valid check_run webhook', async () => {
    process.env.GITHUB_WEBHOOK_SECRET = 'test-secret';
    const req = createWebhookRequest({
      secret: 'test-secret',
      event: 'check_run',
      deliveryId: 'delivery-1',
      payload: {
        repository: { full_name: 'agentmd/agentmd' },
        check_run: {
          name: 'agentmd/parse',
          status: 'completed',
          conclusion: 'success',
        },
      },
    });
    const res = await POST(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    if (json.ignored) {
      expect(json.duplicate).toBe(true);
    } else {
      expect(json.event).toBe('check_run');
    }
  });

  it('returns 400 when required headers are missing', async () => {
    process.env.GITHUB_WEBHOOK_SECRET = 'test-secret';
    const req = createRawWebhookRequest({
      secret: 'test-secret',
      event: 'check_run',
      deliveryId: 'delivery-missing-headers',
      rawBody: JSON.stringify({}),
      includeHeaders: false,
    });
    const res = await POST(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('MISSING_HEADERS');
  });

  it('returns 401 for invalid webhook signature', async () => {
    process.env.GITHUB_WEBHOOK_SECRET = 'test-secret';
    const req = createRawWebhookRequest({
      secret: 'test-secret',
      event: 'check_run',
      deliveryId: 'delivery-invalid-signature',
      rawBody: JSON.stringify({
        repository: { full_name: 'agentmd/agentmd' },
        check_run: { name: 'agentmd/parse', status: 'completed', conclusion: 'success' },
      }),
      signatureOverride: 'sha256=badbadbad',
    });
    const res = await POST(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.code).toBe('INVALID_SIGNATURE');
  });

  it('returns 400 for invalid JSON body', async () => {
    process.env.GITHUB_WEBHOOK_SECRET = 'test-secret';
    const req = createRawWebhookRequest({
      secret: 'test-secret',
      event: 'check_run',
      deliveryId: 'delivery-invalid-json',
      rawBody: '{not-json',
    });
    const res = await POST(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('INVALID_PAYLOAD');
  });

  it('handles pull_request events', async () => {
    process.env.GITHUB_WEBHOOK_SECRET = 'test-secret';
    const req = createWebhookRequest({
      secret: 'test-secret',
      event: 'pull_request',
      deliveryId: 'delivery-pr-event',
      payload: {
        action: 'opened',
        repository: { full_name: 'agentmd/agentmd' },
      },
    });
    const res = await POST(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(200);
    const json = await res.json();
    if (json.ignored) {
      expect(json.duplicate).toBe(true);
    } else {
      expect(json.event).toBe('pull_request');
    }
  });

  it('deduplicates an already processed delivery', async () => {
    process.env.GITHUB_WEBHOOK_SECRET = 'test-secret';
    const req = createWebhookRequest({
      secret: 'test-secret',
      event: 'check_run',
      deliveryId: 'delivery-dup',
      payload: {
        repository: { full_name: 'agentmd/agentmd' },
        check_run: {
          name: 'agentmd/policy-gate',
          status: 'completed',
          conclusion: 'success',
        },
      },
    });

    const first = await POST(req as unknown as import('next/server').NextRequest);
    expect(first.status).toBe(200);

    const second = await POST(req as unknown as import('next/server').NextRequest);
    expect(second.status).toBe(200);
    const json = await second.json();
    expect(json.duplicate).toBe(true);
    expect(json.ignored).toBe(true);
  });
});
