import { requireSessionUserId } from '@/lib/auth/session';
import {
  listRepositories,
  getDashboardCounts,
  getUserSubscriptionPlan,
} from '@/lib/data/dashboard-data-facade';
import { getPlan, isAppSumoPlan, type PlanId } from '@/lib/billing/plans';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const requestId = getRequestId();
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  try {
    const [repos, counts] = await Promise.all([
      listRepositories(userId),
      getDashboardCounts(userId),
    ]);

    const resolvedPlanId = await resolvePlanId(userId);
    const planId: PlanId =
      resolvedPlanId === 'pro' ||
      resolvedPlanId === 'enterprise' ||
      (resolvedPlanId && isAppSumoPlan(resolvedPlanId))
        ? resolvedPlanId
        : 'free';
    const plan = getPlan(planId);
    const repoLimit = typeof plan.repositories === 'number' ? plan.repositories : Infinity;
    const minutesLimit =
      typeof plan.executionMinutes === 'number' ? plan.executionMinutes : Infinity;

    return apiOk(
      {
        planId,
        repositories: repos.length,
        repositoryLimit: repoLimit,
        executionMinutesUsed: Math.round(counts.executionMinutesUsed * 100) / 100,
        executionMinutesLimit: minutesLimit,
        logRetentionDays: plan.logRetentionDays,
      },
      { requestId },
    );
  } catch {
    return apiError('Failed to load usage', {
      status: 500,
      requestId,
    });
  }
}

async function resolvePlanId(userId: string): Promise<PlanId | null> {
  const dbPlan = await getUserSubscriptionPlan(userId);
  if (dbPlan === 'pro' || dbPlan === 'enterprise' || (dbPlan && isAppSumoPlan(dbPlan as PlanId)))
    return dbPlan as PlanId;

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeSecretKey) return 'free';

  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim();
  if (!email) return 'free';

  try {
    const stripe = new Stripe(stripeSecretKey);
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];
    if (!customer) return 'free';

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    });

    const active = subscriptions.data.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing',
    );
    const priceId = active?.items.data[0]?.price?.id;
    if (!priceId) return 'free';

    if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return 'enterprise';
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
    return 'free';
  } catch {
    return 'free';
  }
}
