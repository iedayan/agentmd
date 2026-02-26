"use client";

import { useEffect, useState } from "react";
import { Terminal, Activity, ChevronRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/core/utils";
import { Execution, ExecutionStatus } from "@/types";

interface RecentActivityFeedProps {
    executions: Execution[];
    className?: string;
}

export function RecentActivityFeed({ executions, className }: RecentActivityFeedProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    return (
        <div className={cn("flex flex-col h-full glass-card border-luminescent overflow-hidden", className)}>
            <div className="px-4 py-3 border-b border-primary/10 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Live Execution Feed</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500/80 uppercase">Streaming</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px] p-2 space-y-1 bg-black/20 custom-scrollbar">
                {executions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-primary/30 py-10">
                        <Activity className="h-8 w-8 mb-2 animate-pulse" />
                        <p>Waiting for events...</p>
                    </div>
                ) : (
                    executions.map((exe) => (
                        <div
                            key={exe.id}
                            className={cn(
                                "group relative p-2 rounded border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer",
                                activeId === exe.id && "bg-primary/10 border-primary/30 shadow-inner"
                            )}
                            onClick={() => setActiveId(activeId === exe.id ? null : exe.id)}
                        >
                            <div className="flex items-start gap-3">
                                <StatusIcon status={exe.status} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-primary/70 font-bold truncate">CMD_{exe.id.split("-")[0].toUpperCase()}</span>
                                        <span className="text-white/40 text-[9px]">{new Date(exe.startedAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="mt-1 text-white/90 truncate">
                                        <span className="text-white/40 mr-2">$</span>
                                        {exe.trigger === "push" ? `git push detected on ${exe.repositoryId}` : `manual trigger: run ${exe.id}`}
                                    </div>
                                    {activeId === exe.id && (
                                        <div className="mt-2 pt-2 border-t border-white/10 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="flex items-center gap-2 text-white/60">
                                                <ChevronRight className="h-3 w-3" />
                                                <span>Status: <span className={cn("font-bold", getStatusColor(exe.status))}>{exe.status}</span></span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white/60">
                                                <ChevronRight className="h-3 w-3" />
                                                <span>Duration: {exe.completedAt ? `${Math.round((new Date(exe.completedAt).getTime() - new Date(exe.startedAt).getTime()) / 1000)}s` : "In Progress"}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="px-4 py-2 border-t border-primary/10 bg-primary/5 flex items-center gap-4 overflow-hidden">
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <Clock className="h-3 w-3 text-primary/50" />
                    <span className="text-[9px] text-primary/50 font-bold uppercase tracking-widest">System Health</span>
                </div>
                <div className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 w-[92%] shadow-glow-sm" />
                </div>
            </div>
        </div>
    );
}

function StatusIcon({ status }: { status: ExecutionStatus }) {
    switch (status) {
        case "success":
            return <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />;
        case "failed":
            return <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />;
        case "running":
            return <Activity className="h-4 w-4 text-primary animate-spin mt-0.5" />;
        default:
            return <Clock className="h-4 w-4 text-white/30 mt-0.5" />;
    }
}

function getStatusColor(status: ExecutionStatus) {
    switch (status) {
        case "success":
            return "text-emerald-500";
        case "failed":
            return "text-destructive";
        case "running":
            return "text-primary";
        default:
            return "text-white/40";
    }
}
