/**
 * List Stripe payment methods for the current user.
 */
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { apiOk, getRequestId } from '@/lib/core/api-response';
import { requireSessionUserId } from '@/lib/auth/session';
import { getPool } from '@/lib/data/db';

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeSecretKey) {
    return apiOk(
      { methods: [] },
      { requestId, headers: { 'Cache-Control': 'private, max-age=60' } },
    );
  }

  const pool = getPool();
  if (!pool) {
    return apiOk({ methods: [] }, { requestId });
  }

  const subRes = await pool.query(
    `SELECT stripe_customer_id FROM user_subscriptions WHERE user_id = $1`,
    [userId],
  );
  const customerId = subRes.rows[0]?.stripe_customer_id as string | undefined;
  if (!customerId) {
    return apiOk(
      { methods: [] },
      { requestId, headers: { 'Cache-Control': 'private, max-age=60' } },
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const pms = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });

  const methods = pms.data.map((pm) => {
    const card = pm.card;
    return {
      id: pm.id,
      brand: card?.brand ?? 'card',
      last4: card?.last4 ?? '****',
      expiry:
        card?.exp_month && card?.exp_year
          ? `${String(card.exp_month).padStart(2, '0')}/${card.exp_year}`
          : '',
    };
  });

  return apiOk({ methods }, { requestId, headers: { 'Cache-Control': 'private, max-age=60' } });
}
