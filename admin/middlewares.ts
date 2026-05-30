import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAdminCookie = Boolean(request.cookies.get(ADMIN_COOKIE_NAME));
  const isPublicAdminAuthPath =
    pathname.startsWith("/admin/login") || pathname.startsWith("/admin/create-admin");

  if (isPublicAdminAuthPath && hasAdminCookie) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname.startsWith("/admin") && !isPublicAdminAuthPath && !hasAdminCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};