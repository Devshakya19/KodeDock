import crypto from "node:crypto";
import type pg from "pg";
import { pgPool } from "../../db";
import { signJwt } from "../JWT/jwt.service";
import { createSession } from "../session/session.service";
import type { User, UserRole } from "@kodedock/types";

/**
 * Dedicated Google OAuth 2.0 Engine for Kodedock
 * Handles authorization URL, code exchange, profile extraction,
 * account linking, and session + JWT creation.
 * 100% self-hosted & PostgreSQL backed.
 */

export interface GoogleUserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  accessToken: string;
}

export interface GoogleAuthResult {
  user: User;
  googleProfile: GoogleUserProfile;
  token: string;
  jwt: string;
  isNewUser: boolean;
}

/**
 * Generates the Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state?: string, redirectUri?: string): { url: string; state: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured in environment variables.");
  }

  const generatedState = state || crypto.randomBytes(16).toString("hex");
  const callbackUrl =
    redirectUri ||
    `${process.env.BETTER_AUTH_URL || "http://localhost:4000"}/api/auth/oauth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid profile email",
    access_type: "offline",
    prompt: "select_account",
    state: generatedState,
  });

  return {
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    state: generatedState,
  };
}

/**
 * Exchanges Google authorization code for access token
 */
export async function exchangeGoogleCodeForToken(
  code: string,
  redirectUri?: string
): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are missing.");
  }

  const callbackUrl =
    redirectUri ||
    `${process.env.BETTER_AUTH_URL || "http://localhost:4000"}/api/auth/oauth/google/callback`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!data.access_token) {
    throw new Error(`Google token exchange error: ${data.error_description || data.error || "Unknown"}`);
  }

  return data.access_token;
}

/**
 * Fetches user profile from Google userinfo API
 */
export async function fetchGoogleProfile(accessToken: string): Promise<GoogleUserProfile> {
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userRes.ok) {
    throw new Error(`Failed to fetch user profile from Google: ${userRes.statusText}`);
  }

  const rawUser = (await userRes.json()) as {
    id: string;
    name: string;
    email: string;
    picture?: string;
  };

  return {
    id: rawUser.id,
    name: rawUser.name,
    email: rawUser.email,
    avatarUrl: rawUser.picture,
    accessToken,
  };
}

/**
 * High-Level Google Callback Handler
 */
export async function handleGoogleCallback(
  code: string,
  db: pg.Pool = pgPool,
  options?: { ipAddress?: string; userAgent?: string; redirectUri?: string }
): Promise<GoogleAuthResult> {
  const accessToken = await exchangeGoogleCodeForToken(code, options?.redirectUri);
  const profile = await fetchGoogleProfile(accessToken);

  const uRes = await db.query(`SELECT * FROM "user" WHERE email = $1`, [profile.email]);
  let user = uRes.rows[0];
  let isNewUser = false;
  const nowIso = new Date().toISOString();

  if (!user) {
    const newUserId = crypto.randomUUID();
    const insRes = await db.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", image, role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, TRUE, $4, 'BUYER', $5, $6)
       RETURNING *`,
      [newUserId, profile.name, profile.email, profile.avatarUrl || null, nowIso, nowIso]
    );
    user = insRes.rows[0];
    isNewUser = true;
  } else {
    const updRes = await db.query(
      `UPDATE "user" SET image = COALESCE(image, $1), "updatedAt" = $2 WHERE id = $3 RETURNING *`,
      [profile.avatarUrl || null, nowIso, user.id]
    );
    user = updRes.rows[0] || user;
  }

  const accRes = await db.query(
    `SELECT * FROM account WHERE "providerId" = 'google' AND "accountId" = $1`,
    [profile.id]
  );
  const existingAccount = accRes.rows[0];

  if (!existingAccount) {
    const accountId = crypto.randomUUID();
    await db.query(
      `INSERT INTO account (id, "userId", "accountId", "providerId", "accessToken", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'google', $4, $5, $6)`,
      [accountId, user.id, profile.id, accessToken, nowIso, nowIso]
    );
  } else {
    await db.query(
      `UPDATE account SET "accessToken" = $1, "updatedAt" = $2 WHERE id = $3`,
      [accessToken, nowIso, existingAccount.id]
    );
  }

  const session = await createSession(db, user.id, options?.ipAddress, options?.userAgent);
  const userRole = (user.role || "BUYER") as UserRole;
  const jwt = signJwt({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: userRole,
  });

  const formattedUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    image: user.image,
    role: userRole,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };

  return {
    user: formattedUser,
    googleProfile: profile,
    token: session.token,
    jwt,
    isNewUser,
  };
}
