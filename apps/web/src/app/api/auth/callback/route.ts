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

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // No code? Something went wrong — redirect to login
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  // Decode state — format: "role|nextUrl" or just "role"
  let role = "user";
  let nextUrl = "/browse";

  if (state) {
    try {
      const decoded = atob(state);
      const [stateRole, stateNext] = decoded.split("|");
      if (stateRole === "developer") role = "developer";
      if (stateNext) nextUrl = stateNext;
    } catch {
      // Malformed state — use defaults
    }
  }

  try {
    // Send the code to the Rust backend for exchange
    const backendRes = await fetch(`${RUST_BACKEND}/api/auth/github`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, role }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      const errorMsg = data.error || "GitHub authentication failed";
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMsg)}`);
    }

    // Redirect with the token set as a cookie
    const response = NextResponse.redirect(`${origin}${nextUrl}`);
    setAuthCookie(response, request, data.data.token);
    return response;
  } catch {
    return NextResponse.redirect(`${origin}/login?error=backend_unavailable`);
  }
}
