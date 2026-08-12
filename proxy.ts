import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/vehicles") ||
    pathname.startsWith("/employees") ||
    pathname.startsWith("/activity") ||
    pathname.startsWith("/notifications");

  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vehicles/:path*",
    "/employees/:path*",
    "/activity/:path*",
    "/notifications/:path*",
    "/login",
  ],
};
