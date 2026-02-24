/**
 * Returns whether billing (Stripe) is configured.
 * Used by the dashboard to show "Upgrade" vs "Coming soon".
 */
import { apiOk, getRequestId } from "@/lib/core/api-response";

export async function GET() {
  const requestId = getRequestId();
  const configured =
    !!process.env.STRIPE_SECRET_KEY?.trim() &&
    !!process.env.STRIPE_PRO_PRICE_ID?.trim() &&
    !!process.env.STRIPE_ENTERPRISE_PRICE_ID?.trim();

  return apiOk(
    { configured },
    { requestId, headers: { "Cache-Control": "private, max-age=60" } }
  );
}
