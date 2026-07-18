import { NextResponse } from "next/server";

const RUST_BACKEND = process.env.CORE_ENGINE_URL || "http://localhost:4001";

function setAuthCookie(response: NextResponse, request: Request, token: string) {
  // Detect HTTPS from x-forwarded-proto (reverse proxy) or request URL
  const proto = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "");
  const isSecure = proto === "https";

  response.cookies.set("codehaat_token", token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 86400,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${RUST_BACKEND}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      return NextResponse.json(
        { success: false, error: data.error || "Login failed" },
        { status: backendRes.status }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: { user: data.data.user },
    });

    setAuthCookie(response, request, data.data.token);
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Backend connection failed" },
      { status: 502 }
    );
  }
}
