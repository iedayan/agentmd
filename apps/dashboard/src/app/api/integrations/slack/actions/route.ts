import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { decideApprovalRequest, recordSlackApprovalAction } from '@/lib/analytics/governance-data';

function verifySlackSignature(body: string, timestamp: string, signature: string, secret: string) {
  const base = `v0:${timestamp}:${body}`;
  const expected = `v0=${createHmac('sha256', secret).update(base).digest('hex')}`;
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.includes('application/x-www-form-urlencoded')) {
    return apiError('Slack actions require form-encoded payload', {
      status: 415,
      requestId,
      code: 'UNSUPPORTED_MEDIA_TYPE',
    });
  }

  const rawBody = await req.text();
  const signingSecret = process.env.SLACK_SIGNING_SECRET?.trim();
  if (signingSecret) {
    const timestamp = req.headers.get('x-slack-request-timestamp')?.trim() ?? '';
    const signature = req.headers.get('x-slack-signature')?.trim() ?? '';
    if (!timestamp || !signature) {
      return apiError('Missing Slack signature headers', {
        status: 400,
        requestId,
        code: 'MISSING_SIGNATURE_HEADERS',
      });
    }
    if (!verifySlackSignature(rawBody, timestamp, signature, signingSecret)) {
      return apiError('Invalid Slack signature', {
        status: 401,
        requestId,
        code: 'INVALID_SLACK_SIGNATURE',
      });
    }
  }

  const params = new URLSearchParams(rawBody);
  const payloadRaw = params.get('payload');
  if (!payloadRaw) {
    return apiError('Missing Slack payload', {
      status: 400,
      requestId,
      code: 'MISSING_PAYLOAD',
    });
  }

  try {
    const payload = JSON.parse(payloadRaw) as {
      user?: { id?: string; username?: string };
      actions?: Array<{ action_id?: string; value?: string }>;
    };
    const action = payload.actions?.[0];
    const actionId = action?.action_id;
    const approvalId = action?.value?.trim();
    if (!approvalId || (actionId !== 'approve' && actionId !== 'reject')) {
      return apiError('Invalid Slack approval action', {
        status: 400,
        requestId,
        code: 'INVALID_ACTION',
      });
    }

    const decision = actionId === 'approve' ? 'approved' : 'rejected';
    const decidedBy = payload.user?.username || payload.user?.id || 'slack_user';
    const approval = decideApprovalRequest(approvalId, decision, decidedBy);
    if (!approval) {
      return apiError('Approval not found or already decided', {
        status: 404,
        requestId,
        code: 'APPROVAL_NOT_FOUND',
      });
    }

    recordSlackApprovalAction();

    return apiOk(
      {
        text: `Approval ${approval.id} ${decision} by ${decidedBy}.`,
        approval,
      },
      { requestId },
    );
  } catch {
    return apiError('Invalid Slack payload', {
      status: 400,
      requestId,
      code: 'INVALID_PAYLOAD',
    });
  }
}
