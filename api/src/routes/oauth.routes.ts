import type http from "node:http";
import Database from "better-sqlite3";
import path from "node:path";
import {
  getGitHubAuthUrl,
  handleGitHubCallback,
  getGoogleAuthUrl,
  handleGoogleCallback,
  createApiKey,
  listUserApiKeys,
  revokeApiKey,
  createEmailOtp,
  verifyEmailOtp,
  KodedockAuthService,
} from "@kodedock/backend";
import { requireAuth } from "../middlewares/auth.middleware";
import type { ApiResponse } from "@kodedock/types";

// Database reference for SQLite fallback
const sqlitePath = path.resolve(process.cwd(), "kodedock.db");
const db = new Database(sqlitePath);

/**
 * Reads JSON payload from request body
 */
async function readJsonBody<T = any>(req: http.IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

/**
 * Handles custom OAuth & Auth endpoints
 */
export async function handleCustomAuthRoutes(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  searchParams: URLSearchParams
): Promise<boolean> {
  // -------------------------------------------------------------
  // 1. GitHub OAuth Login Redirect (/api/auth/oauth/github/login)
  // -------------------------------------------------------------
  if (pathname === "/api/auth/oauth/github/login" && req.method === "GET") {
    try {
      const state = searchParams.get("state") || undefined;
      const { url } = getGitHubAuthUrl(state);
      res.writeHead(302, { Location: url });
      res.end();
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 2. GitHub OAuth Callback (/api/auth/oauth/github/callback)
  // -------------------------------------------------------------
  if (pathname === "/api/auth/oauth/github/callback" && req.method === "GET") {
    try {
      const code = searchParams.get("code");
      if (!code) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: { message: "Missing authorization code" } }));
        return true;
      }

      const ipAddress = req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const result = await handleGitHubCallback(code, db, { ipAddress, userAgent });

      // Return session tokens or redirect to frontend with token
      const frontendRedirect = searchParams.get("redirect") || "http://localhost:3000";
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          data: {
            user: result.user,
            token: result.token,
            jwt: result.jwt,
            githubProfile: {
              username: result.githubProfile.username,
              avatarUrl: result.githubProfile.avatarUrl,
              publicRepos: result.githubProfile.publicRepos,
            },
            isNewUser: result.isNewUser,
          },
        })
      );
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 3. Google OAuth Login Redirect (/api/auth/oauth/google/login)
  // -------------------------------------------------------------
  if (pathname === "/api/auth/oauth/google/login" && req.method === "GET") {
    try {
      const state = searchParams.get("state") || undefined;
      const { url } = getGoogleAuthUrl(state);
      res.writeHead(302, { Location: url });
      res.end();
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 4. Google OAuth Callback (/api/auth/oauth/google/callback)
  // -------------------------------------------------------------
  if (pathname === "/api/auth/oauth/google/callback" && req.method === "GET") {
    try {
      const code = searchParams.get("code");
      if (!code) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: { message: "Missing authorization code" } }));
        return true;
      }

      const ipAddress = req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const result = await handleGoogleCallback(code, db, { ipAddress, userAgent });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          data: {
            user: result.user,
            token: result.token,
            jwt: result.jwt,
            isNewUser: result.isNewUser,
          },
        })
      );
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 5. Email OTP Send (/api/auth/otp/send)
  // -------------------------------------------------------------
  if (pathname === "/api/auth/otp/send" && req.method === "POST") {
    try {
      const body = await readJsonBody(req);
      if (!body.email) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: { message: "Email is required." } }));
        return true;
      }

      const { otp, expiresAt } = createEmailOtp(db, body.email, body.purpose || "LOGIN");
      // In dev, return OTP in response for testing; in prod dispatch via email
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          data: {
            message: "Verification code sent to email.",
            expiresAt,
            ...(process.env.NODE_ENV !== "production" ? { devOtp: otp } : {}),
          },
        })
      );
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 6. Developer API Keys (/api/auth/keys)
  // -------------------------------------------------------------
  if (pathname === "/api/auth/keys") {
    const authContext = await requireAuth(req, res);
    if (!authContext) return true;

    if (req.method === "GET") {
      const keys = listUserApiKeys(db, authContext.user.id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: keys }));
      return true;
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const createdKey = createApiKey(
        db,
        authContext.user.id,
        body.name || "Default API Key",
        (authContext.user as any).role || "BUYER",
        body.permissions || ["read:assets"]
      );
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: createdKey }));
      return true;
    }
  }

  return false;
}
