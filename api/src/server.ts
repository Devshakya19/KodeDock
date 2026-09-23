import http from "node:http";
import { toNodeHandler } from "better-auth/node";
import { auth, initAuthDatabase } from "@kodedock/backend";
import { handleCustomAuthRoutes } from "./routes/oauth.routes";
import { handleProductRoutes } from "./routes/product.routes";
import { handlePortalRoutes } from "./routes/portal.routes";
import { requireAuth, requireRole } from "./middlewares/auth.middleware";
import type { ApiResponse } from "@kodedock/types";

const PORT = parseInt(process.env.PORT || "4000", 10);
const authNodeHandler = toNodeHandler(auth);

/**
 * CORS helper
 */
function setCorsHeaders(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Cookie"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

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

  // 3. Better Auth fallback routes (/api/auth/*)
  if (pathname.startsWith("/api/auth")) {
    return authNodeHandler(req, res);
  }

  // 3. Protected endpoint: /api/me (Any authenticated user)
  if (pathname === "/api/me" && req.method === "GET") {
    const authContext = await requireAuth(req, res);
    if (!authContext) return;

    res.writeHead(200, { "Content-Type": "application/json" });
    const response: ApiResponse = {
      success: true,
      data: {
        user: authContext.user,
        session: authContext.session,
      },
    };
    res.end(JSON.stringify(response));
    return;
  }

  // 4. Protected endpoint: /api/studio/dashboard (SELLER role required)
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
