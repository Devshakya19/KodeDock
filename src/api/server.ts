import http from "node:http";
import { toNodeHandler } from "better-auth/node";
import { auth, initAuthDatabase, pgPool } from "../index";
import { handleCustomAuthRoutes } from "./routes/oauth.routes";
import { handleProductRoutes } from "./routes/product.routes";
import { handlePortalRoutes } from "./routes/portal.routes";
import { handleCheckoutRoutes } from "./routes/checkout.routes";
import { handleStudioRoutes } from "./routes/studio.routes";
import { requireAuth, requireRole } from "./middlewares/auth.middleware";
import type { ApiResponse } from "@kodedock/types";

const PORT = parseInt(process.env.PORT || "4000", 10);
const authNodeHandler = toNodeHandler(auth);

/**
 * Allowed CORS Origins & Verification
 */
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
  "http://127.0.0.1:3003",
  "https://kodedock.com",
  "https://www.kodedock.com",
  "https://store.kodedock.com",
  "https://studio.kodedock.com",
  "https://portal.kodedock.com",
];

const customOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOriginsSet = new Set([...DEFAULT_ALLOWED_ORIGINS, ...customOrigins]);

function isOriginAllowed(origin: string): boolean {
  if (allowedOriginsSet.has(origin)) return true;
  try {
    const url = new URL(origin);
    if (
      url.protocol === "https:" &&
      (url.hostname === "kodedock.com" ||
        url.hostname.endsWith(".kodedock.com") ||
        url.hostname === "kodedock.dev" ||
        url.hostname.endsWith(".kodedock.dev"))
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * CORS helper
 */
function setCorsHeaders(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Cookie, Origin, Accept, X-Better-Auth-Origin"
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return true;
  }
  return false;
}

/**
 * Main HTTP Request Dispatcher
 */
export const server = http.createServer(async (req, res) => {
  if (setCorsHeaders(req, res)) return;

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  // 1. Health check
  if (pathname === "/api/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    const response: ApiResponse<{ status: string; uptime: number }> = {
      success: true,
      data: {
        status: "healthy",
        uptime: process.uptime(),
      },
    };
    res.end(JSON.stringify(response));
    return;
  }

  // 2. Custom OAuth, OTP, and API Key Routes
  const authHandled = await handleCustomAuthRoutes(req, res, pathname, url.searchParams);
  if (authHandled) return;

  // 3. Product Catalog & Marketplace Routes (/api/products, /api/categories)
  const productHandled = await handleProductRoutes(req, res, pathname, url.searchParams);
  if (productHandled) return;

  // 4. Buyer Developer Portal Routes (/api/portal/*)
  const portalHandled = await handlePortalRoutes(req, res, pathname, url.searchParams);
  if (portalHandled) return;

  // 5. Checkout & Order Creation Routes (/api/checkout/*)
  const checkoutHandled = await handleCheckoutRoutes(req, res, pathname, url.searchParams);
  if (checkoutHandled) return;

  // 6. Creator Studio Routes (/api/studio/*)
  const studioHandled = await handleStudioRoutes(req, res, pathname, url.searchParams);
  if (studioHandled) return;

  // 7. Better Auth fallback routes (/api/auth/*)
  if (pathname.startsWith("/api/auth")) {
    return authNodeHandler(req, res);
  }

  // 8. Protected endpoint: /api/me (Any authenticated user - verified from PostgreSQL)
  if (pathname === "/api/me" && req.method === "GET") {
    const authContext = await requireAuth(req, res);
    if (!authContext) return;

    try {
      const userRes = await pgPool.query(
        `SELECT id, name, email, role, image, "emailVerified", "createdAt", "updatedAt" FROM "user" WHERE id = $1 LIMIT 1`,
        [authContext.user.id]
      );
      const freshUser = userRes.rows[0] || authContext.user;

      res.writeHead(200, { "Content-Type": "application/json" });
      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            ...authContext.user,
            ...freshUser,
          },
          session: authContext.session,
        },
      };
      res.end(JSON.stringify(response));
      return;
    } catch (err: any) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          data: {
            user: authContext.user,
            session: authContext.session,
          },
        })
      );
      return;
    }
  }

  // 9. Role Update / Upgrade Endpoint: /api/me/role (Switch between BUYER and SELLER)
  if (pathname === "/api/me/role" && (req.method === "POST" || req.method === "PUT" || req.method === "PATCH")) {
    const authContext = await requireAuth(req, res);
    if (!authContext) return;

    let body = "";
    for await (const chunk of req) body += chunk;
    let data: any = {};
    try {
      data = JSON.parse(body || "{}");
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: "Invalid JSON body" } }));
      return;
    }

    const newRole = data.role;
    if (newRole !== "BUYER" && newRole !== "SELLER") {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          error: {
            code: "INVALID_ROLE",
            message: "Self-selectable roles are restricted to 'BUYER' or 'SELLER'.",
          },
        })
      );
      return;
    }

    await pgPool.query(
      `UPDATE "user" SET role = $1, "updatedAt" = NOW() WHERE id = $2`,
      [newRole, authContext.user.id]
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        message: `Role successfully updated to ${newRole}`,
        data: {
          userId: authContext.user.id,
          role: newRole,
        },
      })
    );
    return;
  }

  // 10. Protected endpoint: /api/studio/dashboard (SELLER role required)
  if (pathname === "/api/studio/dashboard" && req.method === "GET") {
    const authContext = await requireRole(req, res, ["SELLER"]);
    if (!authContext) return;

    res.writeHead(200, { "Content-Type": "application/json" });
    const response: ApiResponse = {
      success: true,
      data: {
        message: "Welcome to Creator Studio. You are authorized as a SELLER.",
        sellerId: authContext.user.id,
      },
    };
    res.end(JSON.stringify(response));
    return;
  }

  // 5. 404 Fallback
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: `Endpoint ${pathname} not found on Kodedock API Gateway.`,
      },
    })
  );
});

/**
 * Start Server
 */
export async function startServer(): Promise<void> {
  await initAuthDatabase();
  server.listen(PORT, () => {
    console.log(`[Kodedock API Gateway] Running on http://localhost:${PORT}`);
    console.log(`[Better Auth Handler] Mounted at http://localhost:${PORT}/api/auth`);
  });
}

// Auto-start when executed directly
if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
  startServer().catch((err) => {
    console.error("Failed to start Kodedock API server:", err);
    process.exit(1);
  });
}
