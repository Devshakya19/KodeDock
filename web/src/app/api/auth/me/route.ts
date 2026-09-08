import { NextResponse } from "next/server";
import { setAuthCookies, clearAuthCookies } from "@/shared/lib/auth/server";

const RUST_BACKEND = process.env.CORE_ENGINE_URL || "http://localhost:4001";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/kodedock_token=([^;]+)/);
    const refreshTokenMatch = cookieHeader.match(/kodedock_refresh_token=([^;]+)/);

    const token = tokenMatch?.[1];
    const refreshToken = refreshTokenMatch?.[1];

    // 1. If access token is present, attempt normal /me fetch
    if (token) {
      try {
        const backendRes = await fetch(`${RUST_BACKEND}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (backendRes.ok) {
          const data = await backendRes.json();
          if (data.success && data.data) {
            return NextResponse.json({ success: true, data: data.data });
          }
        }
      } catch {
        // Fallback to refresh if backend call errored with 401
      }
    }

    // 2. If access token is missing or expired, attempt automatic silent refresh
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${RUST_BACKEND}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        const refreshData = await refreshRes.json();

        if (refreshRes.ok && refreshData.success && refreshData.data) {
          const response = NextResponse.json({
            success: true,
            data: refreshData.data.user,
          });

          // Set rotated fresh credentials seamlessly
          setAuthCookies(response, request, {
            accessToken: refreshData.data.token,
            refreshToken: refreshData.data.refresh_token,
          });

          return response;
        }
      } catch {
        // Refresh failed
      }
    }

    // 3. Both access token and refresh token are invalid or expired
    const response = NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
    clearAuthCookies(response, request);
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Backend connection failed" },
      { status: 502 }
    );
  }
}

