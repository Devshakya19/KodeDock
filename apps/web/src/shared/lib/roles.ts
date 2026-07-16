export const ROLES = {
  USER: "user",
  DEVELOPER: "developer",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export function getUserRole(
  user: { role?: string } | null
): UserRole {
  if (!user) return ROLES.USER;
  return (user.role as UserRole) || ROLES.USER;
}

export function isDeveloper(role: UserRole): boolean {
  return role === ROLES.DEVELOPER;
}
