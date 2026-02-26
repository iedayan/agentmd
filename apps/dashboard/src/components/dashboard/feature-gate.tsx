"use client";

import { useEffect, useState } from "react";
import { billingService, PlanStatus } from "@/lib/services/billing-service";
import { Button } from "@/components/ui/button";
import { Shield, Lock, ArrowUpRight, Crown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/core/utils";

interface FeatureGateProps {
    children: React.ReactNode;
    feature: string;
    planRequired: "pro" | "enterprise";
    className?: string;
}

export function FeatureGate({ children, feature, planRequired, className }: FeatureGateProps) {
    const [status, setStatus] = useState<PlanStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const res = await billingService.getPlanStatus();
            if (res.ok && res.status) {
                setStatus(res.status);
            }
            setLoading(false);
        }
        void load();
    }, []);

    if (loading) return <div className="animate-pulse bg-muted/10 rounded-2xl h-64" />;

    const currentPlan = status?.currentPlan || "free";

    const hasAccess =
        (planRequired === "pro" && (currentPlan === "pro" || currentPlan === "enterprise")) ||
        (planRequired === "enterprise" && currentPlan === "enterprise");

    if (hasAccess) return <>{children}</>;

    return (
        <div className={cn("relative min-h-[400px] overflow-hidden rounded-[2rem] border border-border/40 group", className)}>
            {/* Blurred background content */}
            <div className="absolute inset-0 blur-[8px] grayscale pointer-events-none opacity-50 select-none scale-[1.02]">
                {children}
            </div>

            {/* Glass overlay */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center p-8">
                <div className="max-w-md w-full glass-card border-primary/20 bg-background/80 p-10 text-center shadow-2xl relative overflow-hidden border-luminescent border-beam">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-primary/10 blur-[40px]" />

                    <div className="relative z-10">
                        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20 shadow-glow/10 group-hover:scale-110 transition-transform duration-500">
                            {planRequired === 'enterprise' ? <Shield className="h-8 w-8" /> : <Crown className="h-8 w-8" />}
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 mb-2">Entitlement Required</p>
                        <h2 className="text-2xl font-black tracking-tight mb-4">{feature} is an {planRequired === 'enterprise' ? 'Enterprise' : 'Pro'} Feature</h2>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-8">
                            Enable advanced governance, centralized management, and priority support by upgrading your workspace.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button className="w-full rounded-[1.25rem] h-12 font-black text-[11px] uppercase tracking-widest shadow-glow btn-tactile" asChild>
                                <Link href="/dashboard/settings/billing">
                                    Upgrade to {planRequired === 'enterprise' ? 'Enterprise' : 'Pro'}
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full rounded-[1.25rem] h-12 font-black text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground" asChild>
                                <Link href="mailto:sales@agentmd.io">Contact Sales</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">
                <Lock className="h-3 w-3" />
                Protected by AgentMD Policy
            </div>
        </div>
    );
}
