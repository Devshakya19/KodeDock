import { NextResponse, NextRequest } from "next/server";

const RUST_BACKEND = process.env.CORE_ENGINE_URL || "http://localhost:4001";

function setAuthCookie(response: NextResponse, request: NextRequest, token: string) {
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

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // No code? Something went wrong — redirect to login
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  // Decode state — format: "role|nextUrl" or "link|nextUrl"
  let action = "login";
  let role = "user";
  let nextUrl = "/browse";

  if (state) {
    try {
      const decoded = atob(state);
      const [stateRole, stateNext] = decoded.split("|");
      if (stateRole === "link") {
        action = "link";
      } else if (stateRole === "developer") {
        role = "developer";
      }
      if (stateNext) nextUrl = stateNext;
    } catch {
      // Malformed state — use defaults
    }
  }

  try {
    if (action === "link") {
      const token = request.cookies.get("codehaat_token")?.value;
      if (!token) {
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("You must be logged in to link an account")}`);
      }

      const backendRes = await fetch(`${RUST_BACKEND}/api/auth/github/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });

      const data = await backendRes.json();
      if (!backendRes.ok || !data.success) {
        const errorMsg = data.error || "GitHub linking failed";
        return NextResponse.redirect(`${origin}${nextUrl}?error=${encodeURIComponent(errorMsg)}`);
      }

      return NextResponse.redirect(`${origin}${nextUrl}?success=${encodeURIComponent("GitHub account linked successfully!")}`);
    }

    // Normal login flow
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

    // Smart redirect: if they are logging in from the generic login page (nextUrl === "/browse")
    // but they actually have a "developer" role, redirect them to the seller dashboard instead.
    if (nextUrl === "/browse" && data.data.user?.role === "developer") {
      nextUrl = "/seller";
    }

    // Redirect with the token set as a cookie
    const response = NextResponse.redirect(`${origin}${nextUrl}`);
    setAuthCookie(response, request, data.data.token);
    return response;
  } catch {
    return NextResponse.redirect(`${origin}/login?error=backend_unavailable`);
  }
}
