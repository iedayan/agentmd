/**
 * AgentMD Enterprise Types
 */

export type SsoConfig = {
    enabled: boolean;
    provider: "okta" | "azure-ad" | "google-workspace" | "custom";
    entityId: string;
    ssoUrl: string;
    enforceSso: boolean;
    updatedAt: string;
};

export type Member = {
    id: string;
    name: string;
    email: string;
    roleId: string;
    ownedRepositoryIds: string[];
};

export type Role = {
    id: string;
    name: string;
    description: string
};

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Approval {
    id: string;
    repositoryName: string;
    reason: string;
    status: ApprovalStatus;
    createdAt: string;
}

export interface ComplianceArtifact {
    id: string;
    framework: "SOC2" | "ISO27001" | "HIPAA";
    name: string;
    status: "ready" | "in_progress";
    lastGeneratedAt: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    status: "success" | "warning" | "failure";
    location?: string;
    details?: any;
}

export interface PolicyRule {
    id: string;
    name: string;
    description: string;
    status: "active" | "inactive" | "bypass";
    requireApprovalForPatterns: string[];
    blockPatterns: string[];
    rules: string[];
    lastModified: string;
}

export type GitHubGate = {
    repositoryId: string;
    repositoryName: string;
    requiredChecks: string[];
    checks: Record<string, "success" | "failed" | "pending" | "missing">;
    updatedAt: string;
};

export type NotificationItem = {
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
    read: boolean;
};
