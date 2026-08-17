import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/auth/middleware";

export async function middleware(request: NextRequest) {
  // 1. Generate a unique request ID for distributed tracing and observability
  const requestId = crypto.randomUUID();
  request.headers.set("x-request-id", requestId);

  // 2. Skip ALL API routes — they handle their own auth & CORS
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    response.headers.set("x-request-id", requestId);
    return response;
  }
  
  // 3. Delegate core authentication and role-based routing
  const response = await updateSession(request);

  // 4. Advanced Security Headers
  // Strict Transport Security (HSTS) for HTTPS enforcement
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Strict Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions Policy (Floc, Camera, Mic etc)
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
  // Inject the Request ID into the response for client-side debugging
  response.headers.set("x-request-id", requestId);
  // Ensure sensitive routes are never cached by intermediate proxies
  response.headers.set("Cache-Control", "no-store, must-revalidate");

  // 5. Content Security Policy (CSP)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://avatars.githubusercontent.com https://images.unsplash.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.stripe.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `;
  // Replace newlines and extra spaces to form a valid header string
  response.headers.set("Content-Security-Policy", cspHeader.replace(/\s{2,}/g, " ").trim());

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static assets, images, and next internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};