import { NextResponse, type NextRequest } from "next/server";

const RUST_BACKEND = process.env.CORE_ENGINE_URL || "http://localhost:4001";

// Whitelist of allowed path prefixes to prevent SSRF.
// Only paths that exist on the Rust backend are allowed.
const ALLOWED_PREFIXES = [
  "products",
  "seller/",
  "orders",
  "reviews",
  "notifications",
  "wallet",
  "upload/",
  "profile",
  "auth/",
  "search",
];

function isAllowedPath(path: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

async function proxyRequest(request: NextRequest, method: string) {
  const rawPath = request.nextUrl.pathname.replace(/^\/api\/proxy\//, "");

  // SSRF protection — only allow whitelisted backend paths
  if (!isAllowedPath(rawPath)) {
    return NextResponse.json(
      { success: false, error: "Path not allowed" },
      { status: 403 }
    );
  }

  const backendUrl = `${RUST_BACKEND}/api/${rawPath}`;
  const searchParams = request.nextUrl.searchParams.toString();
  const url = searchParams ? `${backendUrl}?${searchParams}` : backendUrl;

  // Read token from HttpOnly cookie
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/codehaat_token=([^;]+)/);
  const token = tokenMatch?.[1];

  // Get client IP — trust only X-Forwarded-For from trusted reverse proxy
  // (Next.js itself). If request comes directly, use connection IP.
  // We do NOT pass through client-supplied XFF to prevent spoofing.
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

  const init: RequestInit = { method, headers };

  if (["POST", "PUT", "PATCH"].includes(method)) {
    init.body = request.body;
    // @ts-expect-error duplex is needed for streaming body in fetch
    init.duplex = "half";
  }

  try {
    const backendRes = await fetch(url, init);
    const body = await backendRes.text();

    const responseHeaders = new Headers();
    const resContentType = backendRes.headers.get("content-type");
    if (resContentType) {
      responseHeaders.set("Content-Type", resContentType);
    }

    return new NextResponse(body, {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch (error) {
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
