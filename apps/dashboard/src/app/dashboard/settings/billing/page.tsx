import Link from "next/link";
import { UpgradeCard } from "@/components/dashboard/upgrade-card";
import { BillingPaymentMethods } from "@/components/settings/billing-payment-methods";
import { BillingInvoiceHistory } from "@/components/settings/billing-invoice-history";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href="/dashboard/settings"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      <div className="space-y-8">
        {/* Current subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Free plan — upgrade for more</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Free</p>
                <p className="text-sm text-muted-foreground">
                  3 repos · 100 min/month · 7-day log retention
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="#upgrade">Upgrade</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment methods */}
        <BillingPaymentMethods />

        {/* Invoice history */}
        <BillingInvoiceHistory />

        {/* Upgrade plans */}
        <div id="upgrade">
          <h2 className="text-lg font-semibold mb-4">Upgrade Plan</h2>
          <UpgradeCard />
        </div>
      </div>
    </div>
  );
}
