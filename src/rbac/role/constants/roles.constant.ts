export const DEFAULT_ROLE = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
} as const;

export type RoleName = (typeof DEFAULT_ROLE)[keyof typeof DEFAULT_ROLE];
export const SEED_ROLES: { name: string }[] = Object.values(DEFAULT_ROLE).map(
  (name) => ({ name }),
);
