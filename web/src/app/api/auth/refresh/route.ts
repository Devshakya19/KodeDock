import { NextResponse } from "next/server";
import { setAuthCookies, clearAuthCookies } from "@/shared/lib/auth/server";

const RUST_BACKEND = process.env.CORE_ENGINE_URL || "http://localhost:4001";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const refreshTokenMatch = cookieHeader.match(/kodedock_refresh_token=([^;]+)/);
    const refreshToken = refreshTokenMatch?.[1];

    if (!refreshToken) {
      const response = NextResponse.json(
        { success: false, error: "No refresh token available" },
        { status: 401 }
      );
      clearAuthCookies(response, request);
      return response;
    }

    const backendRes = await fetch(`${RUST_BACKEND}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      const response = NextResponse.json(
        { success: false, error: data.error || "Session refresh failed" },
        { status: backendRes.status === 200 ? 401 : backendRes.status }
      );
      clearAuthCookies(response, request);
      return response;
    }

    const response = NextResponse.json({
      success: true,
      data: { user: data.data.user },
    });

    // Set new 15-minute access token and rotated 7-day child refresh token
    setAuthCookies(response, request, {
      accessToken: data.data.token,
      refreshToken: data.data.refresh_token,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Auth refresh service unavailable" },
      { status: 502 }
    );
  }
}
