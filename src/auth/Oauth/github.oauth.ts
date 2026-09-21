import crypto from "node:crypto";
import type Database from "better-sqlite3";
import { signJwt } from "../JWT/jwt.service";
import { createSession } from "../session/session.service";
import type { User, UserRole } from "@kodedock/types";

/**
 * Dedicated GitHub OAuth 2.0 Engine for Kodedock
 * Handles authorization URL generation, code exchange, profile + email extraction,
 * account linking, and session + JWT creation.
 * 100% self-hosted & in our control.
 */

export interface GitHubUserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  publicRepos: number;
  followers: number;
  githubProfileUrl: string;
  accessToken: string;
}

export interface GitHubAuthResult {
  user: User;
  githubProfile: GitHubUserProfile;
  token: string;
  jwt: string;
  isNewUser: boolean;
}

/**
 * Generates the GitHub OAuth authorization URL with CSRF state protection
 */
export function getGitHubAuthUrl(state?: string, redirectUri?: string): { url: string; state: string } {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    throw new Error("GITHUB_CLIENT_ID is not configured in environment variables.");
  }

  const generatedState = state || crypto.randomBytes(16).toString("hex");
  const callbackUrl =
    redirectUri ||
    `${process.env.BETTER_AUTH_URL || "http://localhost:4000"}/api/auth/oauth/github/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: "read:user user:email",
    state: generatedState,
    allow_signup: "true",
  });

  return {
    url: `https://github.com/login/oauth/authorize?${params.toString()}`,
    state: generatedState,
  };
}

/**
 * Exchanges GitHub authorization code for an OAuth access token
 */
export async function exchangeGitHubCodeForToken(
  code: string,
  redirectUri?: string
): Promise<string> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GitHub OAuth credentials (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET) are missing.");
  }

  const callbackUrl =
    redirectUri ||
    `${process.env.BETTER_AUTH_URL || "http://localhost:4000"}/api/auth/oauth/github/callback`;

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: callbackUrl,
    }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    token_type?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  };

  if (!data.access_token) {
    throw new Error(`GitHub token exchange error: ${data.error_description || data.error || "Unknown"}`);
  }

  return data.access_token;
}

/**
 * Fetches the verified developer profile and primary email from GitHub APIs
 */
export async function fetchGitHubProfile(accessToken: string): Promise<GitHubUserProfile> {
  // 1. Fetch user core profile
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "Kodedock-Platform",
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!userRes.ok) {
    throw new Error(`Failed to fetch user profile from GitHub: ${userRes.statusText}`);
  }

  const rawUser = (await userRes.json()) as {
    id: number;
    login: string;
    name?: string | null;
    email?: string | null;
    avatar_url: string;
    bio?: string | null;
    public_repos: number;
    followers: number;
    html_url: string;
  };

  let resolvedEmail = rawUser.email;

  // 2. If email is private/null, query the /user/emails endpoint
  if (!resolvedEmail) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Kodedock-Platform",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (emailsRes.ok) {
      const emailsList = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
        visibility?: string | null;
      }>;

      // Prefer primary and verified email
      const primary = emailsList.find((e) => e.primary && e.verified);
      resolvedEmail = primary ? primary.email : emailsList[0]?.email || `${rawUser.login}@users.noreply.github.com`;
    } else {
      resolvedEmail = `${rawUser.login}@users.noreply.github.com`;
    }
  }

  return {
    id: String(rawUser.id),
    username: rawUser.login,
    name: rawUser.name || rawUser.login,
    email: resolvedEmail,
    avatarUrl: rawUser.avatar_url,
    bio: rawUser.bio || undefined,
    publicRepos: rawUser.public_repos || 0,
    followers: rawUser.followers || 0,
    githubProfileUrl: rawUser.html_url,
    accessToken,
  };
}

/**
 * High-Level GitHub Callback Handler
 * Upserts user in database, links account, and generates active session + JWT
 */
export async function handleGitHubCallback(
  code: string,
  db: Database.Database,
  options?: { ipAddress?: string; userAgent?: string; redirectUri?: string }
): Promise<GitHubAuthResult> {
  // 1. Exchange code for access token
  const accessToken = await exchangeGitHubCodeForToken(code, options?.redirectUri);

  // 2. Fetch verified GitHub profile
  const profile = await fetchGitHubProfile(accessToken);

  // 3. Find existing user by email or existing GitHub account
  let user = db.prepare("SELECT * FROM user WHERE email = ?").get(profile.email) as any;
  let isNewUser = false;
  const nowIso = new Date().toISOString();

  if (!user) {
    // Create new user (default role: BUYER)
    const newUserId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO user (id, name, email, emailVerified, image, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newUserId,
      profile.name,
      profile.email,
      1, // GitHub emails are verified
      profile.avatarUrl,
      "BUYER",
      nowIso,
      nowIso
    );

    user = db.prepare("SELECT * FROM user WHERE id = ?").get(newUserId);
    isNewUser = true;
  } else {
    // Update avatar and name if missing
    db.prepare(`
      UPDATE user SET image = COALESCE(image, ?), updatedAt = ? WHERE id = ?
    `).run(profile.avatarUrl, nowIso, user.id);
  }

  // 4. Link or update GitHub account record
  const existingAccount = db.prepare(`
    SELECT * FROM account WHERE providerId = 'github' AND accountId = ?
  `).get(profile.id) as any;

  if (!existingAccount) {
    const accountId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO account (id, userId, accountId, providerId, accessToken, createdAt, updatedAt)
      VALUES (?, ?, ?, 'github', ?, ?, ?)
    `).run(accountId, user.id, profile.id, accessToken, nowIso, nowIso);
  } else {
    db.prepare(`
      UPDATE account SET accessToken = ?, updatedAt = ? WHERE id = ?
    `).run(accessToken, nowIso, existingAccount.id);
  }

  // 5. Generate active session
  const session = createSession(db, user.id, options?.ipAddress, options?.userAgent);

  // 6. Generate cryptographic JWT
  const userRole = (user.role || "BUYER") as UserRole;
  const jwt = signJwt({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: userRole,
    githubUsername: profile.username,
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
    githubProfile: profile,
    token: session.token,
    jwt,
    isNewUser,
  };
}
