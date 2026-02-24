"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_INVOICES: { id: string; date: string; amount: string; status: string }[] = [];

export function BillingInvoiceHistory() {
  const invoices = PLACEHOLDER_INVOICES;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice History</CardTitle>
        <CardDescription>
          Past invoices and receipts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No invoices yet. Invoices appear here when you have a paid subscription.
          </p>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{inv.date}</p>
                  <p className="text-sm text-muted-foreground">{inv.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{inv.amount}</span>
                  <Button variant="ghost" size="sm" disabled>
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
