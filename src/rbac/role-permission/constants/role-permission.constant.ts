import { DEFAULT_PERMISSIONS } from "@/rbac/permission/constants/permission.constant";
import { DEFAULT_ROLE } from "@/rbac/role/constants/roles.constant";


export const SEED_ROLE_PERMISSIONS: {
  roleName: string;
  permissionKey: string;
}[] = [
  // Admin gets everything
  ...Object.values(DEFAULT_PERMISSIONS).map((permissionKey) => ({
    roleName: DEFAULT_ROLE.ADMIN,
    permissionKey,
  })),

  // Customer gets profile-level access only
  {
    roleName: DEFAULT_ROLE.CUSTOMER,
    permissionKey: DEFAULT_PERMISSIONS.USER_READ,
  },
  {
    roleName: DEFAULT_ROLE.CUSTOMER,
    permissionKey: DEFAULT_PERMISSIONS.USER_UPDATE,
  },
];
