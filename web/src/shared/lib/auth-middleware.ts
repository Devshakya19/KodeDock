import { NextResponse, type NextRequest } from "next/server";
import { verifyRequest, type TokenClaims } from "@/shared/lib/server-auth";

// Roles
const ROLES = {
  USER: "user",
  DEVELOPER: "developer",
} as const;

export { ROLES };

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Verify token cryptographically — NOT a base64 decode.
  const claims: TokenClaims | null = await verifyRequest(request);

  const pathname = request.nextUrl.pathname;

  // --- Route classification ---
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/developer-register") ||
    pathname.startsWith("/verify");

  const isBuyerBrowse = pathname.startsWith("/browse");
  const isBuyerDashboard = pathname.startsWith("/dashboard");
  const isSellerDashboard = pathname.startsWith("/seller");
  const isCart = pathname.startsWith("/cart");
  const isCheckout = pathname.startsWith("/checkout");
  const isNotifications = pathname.startsWith("/notifications");
  const isOrders = pathname.startsWith("/orders");

  const isProtectedRoute =
    isBuyerBrowse ||
    isBuyerDashboard ||
    isSellerDashboard ||
    isCart ||
    isCheckout ||
    isNotifications ||
    isOrders;

  const role = claims?.role || ROLES.USER;

  // --- Rule 1: Unauthenticated → /login ---
  if (isProtectedRoute && !claims) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // --- Rule 2: Developer hits buyer routes → redirect to /seller ---
  if ((isBuyerBrowse || isBuyerDashboard || isCart || isCheckout) && role === ROLES.DEVELOPER) {
    const url = request.nextUrl.clone();
    url.pathname = "/seller";
    return NextResponse.redirect(url);
  }

  // --- Rule 3: Non-developer hits /seller → redirect to /browse ---
  if (isSellerDashboard && role !== ROLES.DEVELOPER) {
    const url = request.nextUrl.clone();
    url.pathname = "/browse";
    return NextResponse.redirect(url);
  }

  // --- Rule 4: Developer already registered hits /developer-register → /seller ---
  if (pathname.startsWith("/developer-register") && claims && role === ROLES.DEVELOPER) {
    const url = request.nextUrl.clone();
    url.pathname = "/seller";
    return NextResponse.redirect(url);
  }

  // --- Rule 5: Authenticated user hits auth pages → role-based redirect ---
  if (isAuthPage && claims) {
    const url = request.nextUrl.clone();
    url.pathname = role === ROLES.DEVELOPER ? "/seller" : "/browse";
    return NextResponse.redirect(url);
  }

  // --- Rule 6: Logged-in user hits / → role-based redirect ---
  if (pathname === "/" && claims) {
    const url = request.nextUrl.clone();
    url.pathname = role === ROLES.DEVELOPER ? "/seller" : "/browse";
    return NextResponse.redirect(url);
  }

  return response;
}
