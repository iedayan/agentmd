import { SsoConfig, Member, Role, ReleaseIntegrity, ComplianceArtifact } from '@/types';

/**
 * Service for managing Enterprise Identity and Access (SSO & RBAC).
 */
export const enterpriseService = {
  /**
   * SSO Configuration
   */
  async getSsoConfig(): Promise<{ ok: boolean; sso?: SsoConfig; error?: string }> {
    const res = await fetch('/api/enterprise/sso', { cache: 'no-store' });
    const body = await res.json();
    return res.ok ? { ok: true, sso: body.sso } : { ok: false, error: body.error };
  },

  async saveSsoConfig(
    config: SsoConfig,
  ): Promise<{ ok: boolean; sso?: SsoConfig; error?: string }> {
    const res = await fetch('/api/enterprise/sso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const body = await res.json();
    return res.ok ? { ok: true, sso: body.sso } : { ok: false, error: body.error };
  },

  /**
   * RBAC & Team Management
   */
  async getRbacData(): Promise<{
    ok: boolean;
    members?: Member[];
    roles?: Role[];
    error?: string;
  }> {
    const res = await fetch('/api/enterprise/rbac', { cache: 'no-store' });
    const body = await res.json();
    return res.ok
      ? { ok: true, members: body.members, roles: body.roles }
      : { ok: false, error: body.error };
  },

  async updateMemberRole(
    memberId: string,
    roleId: string,
  ): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch('/api/enterprise/rbac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, roleId }),
    });
    const body = await res.json();
    return res.ok ? { ok: true } : { ok: false, error: body.error };
  },

  async updateMemberOwnership(
    memberId: string,
    ownedRepositoryIds: string[],
  ): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch('/api/enterprise/rbac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, ownedRepositoryIds }),
    });
    const body = await res.json();
    return res.ok ? { ok: true } : { ok: false, error: body.error };
  },

  /**
   * Compliance Artifacts
   */
  async getComplianceArtifacts(): Promise<{
    ok: boolean;
    artifacts?: ComplianceArtifact[];
    error?: string;
  }> {
    const res = await fetch('/api/enterprise/compliance', { cache: 'no-store' });
    const body = await res.json();
    return res.ok ? { ok: true, artifacts: body.artifacts } : { ok: false, error: body.error };
  },

  /**
   * Release Integrity & SHAs
   */
  async getReleaseIntegrity(): Promise<{
    ok: boolean;
    integrity?: ReleaseIntegrity[];
    error?: string;
  }> {
    const res = await fetch('/api/enterprise/integrity', { cache: 'no-store' });
    const body = await res.json();
    return res.ok ? { ok: true, integrity: body.integrity } : { ok: false, error: body.error };
  },
};
