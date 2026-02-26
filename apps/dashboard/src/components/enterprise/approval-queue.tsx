"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ShieldCheck,
    CheckCircle2,
    Activity,
    AlertCircle,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/core/utils";

import { Approval } from "@/types";

interface ApprovalQueueProps {
    approvals: Approval[];
    onDecide: (id: string, decision: "approved" | "rejected") => Promise<void>;
    loading?: boolean;
    compact?: boolean;
}

export function ApprovalQueue({ approvals, onDecide, loading, compact }: ApprovalQueueProps) {
    const [deciding, setDeciding] = useState<string | null>(null);

    const handleDecision = async (id: string, decision: "approved" | "rejected") => {
        setDeciding(id);
        await onDecide(id, decision);
        setDeciding(null);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-2xl animate-pulse bg-muted/20 border border-border/20" />
                ))}
            </div>
        );
    }

    if (approvals.length === 0) {
        return (
            <div className="p-12 text-center border-2 border-dashed border-border/40 rounded-[2rem] opacity-40">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-4 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">Governance Queue Clear</p>
            </div>
        );
    }

    return (
        <div className={cn("grid gap-6", compact ? "grid-cols-1" : "md:grid-cols-2")}>
            {approvals.map((approval) => (
                <Card key={approval.id} className={cn(
                    "glass-card bg-background/40 backdrop-blur-md border border-border/40 overflow-hidden transition-all duration-300 hover:border-indigo-500/40 group",
                    approval.status === "pending" && "border-beam border-indigo-500/20"
                )}>
                    <CardHeader className="p-6 border-b border-border/5 bg-muted/5 group-hover:bg-indigo-500/[0.02] transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                                    <Activity className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-black text-foreground/90 tracking-tight uppercase">{approval.repositoryName}</CardTitle>
                                    <CardDescription className="text-[9px] font-black uppercase tracking-widest opacity-40">
                                        {new Date(approval.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge
                                variant={
                                    approval.status === "approved"
                                        ? "success"
                                        : approval.status === "rejected"
                                            ? "destructive"
                                            : "warning"
                                }
                                className="text-[9px] font-black uppercase px-2 py-0 shadow-sm"
                            >
                                {approval.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="mt-1 h-5 w-5 rounded-full bg-muted/20 flex items-center justify-center shrink-0">
                                <AlertCircle className="h-3 w-3 text-muted-foreground/60" />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                {approval.reason}
                            </p>
                        </div>

                        {approval.status === "pending" ? (
                            <div className="flex gap-3">
                                <Button
                                    size="sm"
                                    disabled={!!deciding}
                                    onClick={() => void handleDecision(approval.id, "approved")}
                                    className="flex-1 rounded-xl font-black text-[10px] uppercase h-10 shadow-glow shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 transition-all active:scale-95"
                                >
                                    {deciding === approval.id ? "Processing..." : "Grant Access"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={!!deciding}
                                    onClick={() => void handleDecision(approval.id, "rejected")}
                                    className="flex-1 rounded-xl font-black text-[10px] uppercase h-10 border-border/60 hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive transition-all active:scale-95"
                                >
                                    Deny Request
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3" />
                                    <span>Decision Recorded</span>
                                </div>
                                <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-all">
                                    <span>Full Log</span>
                                    <ArrowRight className="h-2 w-2" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
