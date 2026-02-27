import { NextRequest } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { getClientKey } from "@/lib/core/request-context";
import { rateLimit } from "@/lib/core/rate-limit";
import { requireSessionUserId } from "@/lib/auth/session";
import { getPublicAppUrl } from "@/lib/core/public-url";

const PRO_TRIAL_DAYS = 7;

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  try {
    await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const rate = await rateLimit(getClientKey(req), {
    scope: "stripe-checkout",
    maxRequests: 12,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return apiError("Rate limit exceeded. Try again in a minute.", {
      status: 429,
      requestId,
      headers: { "X-RateLimit-Remaining": String(rate.remaining) },
      code: "RATE_LIMITED",
    });
  }

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return apiError("Billing is not configured. Upgrade will be available soon.", {
        status: 503,
        requestId,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
        code: "BILLING_NOT_CONFIGURED",
      });
    }

    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return apiError("Invalid request payload", {
        status: 400,
        requestId,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
        code: "INVALID_PAYLOAD",
      });
    }
    const body = raw as Record<string, unknown>;
    const planId = typeof body.planId === "string" ? body.planId : "";
    if (planId !== "pro" && planId !== "enterprise") {
      return apiError("planId must be 'pro' or 'enterprise'", {
        status: 400,
        requestId,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
        code: "INVALID_PLAN_ID",
      });
    }

    const priceId =
      planId === "pro"
        ? process.env.STRIPE_PRO_PRICE_ID
        : process.env.STRIPE_ENTERPRISE_PRICE_ID;
    if (!priceId) {
      return apiError("Billing is not configured. Upgrade will be available soon.", {
        status: 503,
        requestId,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
        code: "BILLING_NOT_CONFIGURED",
      });
    }

    const stripe = new Stripe(stripeSecretKey);
    const appUrl = getPublicAppUrl(req.nextUrl.origin);
    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData | undefined =
      planId === "pro" ? { trial_period_days: PRO_TRIAL_DAYS } : undefined;

    const sessionAuth = await getServerSession(authOptions);
    const customerEmail = sessionAuth?.user?.email?.trim() || undefined;
    const userId = sessionAuth?.user?.id;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/settings/billing?success=true`,
      cancel_url: `${appUrl}/dashboard/settings/billing?canceled=true`,
      metadata: {
        planId,
        trialDays: planId === "pro" ? String(PRO_TRIAL_DAYS) : "0",
        ...(userId && { userId }),
      },
      subscription_data: subscriptionData,
    });

    return apiOk(
      { url: session.url },
      {
        requestId,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
      }
    );
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return apiError("Failed to create checkout session", {
      status: 500,
      requestId,
      headers: { "X-RateLimit-Remaining": String(rate.remaining) },
      code: "CHECKOUT_SESSION_FAILED",
    });
  }
}
