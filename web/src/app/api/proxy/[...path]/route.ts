import { NextResponse, type NextRequest } from "next/server";
import { setAuthCookies, clearAuthCookies } from "@/shared/lib/auth/server";

const RUST_BACKEND = process.env.CORE_ENGINE_URL || "http://localhost:4001";

// Whitelist of allowed path prefixes to prevent SSRF.
// Only paths that exist on the Rust backend are allowed.
const ALLOWED_PREFIXES = [
  "products",
  "categories",
  "seller/",
  "orders",
  "reviews",
  "notifications",
  "wallet",
  "upload/",
  "profile",
  "auth/",
  "public/",
  "search",
];

function isAllowedPath(path: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

async function proxyRequest(request: NextRequest, method: string) {
  const rawPath = request.nextUrl.pathname.replace(/^\/api\/proxy\//, "");

  // SSRF protection — only allow whitelisted backend paths
  if (!isAllowedPath(rawPath)) {
    return NextResponse.json({ success: false, error: "Path not allowed" }, { status: 403 });
  }

  const backendUrl = `${RUST_BACKEND}/api/${rawPath}`;
  const searchParams = request.nextUrl.searchParams.toString();
  const url = searchParams ? `${backendUrl}?${searchParams}` : backendUrl;

  // Read tokens from HttpOnly cookie
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/kodedock_token=([^;]+)/);
  const refreshTokenMatch = cookieHeader.match(/kodedock_refresh_token=([^;]+)/);

  let token = tokenMatch?.[1];
  const refreshToken = refreshTokenMatch?.[1];

  // Get client IP — trust only X-Forwarded-For from trusted reverse proxy
  const clientIp = request.headers.get("x-real-ip") || "direct";

  const headers: Record<string, string> = {
    "x-forwarded-for": clientIp,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const reqContentType = request.headers.get("content-type");
  if (reqContentType && ["POST", "PUT", "PATCH"].includes(method)) {
    headers["Content-Type"] = reqContentType;
  }

  // Buffer request body if needed for potential retry
  const reqBodyBuffer = ["POST", "PUT", "PATCH"].includes(method)
    ? await request.arrayBuffer()
    : undefined;

  const init: RequestInit = {
    method,
    headers,
    body: reqBodyBuffer,
  };

  try {
    let backendRes = await fetch(url, init);

    // Auto-refresh token if 401 Unauthorized occurs and refresh token is available
    if (backendRes.status === 401 && refreshToken) {
      try {
        const refreshRes = await fetch(`${RUST_BACKEND}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        const refreshData = await refreshRes.json();

        if (refreshRes.ok && refreshData.success && refreshData.data) {
          token = refreshData.data.token;
          const newRefreshToken = refreshData.data.refresh_token;

          // Retry the request with the new access token
          headers["Authorization"] = `Bearer ${token}`;
          const retryInit: RequestInit = {
            method,
            headers,
            body: reqBodyBuffer,
          };

          backendRes = await fetch(url, retryInit);
          const body = await backendRes.text();

          const responseHeaders = new Headers();
          const resContentType = backendRes.headers.get("content-type");
          if (resContentType) {
            responseHeaders.set("Content-Type", resContentType);
          }

          const response = new NextResponse(body, {
            status: backendRes.status,
            headers: responseHeaders,
          });

          // Attach the fresh rotated cookies to the response
          setAuthCookies(response, request, {
            accessToken: refreshData.data.token,
            refreshToken: newRefreshToken,
          });

          return response;
        }
      } catch {
        // Fall through if refresh failed
      }
    }

    const body = await backendRes.text();

    const responseHeaders = new Headers();
    const resContentType = backendRes.headers.get("content-type");
    if (resContentType) {
      responseHeaders.set("Content-Type", resContentType);
    }

    const response = new NextResponse(body, {
      status: backendRes.status,
      headers: responseHeaders,
    });

    if (backendRes.status === 401 && !refreshToken) {
      clearAuthCookies(response, request);
    }

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Backend connection failed" },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, "PUT");
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, "DELETE");
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, "PATCH");
}

