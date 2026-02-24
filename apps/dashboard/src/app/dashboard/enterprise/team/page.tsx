"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Member = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  ownedRepositoryIds: string[];
};

type Role = { id: string; name: string; description: string };

type Approval = {
  id: string;
  repositoryName: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [ownerInput, setOwnerInput] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [rbacRes, approvalsRes, notificationsRes] = await Promise.all([
        fetch("/api/enterprise/rbac", { cache: "no-store" }),
        fetch("/api/workflows/approvals", { cache: "no-store" }),
        fetch("/api/workflows/notifications", { cache: "no-store" }),
      ]);
      const rbac = (await rbacRes.json()) as {
        ok?: boolean;
        roles?: Role[];
        members?: Member[];
        error?: string;
      };
      const approvalsBody = (await approvalsRes.json()) as {
        ok?: boolean;
        approvals?: Approval[];
        error?: string;
      };
      const notificationsBody = (await notificationsRes.json()) as {
        ok?: boolean;
        notifications?: NotificationItem[];
        error?: string;
      };
      if (!rbacRes.ok || rbac.ok === false) throw new Error(rbac.error ?? "Failed to load RBAC.");
      if (!approvalsRes.ok || approvalsBody.ok === false) {
        throw new Error(approvalsBody.error ?? "Failed to load approvals.");
      }
      if (!notificationsRes.ok || notificationsBody.ok === false) {
        throw new Error(notificationsBody.error ?? "Failed to load notifications.");
      }
      setRoles((rbac.roles ?? []).map((role) => ({ id: role.id, name: role.name, description: role.description })));
      setMembers(rbac.members ?? []);
      setApprovals(approvalsBody.approvals ?? []);
      setNotifications(notificationsBody.notifications ?? []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load team workflows.");
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const updateRole = async (memberId: string, roleId: string) => {
    const res = await fetch("/api/enterprise/rbac", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, roleId }),
    });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || body.ok === false) {
      setError(body.error ?? "Failed to update role.");
      return;
    }
    setMessage("Role updated.");
    void loadData();
  };

  const updateOwnership = async (memberId: string) => {
    const raw = ownerInput[memberId] ?? "";
    const ownedRepositoryIds = raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const res = await fetch("/api/enterprise/rbac", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, ownedRepositoryIds }),
    });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || body.ok === false) {
      setError(body.error ?? "Failed to update ownership.");
      return;
    }
    setMessage("Ownership updated.");
    void loadData();
  };

  const decideApproval = async (approvalId: string, decision: "approved" | "rejected") => {
    const res = await fetch("/api/workflows/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalId, decision, decidedBy: "team_approver" }),
    });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || body.ok === false) {
      setError(body.error ?? "Failed to update approval.");
      return;
    }
    setMessage(`Approval ${decision}.`);
    void loadData();
  };

  const markRead = async (id: string) => {
    await fetch("/api/workflows/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    void loadData();
  };

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team Workflows (RBAC, Approvals, Ownership)</h1>
        <p className="text-muted-foreground">
          Manage roles, route approvals, assign repository ownership, and monitor notifications.
        </p>
      </div>

      {message ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Roles & Ownership</CardTitle>
          <CardDescription>Assign role and repository ownership for each team member.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.roleId}
                    onChange={(event) => void updateRole(member.id, event.target.value)}
                    className="rounded-md border bg-background px-2 py-1 text-sm"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {member.ownedRepositoryIds.map((repositoryId) => (
                  <Badge key={repositoryId} variant="secondary">
                    owner:{repositoryId}
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  value={ownerInput[member.id] ?? member.ownedRepositoryIds.join(",")}
                  onChange={(event) =>
                    setOwnerInput((prev) => ({ ...prev, [member.id]: event.target.value }))
                  }
                  placeholder="Repository IDs: 1,2,3"
                />
                <Button size="sm" variant="outline" onClick={() => void updateOwnership(member.id)}>
                  Save Ownership
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Approval Queue</CardTitle>
            <CardDescription>Human-in-the-loop approvals for policy-gated executions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {approvals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No approvals yet.</p>
            ) : (
              approvals.map((approval) => (
                <div key={approval.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{approval.repositoryName}</p>
                    <Badge
                      variant={
                        approval.status === "approved"
                          ? "success"
                          : approval.status === "rejected"
                          ? "destructive"
                          : "warning"
                      }
                    >
                      {approval.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{approval.reason}</p>
                  {approval.status === "pending" ? (
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => void decideApproval(approval.id, "approved")}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void decideApproval(approval.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Notifications</CardTitle>
            <CardDescription>Approval and policy events for team visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div key={notification.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {!notification.read ? (
                      <Button size="sm" variant="ghost" onClick={() => void markRead(notification.id)}>
                        Mark read
                      </Button>
                    ) : (
                      <Badge variant="secondary">Read</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{notification.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
