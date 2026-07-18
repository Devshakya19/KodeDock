//! Server-side JWT verification.
//!
//! Used by Next.js middleware (Edge Runtime) and server components / route
//! handlers to cryptographically verify the auth token. The secret is read from
//! a server-side env var (`JWT_SECRET`) that is **never** exposed to the browser
//! (no `NEXT_PUBLIC_` prefix).

import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET || "";

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
  sub: string;    // user UUID
  email: string;
  full_name: string | null;
  role: string;   // "user" | "developer"
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
export async function verifyToken(
  token: string
): Promise<TokenClaims | null> {
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
 * Extract the codehaat_token from a request (cookie first, then Authorization
 * header fallback) and verify it.
 */
export async function verifyRequest(
  request: NextRequest
): Promise<TokenClaims | null> {
  const token =
    request.cookies.get("codehaat_token")?.value ||
    (request.headers
      .get("Authorization")
      ?.replace(/^Bearer\s+/i, "")) ||
    "";
  return verifyToken(token);
}
