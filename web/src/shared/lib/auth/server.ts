//! Server-side JWT verification.
//!
//! Used by Next.js proxy (Edge Runtime) and server components / route
//! handlers to cryptographically verify the auth token. The secret is read from
//! a server-side env var (`JWT_SECRET`) that is **never** exposed to the browser
//! (no `NEXT_PUBLIC_` prefix).

import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "";

/** Cached key so we don't re-derive on every request. */
let cachedKey: Uint8Array | undefined;

function getSigningKey(): Uint8Array {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured on the server");
  }
  if (!cachedKey) {
    cachedKey = new TextEncoder().encode(JWT_SECRET);
  }
  return cachedKey;
}

export interface TokenClaims {
  sub: string; // user UUID
  email: string;
  full_name: string | null;
  role: string; // "user" | "developer"
  exp: number;
  iat: number;
}

/**
 * Verify and decode a JWT token server-side.
 *
 * Unlike the previous `decodeToken()` which only base64-decoded the payload
 * (trusting any arbitrary token), this performs a full cryptographic signature
 * verification using the server-side `JWT_SECRET`. An attacker cannot forge a
 * token with `role: "developer"` without knowing this secret.
 *
 * Returns `null` if the token is missing, expired, malformed, or has an
 * invalid signature.
 */
export async function verifyToken(token: string): Promise<TokenClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSigningKey());
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      full_name: (payload.full_name as string) || null,
      role: (payload.role as string) || "user",
      exp: payload.exp as number,
      iat: payload.iat as number,
    };
  } catch {
    return null;
  }
}

/**
 * Extract the kodedock_token from a request (cookie first, then Authorization
 * header fallback) and verify it.
 */
export async function verifyRequest(request: NextRequest): Promise<TokenClaims | null> {
  const token =
    request.cookies.get("kodedock_token")?.value ||
    request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  return verifyToken(token);
}

/**
 * Set the HttpOnly authentication cookies on a response.
 * Sets both the short-lived access token and the 7-day rotated refresh token.
 */
export function setAuthCookies(
  response: NextResponse,
  request: Request | NextRequest,
  tokens: {
    accessToken: string;
    refreshToken?: string | null;
  },
  accessMaxAge = 15 * 60, // 15 minutes
  refreshMaxAge = 7 * 24 * 60 * 60 // 7 days
): void {
  const proto =
    request.headers.get("x-forwarded-proto") ||
    new URL(request.url).protocol.replace(":", "");
  const isSecure = proto === "https";

  response.cookies.set("kodedock_token", tokens.accessToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });

  if (tokens.refreshToken) {
    response.cookies.set("kodedock_refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: refreshMaxAge,
    });
  }
}

/**
 * Set single access token cookie (legacy wrapper).
 */
export function setAuthCookie(
  response: NextResponse,
  request: Request | NextRequest,
  token: string,
  maxAge = 15 * 60
): void {
  setAuthCookies(response, request, { accessToken: token }, maxAge);
}

/**
 * Clear all HttpOnly authentication cookies on a response.
 */
export function clearAuthCookies(
  response: NextResponse,
  request: Request | NextRequest
): void {
  const proto =
    request.headers.get("x-forwarded-proto") ||
    new URL(request.url).protocol.replace(":", "");
  const isSecure = proto === "https";

  response.cookies.set("kodedock_token", "", {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("kodedock_refresh_token", "", {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Legacy alias for clearAuthCookies.
 */
export function clearAuthCookie(
  response: NextResponse,
  request: Request | NextRequest
): void {
  clearAuthCookies(response, request);
}

