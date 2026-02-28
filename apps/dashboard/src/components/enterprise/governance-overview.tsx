'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { Approval } from '@/types';
import { governanceService } from '@/lib/services/governance-service';

export function GovernanceOverview() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    governanceService
      .getApprovals()
      .then((res) => {
        if (!cancelled && res.ok && Array.isArray(res.approvals)) {
          setApprovals(res.approvals);
        }
      })
      .catch(() => setApprovals([]))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <Card className="bento-card border-luminescent">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Governance</CardTitle>
        </div>
        <CardDescription className="text-xs">Approvals, policies, and audit trail</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Pending approvals</span>
          </div>
          {loading ? (
            <span className="text-sm text-muted-foreground">…</span>
          ) : (
            <Badge variant={pendingCount > 0 ? 'warning' : 'secondary'}>{pendingCount}</Badge>
          )}
        </div>
        {pendingCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {approvals.find((a) => a.status === 'pending')?.repositoryName ?? 'Repos'} need your
            decision
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link href="/dashboard/enterprise/team">
              Approvals
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/dashboard/audit">
              <FileText className="mr-1 h-3 w-3" aria-hidden />
              Audit
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/dashboard/enterprise/policies">Policies</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
