import { auth } from "@/auth";
import { NextResponse } from "next/server";

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

/** Redirect unauthenticated staff away from ERP routes. */
export default auth((req) => {
  const { pathname } = req.nextUrl;

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
