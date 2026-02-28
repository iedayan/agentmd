import { createHmac } from 'crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { POST } from '../route';
import { evaluateExecutionPreflight, listApprovalRequests } from '@/lib/analytics/governance-data';

function createSlackRequest(payload: Record<string, unknown>) {
  const body = new URLSearchParams({ payload: JSON.stringify(payload) }).toString();
  return new Request('http://localhost/api/integrations/slack/actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

function signSlack(body: string, secret: string, timestamp: string) {
  const base = `v0:${timestamp}:${body}`;
  return `v0=${createHmac('sha256', secret).update(base).digest('hex')}`;
}

describe('POST /api/integrations/slack/actions', () => {
  afterEach(() => {
    delete process.env.SLACK_SIGNING_SECRET;
  });

  it('returns 415 for non form-encoded content', async () => {
    const res = await POST(
      new Request('http://localhost/api/integrations/slack/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }) as unknown as import('next/server').NextRequest,
    );
    expect(res.status).toBe(415);
    const json = await res.json();
    expect(json.code).toBe('UNSUPPORTED_MEDIA_TYPE');
  });

  it('returns 400 for missing payload', async () => {
    const res = await POST(
      new Request('http://localhost/api/integrations/slack/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: '',
      }) as unknown as import('next/server').NextRequest,
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('MISSING_PAYLOAD');
  });

  it('returns 400 for invalid action payload', async () => {
    const res = await POST(
      createSlackRequest({
        user: { id: 'U123' },
        actions: [{ action_id: 'not-valid', value: 'apr-1' }],
      }) as unknown as import('next/server').NextRequest,
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('INVALID_ACTION');
  });

  it('enforces Slack signature headers when signing secret is configured', async () => {
    process.env.SLACK_SIGNING_SECRET = 'slack-secret';
    const res = await POST(
      createSlackRequest({
        user: { id: 'U123' },
        actions: [{ action_id: 'approve', value: 'apr-1' }],
      }) as unknown as import('next/server').NextRequest,
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('MISSING_SIGNATURE_HEADERS');
  });

  it('rejects invalid Slack signature', async () => {
    process.env.SLACK_SIGNING_SECRET = 'slack-secret';
    const body = new URLSearchParams({
      payload: JSON.stringify({
        user: { id: 'U123' },
        actions: [{ action_id: 'approve', value: 'apr-1' }],
      }),
    }).toString();
    const timestamp = String(Math.floor(Date.now() / 1000));
    const badSignature = signSlack(body, 'different-secret', timestamp);
    const req = new Request('http://localhost/api/integrations/slack/actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-slack-request-timestamp': timestamp,
        'x-slack-signature': badSignature,
      },
      body,
    });
    const res = await POST(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.code).toBe('INVALID_SLACK_SIGNATURE');
  });

  it('returns 404 when approval does not exist', async () => {
    const res = await POST(
      createSlackRequest({
        user: { id: 'U123', username: 'slack.approver' },
        actions: [{ action_id: 'approve', value: 'apr-does-not-exist' }],
      }) as unknown as import('next/server').NextRequest,
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.code).toBe('APPROVAL_NOT_FOUND');
  });

  it('approves pending approval via Slack action payload', async () => {
    evaluateExecutionPreflight({
      repositoryId: '1',
      trigger: 'manual',
      requestedBy: 'external-user',
      agentId: 'deploy-agent',
    });
    const pending = listApprovalRequests().find((approval) => approval.status === 'pending');
    expect(pending).toBeDefined();

    const res = await POST(
      createSlackRequest({
        user: { id: 'U123', username: 'slack.approver' },
        actions: [{ action_id: 'approve', value: pending?.id }],
      }) as unknown as import('next/server').NextRequest,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.approval.status).toBe('approved');
  });
});
