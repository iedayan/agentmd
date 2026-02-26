import { Approval, PolicyRule, AuditLogEntry, GitHubGate, NotificationItem } from "@/types";

/**
 * Service for managing Governance Workflows (Approvals, Policies, Audit).
 */
export const governanceService = {
    /**
     * Approvals
     */
    async getApprovals(): Promise<{ ok: boolean; approvals?: Approval[]; error?: string }> {
        const res = await fetch("/api/workflows/approvals", { cache: "no-store" });
        const body = await res.json();
        return res.ok ? { ok: true, approvals: body.approvals } : { ok: false, error: body.error };
    },

    async decideApproval(approvalId: string, decision: "approved" | "rejected", decidedBy: string): Promise<{ ok: boolean; error?: string }> {
        const res = await fetch("/api/workflows/approvals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ approvalId, decision, decidedBy }),
        });
        const body = await res.json();
        return res.ok ? { ok: true } : { ok: false, error: body.error };
    },

    /**
     * Policies
     */
    async getPolicies(): Promise<{ ok: boolean; policies?: PolicyRule[]; error?: string }> {
        const res = await fetch("/api/policies", { cache: "no-store" });
        const body = await res.json();
        return res.ok ? { ok: true, policies: body.policies } : { ok: false, error: body.error };
    },

    async togglePolicy(id: string, status: "active" | "inactive" | "bypass"): Promise<{ ok: boolean; error?: string }> {
        const res = await this.getPolicies();
        if (!res.ok || !res.policies) return { ok: false, error: res.error };
        const next = res.policies.map(p => p.id === id ? { ...p, status } : p);
        return this.updatePolicies(next);
    },

    async updatePolicies(policies: PolicyRule[]): Promise<{ ok: boolean; error?: string }> {
        const res = await fetch("/api/policies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ policies }),
        });
        const body = await res.json();
        return res.ok ? { ok: true } : { ok: false, error: body.error };
    },

    /**
     * Audit Logs
     */
    async getAuditLogs(): Promise<{ ok: boolean; logs?: AuditLogEntry[]; error?: string }> {
        const res = await fetch("/api/audit", { cache: "no-store" });
        const body = await res.json();
        return res.ok ? { ok: true, logs: body.logs } : { ok: false, error: body.error };
    },

    /**
     * Notifications
     */
    async getNotifications(): Promise<{ ok: boolean; notifications?: NotificationItem[]; error?: string }> {
        const res = await fetch("/api/workflows/notifications", { cache: "no-store" });
        const body = await res.json();
        return res.ok ? { ok: true, notifications: body.notifications } : { ok: false, error: body.error };
    },

    async markNotificationRead(id: string): Promise<{ ok: boolean; error?: string }> {
        const res = await fetch("/api/workflows/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        const body = await res.json();
        return res.ok ? { ok: true } : { ok: false, error: body.error };
    },

    /**
     * GitHub Status Gates
     */
    async getGithubGates(): Promise<{ ok: boolean; gates?: GitHubGate[]; error?: string }> {
        const res = await fetch("/api/github/checks", { cache: "no-store" });
        const body = await res.json();
        return res.ok ? { ok: true, gates: body.gates } : { ok: false, error: body.error };
    },

    async updateGithubGateStatus(repositoryId: string, checkName: string, status: string): Promise<{ ok: boolean; error?: string }> {
        const res = await fetch("/api/github/checks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ repositoryId, checkName, status }),
        });
        const body = await res.json();
        return res.ok ? { ok: true } : { ok: false, error: body.error };
    },

    /**
     * Preflight
     */
    async runPreflight(input: { repositoryId: string; trigger: string; requestedBy: string; agentId: string }): Promise<{ ok: boolean; error?: string; code?: string; details?: { approvalId?: string } }> {
        const res = await fetch("/api/preflight", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });
        const body = await res.json();
        return res.ok ? { ok: true } : { ok: false, error: body.error, code: body.code, details: body.details };
    }
};
