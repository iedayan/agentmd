/**
 * List Stripe invoices for the current user.
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
      { invoices: [] },
      { requestId, headers: { 'Cache-Control': 'private, max-age=60' } },
    );
  }

  const pool = getPool();
  if (!pool) {
    return apiOk({ invoices: [] }, { requestId });
  }

  const subRes = await pool.query(
    `SELECT stripe_customer_id FROM user_subscriptions WHERE user_id = $1`,
    [userId],
  );
  const customerId = subRes.rows[0]?.stripe_customer_id as string | undefined;
  if (!customerId) {
    return apiOk(
      { invoices: [] },
      { requestId, headers: { 'Cache-Control': 'private, max-age=60' } },
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: 10,
    status: 'paid',
  });

  const items = invoices.data.map((inv) => ({
    id: inv.id,
    date: inv.created ? new Date(inv.created * 1000).toISOString().slice(0, 10) : '',
    amount: inv.amount_paid ? `$${(inv.amount_paid / 100).toFixed(2)}` : '$0.00',
    status: inv.status ?? 'paid',
    hostedInvoiceUrl: inv.hosted_invoice_url ?? undefined,
  }));

  return apiOk(
    { invoices: items },
    { requestId, headers: { 'Cache-Control': 'private, max-age=60' } },
  );
}
