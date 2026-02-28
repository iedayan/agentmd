/**
 * Enterprise RBAC - Role-Based Access Control
 * Custom roles with granular permissions.
 */
export const BUILTIN_ROLES = {
  admin: {
    id: 'admin',
    name: 'Admin',
    description: 'Full access to all resources',
    permissions: [
      { resource: 'repositories', actions: ['read', 'create', 'update', 'delete', 'execute'] },
      { resource: 'executions', actions: ['read', 'create', 'delete'] },
      { resource: 'audit_logs', actions: ['read'] },
      { resource: 'settings', actions: ['read', 'update'] },
      { resource: 'billing', actions: ['read', 'update'] },
      { resource: 'team', actions: ['read', 'create', 'update', 'delete'] },
      { resource: 'policies', actions: ['read', 'create', 'update', 'delete'] },
    ],
  },
  developer: {
    id: 'developer',
    name: 'Developer',
    description: 'Run executions, view repos',
    permissions: [
      { resource: 'repositories', actions: ['read', 'execute'] },
      { resource: 'executions', actions: ['read', 'create'] },
      { resource: 'settings', actions: ['read'] },
    ],
  },
  viewer: {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      { resource: 'repositories', actions: ['read'] },
      { resource: 'executions', actions: ['read'] },
    ],
  },
  approver: {
    id: 'approver',
    name: 'Approver',
    description: 'Approve human-in-the-loop workflows',
    permissions: [
      { resource: 'repositories', actions: ['read'] },
      { resource: 'executions', actions: ['read', 'approve'] },
    ],
  },
};
export function hasPermission(role, resource, action) {
  const perm = role.permissions.find((p) => p.resource === resource);
  if (!perm) return false;
  return perm.actions.includes(action);
}
export function getRole(roleId) {
  return BUILTIN_ROLES[roleId];
}
