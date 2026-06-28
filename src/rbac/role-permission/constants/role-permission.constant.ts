import { RoleName } from '@/rbac/role/constants/roles.constant';

export const SEED_ROLE_PERMISSIONS: {
  roleName: RoleName;
  permissionKey: string;
}[] = [
  { roleName: 'customer', permissionKey: 'orders:create' },
  { roleName: 'customer', permissionKey: 'orders:read' },
  { roleName: 'admin', permissionKey: 'orders:read' },
  { roleName: 'admin', permissionKey: 'orders:delete' },
];
