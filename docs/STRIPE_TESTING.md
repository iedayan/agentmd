# Stripe Billing — Manual Testing Guide

Use these steps to verify Stripe checkout and webhooks work end-to-end.

## Prerequisites

- Stripe account in **Test mode** (toggle in Stripe Dashboard)
- Test keys in Vercel: `STRIPE_SECRET_KEY` (sk_test_...), `STRIPE_WEBHOOK_SECRET` (whsec_...)
- Logged-in user on agentmd.online

---

## 1. Test Checkout Flow

1. Go to **https://agentmd.online/dashboard/settings** (or **Pricing** → Upgrade)
2. Click **Upgrade with Stripe** (Pro or Enterprise)
3. You should be redirected to Stripe Checkout
4. Use Stripe test card: **4242 4242 4242 4242**
   - Expiry: any future date (e.g. 12/34)
   - CVC: any 3 digits
   - ZIP: any 5 digits
5. Complete checkout
6. You should land on `/dashboard/settings/billing?success=true`

---

## 2. Verify Webhook Received

1. In **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click your endpoint (`https://agentmd.online/api/stripe/webhooks`)
3. Check **Recent deliveries** — you should see `checkout.session.completed` with status **200**
4. If you see **4xx/5xx**, click the event to see the response body and fix the issue

---

## 3. Verify Plan Upgrade

1. After completing checkout, go to **Dashboard** → **Settings** → **Usage**
2. Your plan should show **Pro** (or **Enterprise**)
3. Repository and execution limits should reflect the new plan

---

## 4. Test Billing Portal

1. Go to **Dashboard** → **Settings** → **Billing**
2. Click **Manage subscription** (or similar)
3. You should open Stripe Customer Portal to update payment method, view invoices, or cancel

---

## 5. Send Test Webhook (Optional)

To test the webhook without a real checkout:

1. **Stripe Dashboard** → **Developers** → **Webhooks** → your endpoint
2. Click **Send test webhook**
3. Select **checkout.session.completed**
4. Click **Send test webhook**
5. Check for **200** response

Note: Test events have placeholder data. Your DB may not update correctly (e.g. no matching user). Use a real test checkout for full verification.

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| Checkout returns 503 | `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_ENTERPRISE_PRICE_ID` set in Vercel |
| Webhook returns 400 | `STRIPE_WEBHOOK_SECRET` matches the signing secret from Stripe |
| Plan not updating | Webhook endpoint URL correct; check Stripe webhook delivery logs |
| Billing portal fails | Webhook must run first to sync `stripe_customer_id` to DB |
