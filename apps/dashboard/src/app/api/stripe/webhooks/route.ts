/**
 * Stripe webhook handler.
 * Syncs subscription events to user_subscriptions for billing portal and plan resolution.
 *
 * Set up in Stripe Dashboard: Developers → Webhooks → Add endpoint
 * URL: https://agentmd.online/api/stripe/webhooks
 * Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
 * Copy the signing secret to STRIPE_WEBHOOK_SECRET.
 */
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { upsertUserSubscriptionPlanDb } from "@/lib/data/dashboard-data-db";
import { getPool } from "@/lib/data/db";

export const dynamic = "force-dynamic";

function planIdFromPriceId(priceId: string): "pro" | "enterprise" | null {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return "enterprise";
  return null;
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe
): Promise<void> {
  const customerId = session.customer as string | null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
  const userId = session.metadata?.userId ?? null;
  const planId = (session.metadata?.planId as string) ?? null;

  if (!customerId || !subscriptionId || !planId) return;
  if (planId !== "pro" && planId !== "enterprise") return;

  let resolvedUserId = userId;

  if (!resolvedUserId) {
    const pool = getPool();
    if (!pool) return;
    const email = session.customer_email ?? session.customer_details?.email;
    if (!email) return;
    const res = await pool.query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email]
    );
    resolvedUserId = res.rows[0]?.id ?? null;
  }

  if (!resolvedUserId) return;

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const status =
    sub.status === "trialing" ? "trialing" : sub.status === "active" ? "active" : "active";
  const currentPeriodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : undefined;

  await upsertUserSubscriptionPlanDb({
    userId: resolvedUserId,
    planId,
    status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    currentPeriodEnd,
  });
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) return;

  const planId = planIdFromPriceId(priceId);
  if (!planId) return;

  const pool = getPool();
  if (!pool) return;

  const res = await pool.query(
    `SELECT user_id FROM user_subscriptions WHERE stripe_customer_id = $1 LIMIT 1`,
    [customerId]
  );
  const userId = res.rows[0]?.user_id as string | undefined;
  if (!userId) return;

  const status =
    subscription.status === "active" || subscription.status === "trialing"
      ? subscription.status
      : "inactive";
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : undefined;

  await upsertUserSubscriptionPlanDb({
    userId,
    planId,
    status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd,
  });
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId = subscription.customer as string;

  const pool = getPool();
  if (!pool) return;

  const res = await pool.query(
    `SELECT user_id FROM user_subscriptions WHERE stripe_customer_id = $1 LIMIT 1`,
    [customerId]
  );
  const userId = res.rows[0]?.user_id as string | undefined;
  if (!userId) return;

  await upsertUserSubscriptionPlanDb({
    userId,
    planId: "free",
    status: "inactive",
  });
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error("[stripe/webhooks] STRIPE_WEBHOOK_SECRET not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeSecretKey) {
    return new Response("Stripe not configured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = new Stripe(stripeSecretKey).webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("[stripe/webhooks] Signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    const stripe = new Stripe(stripeSecretKey);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          await handleCheckoutSessionCompleted(session, stripe);
        }
        break;
      }
      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe/webhooks] Handler error:", err);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
