import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// NOTE: Avoid importing `@supabase/ssr` in Edge middleware because it pulls in
// Node APIs not supported by the Edge runtime (e.g. process.version). This caused
// build warnings and potential runtime failures. If you need to sync supabase
// sessions/cookies, handle that in server-side (Node) API routes or server components.

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Security headers sono già gestiti da next.config.js
  // Qui aggiungiamo solo header aggiuntivi se necessario

  // NOTE: Supabase session sync removed from middleware to keep Edge runtime safe.
  // If you want to reintroduce session sync, do it inside server-side endpoints.
  // For now we keep middleware lightweight and non-blocking.


  // Prevent /it URLs - redirect to root
  if (pathname.startsWith("/it")) {
    const newPath = pathname.replace(/^\/it/, '') || '/';
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Handle /dashboard routes - redirect to correct locale
  // NON fare redirect al login, permettere accesso guest
  if (pathname === "/dashboard") {
    // Check if user is on /en path, redirect to /en/dashboard
    const referer = request.headers.get("referer");
    if (referer && referer.includes("/en")) {
      return NextResponse.redirect(new URL("/en/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
