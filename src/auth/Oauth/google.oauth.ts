import crypto from "node:crypto";
import type Database from "better-sqlite3";
import { signJwt } from "../JWT/jwt.service";
import { createSession } from "../session/session.service";
import type { User, UserRole } from "@kodedock/types";

/**
 * Dedicated Google OAuth 2.0 Engine for Kodedock
 * Handles authorization URL, code exchange, profile extraction,
 * account linking, and session + JWT creation.
 * 100% self-hosted & in our control.
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
  db: Database.Database,
  options?: { ipAddress?: string; userAgent?: string; redirectUri?: string }
): Promise<GoogleAuthResult> {
  const accessToken = await exchangeGoogleCodeForToken(code, options?.redirectUri);
  const profile = await fetchGoogleProfile(accessToken);

  let user = db.prepare("SELECT * FROM user WHERE email = ?").get(profile.email) as any;
  let isNewUser = false;
  const nowIso = new Date().toISOString();

  if (!user) {
    const newUserId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO user (id, name, email, emailVerified, image, role, createdAt, updatedAt)
      VALUES (?, ?, ?, 1, ?, 'BUYER', ?, ?)
    `).run(newUserId, profile.name, profile.email, profile.avatarUrl || null, nowIso, nowIso);

    user = db.prepare("SELECT * FROM user WHERE id = ?").get(newUserId);
    isNewUser = true;
  } else {
    db.prepare(`
      UPDATE user SET image = COALESCE(image, ?), updatedAt = ? WHERE id = ?
    `).run(profile.avatarUrl || null, nowIso, user.id);
  }

  const existingAccount = db.prepare(`
    SELECT * FROM account WHERE providerId = 'google' AND accountId = ?
  `).get(profile.id) as any;

  if (!existingAccount) {
    const accountId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO account (id, userId, accountId, providerId, accessToken, createdAt, updatedAt)
      VALUES (?, ?, ?, 'google', ?, ?, ?)
    `).run(accountId, user.id, profile.id, accessToken, nowIso, nowIso);
  } else {
    db.prepare(`
      UPDATE account SET accessToken = ?, updatedAt = ? WHERE id = ?
    `).run(accessToken, nowIso, existingAccount.id);
  }

  const session = createSession(db, user.id, options?.ipAddress, options?.userAgent);
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
