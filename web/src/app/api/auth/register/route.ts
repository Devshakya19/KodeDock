import { NextResponse } from "next/server";
import { setAuthCookies } from "@/shared/lib/auth/server";

const RUST_BACKEND = process.env.CORE_ENGINE_URL || "http://localhost:4001";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${RUST_BACKEND}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      return NextResponse.json(
        { success: false, error: data.error || "Registration failed" },
        { status: backendRes.status }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: { user: data.data.user },
    });

    setAuthCookies(response, request, {
      accessToken: data.data.token,
      refreshToken: data.data.refresh_token,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Backend connection failed" },
      { status: 502 }
    );
  }
}

