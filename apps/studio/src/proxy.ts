import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionToken =
    request.cookies.get("kodedock.session_token") ||
    request.cookies.get("__Secure-kodedock.session_token") ||
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionToken?.value) {
    const wwwUrl = process.env.NEXT_PUBLIC_WWW_URL || "http://localhost:3000";
    return NextResponse.redirect(
      new URL("/login?redirect=" + encodeURIComponent(request.url), wwwUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|kd.svg).*)",
  ],
};
