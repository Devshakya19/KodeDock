import type { IncomingMessage, ServerResponse } from "node:http";
import { auth, type SessionUser, type SessionData } from "@kodedock/backend";
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
    const session = await auth.api.getSession({
      headers,
    });
    if (!session || !session.user) {
      return null;
    }
    return {
      user: session.user,
      session: session.session,
    };
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
