import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/shared/lib/auth/middleware";

export async function proxy(request: NextRequest) {
  // 1. Generate unique request ID for distributed tracing
  const requestId = crypto.randomUUID();
  request.headers.set("x-request-id", requestId);

  // 2. Skip API routes — they handle their own auth and validation
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    response.headers.set("x-request-id", requestId);
    return response;
  }

  // 3. Delegate core authentication and role-based route protection
  const response = await updateSession(request);

  // 4. Advanced Security Headers
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );
  response.headers.set("x-request-id", requestId);
  response.headers.set("Cache-Control", "no-store, must-revalidate");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
