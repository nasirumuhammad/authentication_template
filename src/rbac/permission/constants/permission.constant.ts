export const DEFAULT_PERMISSIONS = {
  // User
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Role
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',

  // Permission
  PERMISSION_CREATE: 'permission:create',
  PERMISSION_READ: 'permission:read',
  PERMISSION_UPDATE: 'permission:update',
  PERMISSION_DELETE: 'permission:delete',

  // Role-Permission assignment
  ROLE_PERMISSION_ASSIGN: 'role-permission:assign',
  ROLE_PERMISSION_REVOKE: 'role-permission:revoke',

  // User-Role assignment
  USER_ROLE_ASSIGN: 'user-role:assign',
  USER_ROLE_REVOKE: 'user-role:revoke',

  // User-Permission direct grant
  USER_PERMISSION_GRANT: 'user-permission:grant',
  USER_PERMISSION_REVOKE: 'user-permission:revoke',
} as const;

export type PermissionKey =
  (typeof DEFAULT_PERMISSIONS)[keyof typeof DEFAULT_PERMISSIONS];

export const SEED_PERMISSIONS: { key: string }[] = Object.values(
  DEFAULT_PERMISSIONS,
).map((key) => ({ key }));
