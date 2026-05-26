import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { isDemoSkipAuth } from "./lib/demo-auth";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/finance",
  "/crm",
  "/operations",
] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

const { auth } = NextAuth(authConfig);

/** Redirect unauthenticated staff away from ERP routes (unless demo bypass is on). */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const demoBypass = isDemoSkipAuth();

  if (demoBypass) {
    if (pathname === "/" || pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    const target = req.auth ? "/dashboard" : "/login";
    return NextResponse.redirect(new URL(target, req.nextUrl));
  }

  if (pathname === "/login") {
    if (req.auth) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (isProtectedPath(pathname) && !req.auth) {
    const login = new URL("/login", req.nextUrl);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/finance/:path*",
    "/crm/:path*",
    "/operations/:path*",
  ],
};
