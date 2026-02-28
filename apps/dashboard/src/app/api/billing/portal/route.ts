/**
 * Create Stripe Billing Portal session for managing payment methods and invoices.
 */
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { requireSessionUserId } from '@/lib/auth/session';
import { getPool } from '@/lib/data/db';
import { getPublicAppUrl } from '@/lib/core/public-url';

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeSecretKey) {
    return apiError('Billing is not configured.', {
      status: 503,
      requestId,
      code: 'BILLING_NOT_CONFIGURED',
    });
  }

  const pool = getPool();
  if (!pool) {
    return apiError('Database not configured.', { status: 503, requestId });
  }

  const subRes = await pool.query(
    `SELECT stripe_customer_id FROM user_subscriptions WHERE user_id = $1`,
    [userId],
  );
  let customerId = subRes.rows[0]?.stripe_customer_id as string | undefined;

  const stripe = new Stripe(stripeSecretKey);
  const appUrl = getPublicAppUrl(req.nextUrl.origin);
  const returnUrl = `${appUrl}/dashboard/settings/billing`;

  if (!customerId) {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth/auth');
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return apiError('Email required to create billing profile.', {
        status: 400,
        requestId,
        code: 'NO_EMAIL',
      });
    }
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });
    customerId = customer.id;
    await pool.query(
      `INSERT INTO user_subscriptions (user_id, plan_id, status, stripe_customer_id, updated_at)
       VALUES ($1, 'free', 'inactive', $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, user_subscriptions.stripe_customer_id),
         updated_at = NOW()`,
      [userId, customerId],
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return apiOk({ url: session.url }, { requestId });
}
