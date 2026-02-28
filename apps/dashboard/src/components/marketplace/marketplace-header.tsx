'use client';

import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';

export function MarketplaceHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo size="sm" />
          AgentMD Marketplace
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/marketplace/developers">
            <Button variant="ghost">For Developers</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
