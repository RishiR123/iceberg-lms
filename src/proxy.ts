import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic gate only: it checks for the presence of a session cookie, not its
// validity. Real authorization lives in the pages (getLoggedInUser) and in the
// server actions (requireAdmin), which are what actually touch data.
const PROTECTED = ["/dashboard", "/courses", "/progress", "/profile", "/admin", "/learn", "/course"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  // Literal, not the SESSION_COOKIE constant: proxy runs in the edge runtime and
  // cannot import the node auth module. Keep this name in sync with it.
  if (request.cookies.has("jwt_token")) {
    return NextResponse.next();
  }

  // Send people to the portal that matches where they were heading.
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const loginUrl = new URL(isAdminRoute ? "/adminlogin" : "/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*", "/progress/:path*", "/profile/:path*", "/admin/:path*", "/learn/:path*", "/course/:path*"],
};
