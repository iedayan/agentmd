'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  ShieldCheck,
  Bell,
  Crown,
  ChevronRight,
  Settings,
  Mail,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/core/utils';
import { Member, Role, Approval, NotificationItem } from '@/types';
import { ApprovalQueue } from '@/components/enterprise/approval-queue';
import { enterpriseService } from '@/lib/services/enterprise-service';
import { governanceService } from '@/lib/services/governance-service';

import { toast } from 'sonner';
import { FeatureGate } from '@/components/dashboard/feature-gate';

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [ownerInput, setOwnerInput] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rbacRes, approvalsRes, notificationsRes] = await Promise.all([
        enterpriseService.getRbacData(),
        governanceService.getApprovals(),
        governanceService.getNotifications(),
      ]);

      if (!rbacRes.ok) throw new Error(rbacRes.error ?? 'Failed to load RBAC.');
      if (!approvalsRes.ok) throw new Error(approvalsRes.error ?? 'Failed to load approvals.');
      if (!notificationsRes.ok)
        throw new Error(notificationsRes.error ?? 'Failed to load notifications.');

      setRoles(rbacRes.roles ?? []);
      setMembers(rbacRes.members ?? []);
      setApprovals(approvalsRes.approvals ?? []);
      setNotifications(notificationsRes.notifications ?? []);
    } catch (loadError) {
      toast.error(
        loadError instanceof Error ? loadError.message : 'Failed to load team workflows.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const updateRole = async (memberId: string, roleId: string) => {
    const res = await enterpriseService.updateMemberRole(memberId, roleId);
    if (!res.ok) {
      toast.error(res.error ?? 'Failed to update role.');
      return;
    }
    toast.success('Role updated.');
    void loadData();
  };

  const updateOwnership = async (memberId: string) => {
    const raw = ownerInput[memberId] ?? '';
    const ownedRepositoryIds = raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const res = await enterpriseService.updateMemberOwnership(memberId, ownedRepositoryIds);
    if (!res.ok) {
      toast.error(res.error ?? 'Failed to update ownership.');
      return;
    }
    toast.success('Ownership updated.');
    void loadData();
  };

  const decideApproval = async (approvalId: string, decision: 'approved' | 'rejected') => {
    const res = await governanceService.decideApproval(approvalId, decision, 'team_approver');
    if (!res.ok) {
      toast.error(res.error ?? 'Failed to update approval.');
      return;
    }
    toast.success(`Approval ${decision}.`);
    void loadData();
  };

  const markRead = async (id: string) => {
    await governanceService.markNotificationRead(id);
    void loadData();
  };

  return (
    <FeatureGate feature="Granular Team RBAC" planRequired="enterprise">
      <div className="p-6 md:p-10 space-y-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 glass-card p-10 bg-gradient-to-br from-background via-background/90 to-primary/10 shadow-glow/5">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
                Identity & Access
              </p>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-gradient mt-4">
                Team Governance
              </h1>
              <p className="mt-4 max-w-2xl text-base font-medium text-muted-foreground leading-relaxed">
                Manage member roles, route human-in-the-loop approvals, and assign repository
                ownership for granular resource isolation.
              </p>
            </div>
            <Button className="rounded-2xl btn-tactile font-black text-xs h-12 px-6 gap-2 shrink-0">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-10">
            <Card className="glass-card bg-background/40 backdrop-blur-md border border-border/40 overflow-hidden shadow-2xl">
              <CardHeader className="p-6 border-b border-border/10 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black text-foreground/90 tracking-tight">
                      Access Directory
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">
                      Manage {members.length} team members
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-glow-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                    Vault Sync Active
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 rounded-2xl animate-pulse bg-muted/20 border border-border/20"
                      />
                    ))}
                  </div>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="bento-card border-luminescent group p-6 transition-all duration-300 hover:border-primary/40"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-12 w-12 rounded-full bg-muted/50 border border-border/40 flex items-center justify-center text-lg font-black text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            {member.name.charAt(0)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-foreground/90 tracking-tight">
                                {member.name}
                              </p>
                              {member.roleId === 'admin' && (
                                <Crown className="h-3 w-3 text-orange-500" />
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 opacity-60">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="space-y-1 shrink-0">
                            <label className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">
                              Assigned Role
                            </label>
                            <select
                              value={member.roleId}
                              onChange={(event) => void updateRole(member.id, event.target.value)}
                              className="w-32 h-9 rounded-xl border border-border/40 bg-muted/20 px-3 py-1.5 text-[11px] font-black focus:ring-1 focus:ring-primary/40 focus:outline-none focus:bg-muted/40 transition-all appearance-none cursor-pointer text-center uppercase tracking-widest"
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="h-9 w-9 rounded-xl border border-border/40 flex items-center justify-center hover:bg-muted/40 cursor-pointer transition-all">
                            <Settings className="h-4 w-4 text-muted-foreground/60" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/10 pt-4">
                        <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                          Ownership:
                        </span>
                        {member.ownedRepositoryIds.map((repositoryId) => (
                          <Badge
                            key={repositoryId}
                            variant="outline"
                            className="text-[9px] font-black tracking-widest uppercase px-2.5 py-0.5 border-primary/20 bg-primary/5 text-primary"
                          >
                            ID:{repositoryId}
                          </Badge>
                        ))}
                        <div className="flex-1 min-w-[200px] flex gap-2">
                          <Input
                            value={ownerInput[member.id] ?? member.ownedRepositoryIds.join(',')}
                            onChange={(event) =>
                              setOwnerInput((prev) => ({
                                ...prev,
                                [member.id]: event.target.value,
                              }))
                            }
                            placeholder="Repo IDs (1,2...)"
                            className="h-8 rounded-lg border-border/40 bg-muted/20 text-[10px] font-bold focus:ring-primary/40"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all"
                            onClick={() => void updateOwnership(member.id)}
                          >
                            Sync IDs
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <Card className="glass-card bg-indigo-500/[0.03] border-indigo-500/20 shadow-2xl overflow-hidden border-beam">
              <CardHeader className="p-6 border-b border-indigo-500/10 bg-indigo-500/5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black text-foreground/90 tracking-tight">
                      Approval Queue
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">
                      Pending policy guardrails
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <ApprovalQueue
                approvals={approvals}
                onDecide={decideApproval}
                loading={loading}
                compact
              />
            </Card>

            <Card className="glass-card bg-background/40 backdrop-blur-md border border-border/40 overflow-hidden shadow-xl">
              <CardHeader className="p-6 border-b border-border/10">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black text-foreground/90 tracking-tight">
                      Governance Log
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">
                      Real-time activity stream
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/10">
                  {notifications.length === 0 ? (
                    <p className="p-10 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                      Zero Events recorded.
                    </p>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-5 transition-all group hover:bg-muted/10',
                          !notification.read && 'bg-primary/[0.02]',
                        )}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <p className="text-xs font-black text-foreground/80 tracking-tight">
                            {notification.title}
                          </p>
                          <div className="shrink-0 flex items-center gap-2">
                            <span className="text-[8px] font-black text-muted-foreground/40 uppercase font-mono">
                              {new Date(notification.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {!notification.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed line-clamp-2">
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <div className="mt-3 flex justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary rounded-lg"
                              onClick={() => void markRead(notification.id)}
                            >
                              Mark Read
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <div className="p-4 border-t border-border/10 flex justify-center">
                <Button
                  variant="link"
                  className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-muted-foreground hover:text-primary group"
                >
                  View Full Audit Trail
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
