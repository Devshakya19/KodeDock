import type { IncomingMessage, ServerResponse } from "node:http";
import { auth, type SessionUser, type SessionData, verifyJwt, pgPool } from "../../index";
import type { UserRole } from "@kodedock/types";

/**
 * Converts Node IncomingMessage headers to standard Web Fetch Headers
 */
export function getWebHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        for (const v of value) headers.append(key, v);
      } else {
        headers.set(key, value);
      }
    }
  }
  return headers;
}

export interface AuthContext {
  user: SessionUser;
  session: SessionData;
}

/**
 * Validates session from cookie or Bearer JWT token in Authorization header
 */
export async function getAuthContext(
  req: IncomingMessage
): Promise<AuthContext | null> {
  try {
    const headers = getWebHeaders(req);

    // 1. Better Auth session check
    const session = await auth.api.getSession({
      headers,
    });
    if (session && session.user) {
      let role = (session.user as any).role;
      if (!role) {
        const uRes = await pgPool.query(`SELECT role FROM "user" WHERE id = $1 LIMIT 1`, [session.user.id]);
        role = uRes.rows[0]?.role || "BUYER";
        (session.user as any).role = role;
      }
      return {
        user: session.user,
        session: session.session,
      };
    }

    // 2. Direct PostgreSQL session token check from cookies (fallback)
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:(?:__Secure-)?(?:kodedock|better-auth)\.session_token|session_token)=([^;]+)/);
      if (match && match[1]) {
        const rawToken = decodeURIComponent(match[1].trim());
        const dotIndex = rawToken.indexOf(".");
        const cleanToken = dotIndex !== -1 ? rawToken.substring(0, dotIndex) : rawToken;

        const dbRes = await pgPool.query(
          `SELECT s.id AS session_id, s.token, s."expiresAt", s."userId",
                  u.id AS user_id, u.name, u.email, u.role, u."emailVerified", u.image, u."createdAt", u."updatedAt"
           FROM session s
           JOIN "user" u ON s."userId" = u.id
           WHERE (s.token = $1 OR s.token = $2) AND s."expiresAt" > NOW()
           LIMIT 1`,
          [rawToken, cleanToken]
        );

        if (dbRes.rowCount && dbRes.rows[0]) {
          const row = dbRes.rows[0];
          return {
            user: {
              id: row.user_id,
              name: row.name,
              email: row.email,
              role: (row.role || "BUYER") as UserRole,
              emailVerified: row.emailVerified,
              image: row.image,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            } as any,
            session: {
              id: row.session_id,
              token: row.token,
              userId: row.userId,
              expiresAt: row.expiresAt,
            } as any,
          };
        }
      }
    }

    // 3. Custom JWT Bearer check
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      const secret =
        process.env.BETTER_AUTH_SECRET ||
        "kodedock_dev_secret_key_32_characters_long_min!";
      const result = verifyJwt(token, secret);
      if (result.isValid && result.payload) {
        return {
          user: {
            id: result.payload.sub,
            email: result.payload.email,
            name: result.payload.name || "Authenticated User",
            role: result.payload.role || "BUYER",
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
          session: {
            id: `sess_${result.payload.sub}`,
            userId: result.payload.sub,
            expiresAt: new Date(Date.now() + 7 * 86400 * 1000),
          } as any,
        };
      }
    }

    return null;
  } catch (err) {
    console.error("Error verifying auth context:", err);
    return null;
  }
}

/**
 * Enforces authenticated user
 */
export async function requireAuth(
  req: IncomingMessage,
  res: ServerResponse
): Promise<AuthContext | null> {
  const context = await getAuthContext(req);
  if (!context) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required. Please sign in.",
        },
      })
    );
    return null;
  }
  return context;
}

/**
 * Enforces role-based authorization (RBAC)
 */
export async function requireRole(
  req: IncomingMessage,
  res: ServerResponse,
  allowedRoles: UserRole[]
): Promise<AuthContext | null> {
  const context = await requireAuth(req, res);
  if (!context) return null;

  const userRole = ((context.user as any).role || "BUYER") as UserRole;
  if (!allowedRoles.includes(userRole) && userRole !== "ADMIN") {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Access denied. Requires one of roles: [${allowedRoles.join(", ")}]. Current role: ${userRole}`,
        },
      })
    );
    return null;
  }

  return context;
}
