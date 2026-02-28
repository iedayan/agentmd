import Link from 'next/link';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <Logo size="md" />
            AgentMD Status
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <h1 className="text-3xl font-bold">System Status</h1>
        <p className="text-muted-foreground mt-2">
          status.agentmd.online — Real-time uptime monitoring
        </p>

        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <CheckCircle className="h-8 w-8 text-emerald-500 shrink-0" />
            <div>
              <p className="font-medium">All Systems Operational</p>
              <p className="text-sm text-muted-foreground">
                API, Dashboard, Marketplace — 99.9% uptime (30d)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-4 opacity-80">
            <AlertCircle className="h-8 w-8 text-amber-500 shrink-0" />
            <div>
              <p className="font-medium">Scheduled Maintenance</p>
              <p className="text-sm text-muted-foreground">
                Feb 25, 02:00-04:00 UTC — Database upgrade
              </p>
            </div>
          </div>
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          Subscribe to updates at status.agentmd.online
        </p>
      </main>
    </div>
  );
}
