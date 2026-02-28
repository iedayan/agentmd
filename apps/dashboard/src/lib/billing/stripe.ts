/**
 * Stripe configuration and helpers
 * Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in env
 */

export const STRIPE = {
  proPriceId: process.env.STRIPE_PRO_PRICE_ID ?? 'price_pro_monthly',
  enterprisePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? 'price_enterprise_monthly',
};
