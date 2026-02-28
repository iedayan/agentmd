'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Invoice = {
  id: string;
  date: string;
  amount: string;
  status: string;
  hostedInvoiceUrl?: string;
};

export function BillingInvoiceHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/billing/invoices', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d: { ok?: boolean; invoices?: Invoice[] }) => {
        setInvoices(d.invoices ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice History</CardTitle>
        <CardDescription>Past invoices and receipts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading invoices…</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No invoices yet. Invoices appear here when you have a paid subscription.
          </p>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{inv.date}</p>
                  <p className="text-sm text-muted-foreground">{inv.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{inv.amount}</span>
                  {inv.hostedInvoiceUrl ? (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={inv.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" disabled>
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
