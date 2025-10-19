import { requireRole } from "@/lib/auth";

/**
 * Require admin role for CMS operations
 * Throws error if user is not authenticated or not an admin
 */
export async function requireAdmin() {
  const user = await requireRole("admin");
  return user;
}


