import { NextResponse, type NextRequest } from "next/server";
import { getUserRole, ROLES } from "@/shared/lib/roles";

// Simple JWT decode (no verification - verification happens on backend)
function decodeToken(token: string): { sub: string; email: string; role: string } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Get token from cookie or Authorization header
  const tokenCookie = request.cookies.get("codehaat_token")?.value;
  const authHeader = request.headers.get("Authorization");
  const token = tokenCookie || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

  let user = null;
  let role = "user";

  if (token) {
    const decoded = decodeToken(token);
    if (decoded) {
      user = { id: decoded.sub, email: decoded.email };
      role = decoded.role || "user";
    }
  }

  const pathname = request.nextUrl.pathname;

  // --- Route classification ---
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  const isBuyerBrowse = pathname.startsWith("/browse");
  const isBuyerDashboard = pathname.startsWith("/dashboard");
  const isSellerDashboard = pathname.startsWith("/seller");
  const isDeveloperRegister = pathname.startsWith("/developer-register");
  const isCart = pathname.startsWith("/cart");
  const isCheckout = pathname.startsWith("/checkout");
  const isNotifications = pathname.startsWith("/notifications");
  const isOrders = pathname.startsWith("/orders");

  const isProtectedRoute =
    isBuyerBrowse || isBuyerDashboard || isSellerDashboard || isCart || isCheckout || isNotifications || isOrders;

  // --- Rule 1: Unauthenticated → /login ---
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // --- Rule 2: Developer hits buyer routes → redirect to /seller ---
  if ((isBuyerBrowse || isBuyerDashboard || isCart || isCheckout) && user && role === ROLES.DEVELOPER) {
    const url = request.nextUrl.clone();
    url.pathname = "/seller";
    return NextResponse.redirect(url);
  }

  // --- Rule 3: Non-developer hits /seller → redirect to /browse ---
  if (isSellerDashboard && user && role !== ROLES.DEVELOPER) {
    const url = request.nextUrl.clone();
    url.pathname = "/browse";
    return NextResponse.redirect(url);
  }

  // --- Rule 4: Developer already registered hits /developer-register → /seller ---
  if (isDeveloperRegister && user && role === ROLES.DEVELOPER) {
    const url = request.nextUrl.clone();
    url.pathname = "/seller";
    return NextResponse.redirect(url);
  }

  // --- Rule 5: Authenticated user hits auth pages → role-based redirect ---
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = role === ROLES.DEVELOPER ? "/seller" : "/browse";
    return NextResponse.redirect(url);
  }

  // --- Rule 6: Logged-in user hits / → role-based redirect ---
  if (pathname === "/" && user) {
    const url = request.nextUrl.clone();
    url.pathname = role === ROLES.DEVELOPER ? "/seller" : "/browse";
    return NextResponse.redirect(url);
  }

  return response;
}
