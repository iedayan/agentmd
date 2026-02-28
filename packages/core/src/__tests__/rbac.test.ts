import { describe, it, expect } from 'vitest';
import { hasPermission, getRole } from '../enterprise/rbac.js';

describe('getRole', () => {
  it('returns admin role', () => {
    const role = getRole('admin');
    expect(role).toBeDefined();
    expect(role?.name).toBe('Admin');
    expect(role?.id).toBe('admin');
  });

  it('returns developer role', () => {
    const role = getRole('developer');
    expect(role?.name).toBe('Developer');
  });

  it('returns undefined for unknown role', () => {
    expect(getRole('unknown')).toBeUndefined();
  });
});

describe('hasPermission', () => {
  it('admin has full access to repositories', () => {
    const admin = getRole('admin');
    expect(admin).toBeDefined();
    if (!admin) return;
    expect(hasPermission(admin, 'repositories', 'read')).toBe(true);
    expect(hasPermission(admin, 'repositories', 'create')).toBe(true);
    expect(hasPermission(admin, 'repositories', 'update')).toBe(true);
    expect(hasPermission(admin, 'repositories', 'delete')).toBe(true);
    expect(hasPermission(admin, 'repositories', 'execute')).toBe(true);
  });

  it('developer can read and execute repositories', () => {
    const dev = getRole('developer');
    expect(dev).toBeDefined();
    if (!dev) return;
    expect(hasPermission(dev, 'repositories', 'read')).toBe(true);
    expect(hasPermission(dev, 'repositories', 'execute')).toBe(true);
    expect(hasPermission(dev, 'repositories', 'delete')).toBe(false);
  });

  it('viewer has read-only access', () => {
    const viewer = getRole('viewer');
    expect(viewer).toBeDefined();
    if (!viewer) return;
    expect(hasPermission(viewer, 'repositories', 'read')).toBe(true);
    expect(hasPermission(viewer, 'executions', 'read')).toBe(true);
    expect(hasPermission(viewer, 'repositories', 'execute')).toBe(false);
  });

  it('approver can approve executions', () => {
    const approver = getRole('approver');
    expect(approver).toBeDefined();
    if (!approver) return;
    expect(hasPermission(approver, 'executions', 'approve')).toBe(true);
    expect(hasPermission(approver, 'executions', 'read')).toBe(true);
  });

  it('returns false for resource not in role', () => {
    const viewer = getRole('viewer');
    expect(viewer).toBeDefined();
    if (!viewer) return;
    expect(hasPermission(viewer, 'policies', 'read')).toBe(false);
  });

  it('returns false for action not in resource permissions', () => {
    const dev = getRole('developer');
    expect(dev).toBeDefined();
    if (!dev) return;
    expect(hasPermission(dev, 'repositories', 'delete')).toBe(false);
  });
});
