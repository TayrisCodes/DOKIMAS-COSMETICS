import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { UserRole } from "@/types";

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

/**
 * Get the current session
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current user from session
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
}

/**
 * Require authentication (throws error if not authenticated)
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized - Please login to continue");
  }
  return user;
}

/**
 * Require specific role (throws error if user doesn't have role)
 */
export async function requireRole(role: UserRole | UserRole[]) {
  const user = await requireAuth();

  const roles = Array.isArray(role) ? role : [role];

  if (!roles.includes(user.role)) {
    throw new Error("Forbidden - You don't have permission to access this resource");
  }

  return user;
}
