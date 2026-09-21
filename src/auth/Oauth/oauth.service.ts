/**
 * Kodedock Custom OAuth Integration Service
 * Manages GitHub & Google OAuth flows, redirect endpoints, profile normalization,
 * and token exchange. 100% visible and modifiable.
 */

export type OAuthProvider = "github" | "google";

export interface NormalizedOAuthUser {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  accessToken: string;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Returns OAuth configuration for a given provider
 */
export function getOAuthConfig(provider: OAuthProvider): OAuthConfig {
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:4000";

  if (provider === "github") {
    return {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      redirectUri: `${baseUrl}/api/auth/callback/github`,
    };
  }

  if (provider === "google") {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectUri: `${baseUrl}/api/auth/callback/google`,
    };
  }

  throw new Error(`Unsupported OAuth provider: ${provider}`);
}

/**
 * Generates the OAuth authorization redirect URL
 */
export function createOAuthAuthorizationUrl(
  provider: OAuthProvider,
  state: string
): string {
  const config = getOAuthConfig(provider);

  if (provider === "github") {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: "read:user user:email",
      state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      scope: "openid profile email",
      access_type: "offline",
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  throw new Error(`Unsupported OAuth provider: ${provider}`);
}

/**
 * Exchanges authorization code for provider access token
 */
export async function exchangeOAuthCodeForToken(
  provider: OAuthProvider,
  code: string
): Promise<string> {
  const config = getOAuthConfig(provider);

  if (provider === "github") {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
      }),
    });

    const data = (await response.json()) as { access_token?: string; error?: string };
    if (!data.access_token) {
      throw new Error(`GitHub token exchange failed: ${data.error || "Unknown error"}`);
    }
    return data.access_token;
  }

  if (provider === "google") {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const data = (await response.json()) as { access_token?: string; error?: string };
    if (!data.access_token) {
      throw new Error(`Google token exchange failed: ${data.error || "Unknown error"}`);
    }
    return data.access_token;
  }

  throw new Error(`Unsupported OAuth provider: ${provider}`);
}

/**
 * Fetches and normalizes the user profile from provider
 */
export async function fetchNormalizedOAuthProfile(
  provider: OAuthProvider,
  accessToken: string
): Promise<NormalizedOAuthUser> {
  if (provider === "github") {
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Kodedock-Auth-Service",
      },
    });
    const githubUser = (await userRes.json()) as {
      id: number;
      name?: string;
      login: string;
      email?: string;
      avatar_url?: string;
    };

    let userEmail = githubUser.email;
    if (!userEmail) {
      // Fetch emails if primary email is private
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "Kodedock-Auth-Service",
        },
      });
      const emails = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      const primaryEmail = emails.find((e) => e.primary && e.verified);
      userEmail = primaryEmail ? primaryEmail.email : emails[0]?.email || "";
    }

    return {
      provider: "github",
      providerUserId: String(githubUser.id),
      email: userEmail,
      name: githubUser.name || githubUser.login,
      avatarUrl: githubUser.avatar_url,
      accessToken,
    };
  }

  if (provider === "google") {
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const googleUser = (await userRes.json()) as {
      id: string;
      name: string;
      email: string;
      picture?: string;
    };

    return {
      provider: "google",
      providerUserId: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      avatarUrl: googleUser.picture,
      accessToken,
    };
  }

  throw new Error(`Unsupported OAuth provider: ${provider}`);
}
