"use client";

import { useEffect, useState } from "react";
import { ApprovalQueue } from "@/components/enterprise/approval-queue";
import { Approval } from "@/types";
import { governanceService } from "@/lib/services/governance-service";
import {
    Activity,
    History,
    FileText,
    Lock,
    MessageSquare,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function ApprovalsPage() {
    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadApprovals = async () => {
        setLoading(true);
        try {
            const res = await governanceService.getApprovals();
            if (!res.ok) throw new Error(res.error ?? "Failed to load approvals.");
            setApprovals(res.approvals ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Load failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadApprovals();
    }, []);

    const handleDecide = async (approvalId: string, decision: "approved" | "rejected") => {
        const res = await governanceService.decideApproval(approvalId, decision, "governance_center");
        if (!res.ok) {
            toast.error(res.error ?? "Decision failed.");
            return;
        }
        toast.success(`Approval ${decision} successfully.`);
        await loadApprovals();
    };

    return (
        <div className="p-6 md:p-10 space-y-10">
            <div className="relative overflow-hidden rounded-[2rem] border border-indigo-500/20 glass-card p-10 bg-gradient-to-br from-background via-background/90 to-indigo-500/10 shadow-glow/10 border-beam">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px]" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/80">Governance Terminal</p>
                        <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-gradient from-foreground to-indigo-500/60 transition-all">Approval Workflows</h1>
                        <p className="max-w-xl text-base font-medium text-muted-foreground leading-relaxed">
                            Human-in-the-loop validation for high-stakes agent operations. Enforce mandatory multi-sig approvals for sensitive resource mutations.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                        <div className="glass-card px-6 py-4 border border-indigo-500/20 bg-background/40">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Policy</p>
                                    <p className="text-sm font-black text-foreground">Multi-Sig V2</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                    {error}
                </div>
            )}
            <div className="flex items-center justify-between pb-2 border-b border-border/10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <Activity className="h-4 w-4 text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-indigo-500 transition-all">Pending Task ({approvals.filter(a => a.status === 'pending').length})</span>
                    </div>
                    <div className="flex items-center gap-2 group cursor-pointer opacity-40 hover:opacity-100 transition-all">
                        <History className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">History</span>
                    </div>
                    <div className="flex items-center gap-2 group cursor-pointer opacity-40 hover:opacity-100 transition-all">
                        <FileText className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Reports</span>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 rounded-lg gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-muted/40">
                    <Filter className="h-3.5 w-3.5" />
                    Filter
                </Button>
            </div>

            <ApprovalQueue
                approvals={approvals}
                onDecide={handleDecide}
                loading={loading}
            />

            <Card className="glass-card bg-orange-500/[0.03] border border-orange-500/20 shadow-xl mt-10">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        <div className="flex items-center gap-5">
                            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shrink-0">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-foreground tracking-tight uppercase">Custom Workflow?</h4>
                                <p className="text-xs font-medium text-muted-foreground mt-1">
                                    Enterprise customers can define specialized approval topologies via Slack or Microsoft Teams.
                                </p>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" className="rounded-xl font-black text-[10px] uppercase h-10 px-6 border-orange-500/20 text-orange-600 hover:bg-orange-500/5">
                            Contact Identity Arch
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
