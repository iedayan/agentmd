'use client';

import { BillingDashboard } from '@/components/dashboard/billing-dashboard';
import { BillingPaymentMethods } from '@/components/settings/billing-payment-methods';
import { BillingInvoiceHistory } from '@/components/settings/billing-invoice-history';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="px-6 pt-6 md:px-10 md:pt-10">
        <Link
          href="/dashboard/settings"
          className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
        >
          <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Back to Settings
        </Link>
      </div>

      <BillingDashboard />

      <div className="px-6 pb-10 md:px-10 max-w-7xl mx-auto w-full">
        <div className="grid gap-8 md:grid-cols-2">
          <BillingPaymentMethods />
          <BillingInvoiceHistory />
        </div>
      </div>
    </div>
  );
}
