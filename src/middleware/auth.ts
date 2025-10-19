import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@/types";

/**
 * Middleware to protect API routes
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const token = await getToken({ req: request });

  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return handler(request);
}

/**
 * Middleware to check user role
 */
export function withRole(roles: UserRole | UserRole[]) {
  return async (request: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>) => {
    const token = await getToken({ req: request });

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(token.role as UserRole)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    return handler(request);
  };
}

/**
 * Helper to get user from request
 */
export async function getUserFromRequest(request: NextRequest) {
  const token = await getToken({ req: request });
  return token
    ? {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as UserRole,
      }
    : null;
}


