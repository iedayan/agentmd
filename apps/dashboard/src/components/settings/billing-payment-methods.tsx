"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_METHODS: { id: string; brand: string; last4: string; expiry: string }[] = [];

export function BillingPaymentMethods() {
  const methods = PLACEHOLDER_METHODS;
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    // Placeholder: would redirect to Stripe billing portal or add payment method
    await new Promise((r) => setTimeout(r, 500));
    setAdding(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Cards on file for subscription billing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {methods.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No payment methods on file. Add a card when you upgrade.
          </p>
        ) : (
          <div className="space-y-3">
            {methods.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium capitalize">{m.brand} •••• {m.last4}</p>
                  <p className="text-xs text-muted-foreground">Expires {m.expiry}</p>
                </div>
                <Button variant="ghost" size="sm" disabled>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" onClick={handleAdd} disabled={adding}>
          {adding ? "Opening..." : "Add payment method"}
        </Button>
      </CardContent>
    </Card>
  );
}
