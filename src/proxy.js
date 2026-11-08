import { NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/team",
  "/wallet",
  "/commissions",
  "/products",
  "/orders",
  "/kpi",
  "/notifications",
  "/super-shop",
  "/secure-life",
  "/admin",
];

// Routes accessible only to unauthenticated visitors
const AUTH_PREFIXES = [
  "/login",
  "/register",
];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("netrise_token")?.value;

  // Allow public landing page (/)
  if (pathname === "/") {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isAuthRoute = AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // 1. Unauthorized access to protected routes -> Redirect to /login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Already logged in user accessing /login or /register -> Redirect to /dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/team/:path*",
    "/wallet/:path*",
    "/commissions/:path*",
    "/products/:path*",
    "/orders/:path*",
    "/kpi/:path*",
    "/notifications/:path*",
    "/super-shop/:path*",
    "/secure-life/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
