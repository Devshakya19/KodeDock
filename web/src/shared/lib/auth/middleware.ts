import { NextResponse, type NextRequest } from "next/server";
import { verifyRequest, verifyToken, setAuthCookies, type TokenClaims } from "@/shared/lib/auth/server";
import { ROLES } from "@/shared/lib/auth/roles";

export { ROLES };

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Verify token cryptographically — NOT a base64 decode.
  let claims: TokenClaims | null = await verifyRequest(request);

  // If access token is expired/missing, check if a 7-day refresh token is available
  const refreshToken = request.cookies.get("kodedock_refresh_token")?.value;
  if (!claims && refreshToken) {
    try {
      const RUST_BACKEND = process.env.CORE_ENGINE_URL || "http://localhost:4001";
      const refreshRes = await fetch(`${RUST_BACKEND}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const refreshData = await refreshRes.json();
      if (refreshRes.ok && refreshData.success && refreshData.data?.token) {
        claims = await verifyToken(refreshData.data.token);
        setAuthCookies(response, request, {
          accessToken: refreshData.data.token,
          refreshToken: refreshData.data.refresh_token,
        });
      }
    } catch {
      // Refresh failed, proceed unauthenticated
    }
  }

  const pathname = request.nextUrl.pathname;


  // --- Route classification ---
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/developer-register") ||
    pathname.startsWith("/verify");

  const isBuyerDashboard = pathname.startsWith("/dashboard");
  const isSellerDashboard = pathname.startsWith("/seller");
  const isCheckout = pathname.startsWith("/checkout");
  const isNotifications = pathname.startsWith("/notifications");
  const isOrders = pathname.startsWith("/orders");

  // Private routes that strictly require authentication
  const isProtectedRoute =
    isBuyerDashboard ||
    isSellerDashboard ||
    isCheckout ||
    isNotifications ||
    isOrders;

  const role = claims?.role || ROLES.USER;

  // --- Rule 1: Unauthenticated → /login for protected routes ---
  if (isProtectedRoute && !claims) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") {
      url.searchParams.set("returnUrl", encodeURIComponent(pathname + request.nextUrl.search));
    }
    return NextResponse.redirect(url);
  }

  // --- Rule 2: Developer hits buyer dashboard only → redirect to /seller ---
  if (isBuyerDashboard && role === ROLES.DEVELOPER) {
    const url = request.nextUrl.clone();
    url.pathname = "/seller";
    return NextResponse.redirect(url);
  }

  // --- Rule 3: Non-developer hits /seller → redirect to /explore ---
  if (isSellerDashboard && role !== ROLES.DEVELOPER && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/explore";
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
    url.pathname = role === ROLES.DEVELOPER ? "/seller" : "/explore";
    return NextResponse.redirect(url);
  }

  // --- Rule 6: Logged-in user hits / → role-based redirect ---
  if (pathname === "/" && claims) {
    const url = request.nextUrl.clone();
    url.pathname = role === ROLES.DEVELOPER ? "/seller" : "/explore";
    return NextResponse.redirect(url);
  }

  return response;
}
