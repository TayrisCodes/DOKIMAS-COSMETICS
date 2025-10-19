import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const token = req.auth;
  const isLoggedIn = !!token;
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/verify",
    "/forgot-password",
    "/reset-password",
    "/shop",
    "/about",
    "/contact",
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Dashboard routes
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // If accessing dashboard without being logged in, redirect to login
  if (isDashboardRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
  }

  // Role-based access control for dashboard routes
  if (isDashboardRoute && isLoggedIn) {
    const userRole = token?.user?.role;

    // Admin dashboard - only accessible by admins
    if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/customer", req.url));
    }

    // Retail dashboard - only accessible by retail managers and admins
    if (pathname.startsWith("/dashboard/retail") && userRole !== "retail_manager" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/customer", req.url));
    }

    // Customer dashboard - accessible by all authenticated users
    // No additional check needed
  }

  // If logged in and trying to access auth pages, redirect to appropriate dashboard
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    const userRole = token?.user?.role;
    
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    } else if (userRole === "retail_manager") {
      return NextResponse.redirect(new URL("/dashboard/retail", req.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard/customer", req.url));
    }
  }

  // Allow the request to continue
  return NextResponse.next();
});

// Configure which routes should be processed by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$).*)",
  ],
};







