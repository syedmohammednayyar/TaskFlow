import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Path prefixes that require authentication. Unauthenticated requests are
 * redirected to /login with a callbackUrl.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/tasks",
  "/my-tasks",
  "/assigned",
  "/kanban",
  "/settings",
];

function isProtected(pathname) {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

/**
 * Build a per-request CSP. In development we relax script/connect rules so
 * Next.js HMR + React Refresh (which need eval and websockets) keep working;
 * production uses a strict nonce + strict-dynamic policy.
 */
function buildCsp(nonce, isDev) {
  const scriptSrc = isDev
    ? `'self' 'unsafe-eval' 'unsafe-inline'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;
  const connectSrc = isDev ? `'self' ws: wss:` : `'self'`;

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    // framer-motion / next inject inline styles; nonce-per-style isn't feasible.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://api.dicebear.com https://ui-avatars.com`,
    `font-src 'self' data:`,
    `connect-src ${connectSrc}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

function applySecurityHeaders(headers, csp) {
  headers.set("Content-Security-Policy", csp);
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );
  headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const isDev = process.env.NODE_ENV !== "production";

  // Per-request nonce (Web Crypto is available in the edge runtime).
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const nonce = btoa(String.fromCharCode(...bytes));
  const csp = buildCsp(nonce, isDev);

  // Auth gate for protected routes.
  if (isProtected(pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Forward the nonce + CSP to the app so Next can nonce its own scripts and
  // server components can read it via headers().
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  applySecurityHeaders(response.headers, csp);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match every request path except static assets and image files, so
     * security headers cover pages and API routes alike.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
