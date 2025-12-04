import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Security headers sono già gestiti da next.config.js
  // Qui aggiungiamo solo header aggiuntivi se necessario

  // Crea un client Supabase per sincronizzare i cookie
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(
          name: string,
          value: string,
          options: { name?: string; value?: string; [key: string]: unknown }
        ) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: { name?: string; value?: string; [key: string]: unknown }) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    });

    // Aggiorna la sessione per sincronizzare i cookie
    // Non bloccare se c'è un errore, solo logga
    try {
      await supabase.auth.getUser();
    } catch (error) {
      // Non bloccare il flusso se c'è un errore nella sincronizzazione
      console.error('Error syncing session in middleware:', error);
    }
  }

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
