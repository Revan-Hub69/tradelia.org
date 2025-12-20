import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const NONCE_BYTES = 16

function createNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(NONCE_BYTES))
  const chars = Array.from(bytes, (byte) => String.fromCharCode(byte))
  return btoa(chars.join(''))
}

function buildCsp(nonce: string) {
  return [
    "default-src 'self';",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic';`,
    "style-src 'self' 'unsafe-inline';",
    "img-src 'self' data: blob:;",
    "font-src 'self';",
    "connect-src 'self';",
    "frame-ancestors 'none';",
    "base-uri 'self';",
    "form-action 'self';",
    "object-src 'none';",
    'upgrade-insecure-requests;'
  ].join(' ')
}

export function middleware(request: NextRequest) {
  const nonce = createNonce()
  const csp = buildCsp(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site')
  response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
