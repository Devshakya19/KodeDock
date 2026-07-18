import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/shared/lib/auth-middleware";

export async function middleware(request: NextRequest) {
  // Skip ALL API routes — they handle their own auth
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  
  const response = await updateSession(request);

  // Security headers for page routes only
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
