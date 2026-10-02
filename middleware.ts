import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute =
    pathname === "/" || pathname === "/login" || pathname === "/signup";

  const isProtectedRoute = pathname.startsWith("/workspace");

  // If user is NOT logged in and trying to access workspace protected routes
  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user IS logged in and trying to access /login or /signup, send directly to /workspace
  if (token && (pathname === "/login" || pathname === "/signup")) {
    const workspaceUrl = new URL("/workspace", request.url);
    return NextResponse.redirect(workspaceUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
