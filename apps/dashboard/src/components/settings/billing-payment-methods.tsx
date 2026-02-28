'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type PaymentMethod = { id: string; brand: string; last4: string; expiry: string };

export function BillingPaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch('/api/billing/payment-methods', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d: { ok?: boolean; methods?: PaymentMethod[] }) => {
        setMethods(d.methods ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    setAdding(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data.error ?? 'Could not open billing portal.');
    } catch {
      alert('Could not open billing portal.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Cards on file for subscription billing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading payment methods…</p>
        ) : methods.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No payment methods on file. Add a card when you upgrade.
          </p>
        ) : (
          <div className="space-y-3">
            {methods.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium capitalize">
                    {m.brand} •••• {m.last4}
                  </p>
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
          {adding ? 'Opening...' : 'Add payment method'}
        </Button>
      </CardContent>
    </Card>
  );
}
