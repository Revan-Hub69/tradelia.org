import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle /dashboard routes - redirect to correct locale
  if (pathname === "/dashboard") {
    // Check if user is on /en path, redirect to /en/dashboard
    const referer = request.headers.get("referer");
    if (referer && referer.includes("/en")) {
      return NextResponse.redirect(new URL("/en/dashboard", request.url));
    }
  }

  // Simple middleware - just pass through
  // Next.js will handle routing to /en/page.tsx automatically
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
