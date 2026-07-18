require("dotenv").config();
const { WebSocketServer } = require("ws");
const Redis = require("ioredis");
const http = require("http");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 4004;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const JWT_SECRET = process.env.JWT_SECRET || "";
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];
const MAX_CONNECTIONS_PER_IP = parseInt(process.env.MAX_WS_PER_IP || "5", 10);
const HEARTBEAT_INTERVAL_MS = 30_000;

// --- IP connection tracking ---
const ipConnections = new Map();

function incrementIpConnection(ip) {
  const count = (ipConnections.get(ip) || 0) + 1;
  ipConnections.set(ip, count);
  return count;
}

function decrementIpConnection(ip) {
  const count = (ipConnections.get(ip) || 0) - 1;
  if (count <= 0) {
    ipConnections.delete(ip);
  } else {
    ipConnections.set(ip, count);
  }
}

// --- HTTP server ---
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "codehaat-realtime",
        version: "0.1.0",
        connections: clients.size,
      })
    );
  } else {
    res.writeHead(404);
    res.end();
  }
});

// --- Redis ---
const pub = new Redis(REDIS_URL, {
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
});

const sub = new Redis(REDIS_URL, {
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
});

pub.on("error", (err) => console.error("Redis pub error:", err.message));
sub.on("error", (err) => console.error("Redis sub error:", err.message));
pub.on("connect", () => console.log("Redis pub connected"));
sub.on("connect", () => console.log("Redis sub connected"));

// --- WebSocket server ---
const wss = new WebSocketServer({ server });
const clients = new Map(); // userId -> ws
const wsMeta = new WeakMap(); // ws -> { userId, ip, alive }

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress || "unknown";
  const origin = req.headers.origin || "";

  // Origin check
  if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin)) {
    console.warn(`Rejected connection from unknown origin: ${origin} (${ip})`);
    ws.close(4003, "Origin not allowed");
    return;
  }

  // Per-IP connection cap
  if (incrementIpConnection(ip) > MAX_CONNECTIONS_PER_IP) {
    decrementIpConnection(ip);
    console.warn(`Rejected connection from ${ip}: too many connections`);
    ws.close(4004, "Too many connections");
    return;
  }

  wsMeta.set(ws, { userId: null, ip, alive: true });
  console.log(`New WebSocket connection from ${ip}`);

  // Require auth within 10 seconds
  const authTimeout = setTimeout(() => {
    if (wsMeta.has(ws) && !wsMeta.get(ws).userId) {
      ws.close(4001, "Auth timeout");
    }
  }, 10_000);

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);

      if (message.type === "auth") {
        // Require JWT token — do NOT trust client-supplied userId
        if (!JWT_SECRET) {
          ws.send(JSON.stringify({ type: "auth_error", error: "Server not configured" }));
          ws.close(4002, "Server misconfigured");
          return;
        }

        if (!message.token) {
          ws.send(JSON.stringify({ type: "auth_error", error: "Missing token" }));
          return;
        }

        try {
          const payload = jwt.verify(message.token, JWT_SECRET);
          const userId = payload.sub;

          if (!userId) {
            ws.send(JSON.stringify({ type: "auth_error", error: "Invalid token: no subject" }));
            return;
          }

          clearTimeout(authTimeout);

          // If this user already has a connection, close the old one
          const existing = clients.get(userId);
          if (existing && existing !== ws) {
            try { existing.close(4000, "Replaced by new connection"); } catch {}
          }

          clients.set(userId, ws);
          const meta = wsMeta.get(ws);
          if (meta) meta.userId = userId;

          console.log(`User ${userId} authenticated from ${ip}`);
          ws.send(JSON.stringify({ type: "auth_success" }));
        } catch (err) {
          ws.send(JSON.stringify({ type: "auth_error", error: "Invalid token" }));
        }
      } else if (message.type === "ping") {
        const meta = wsMeta.get(ws);
        if (meta) meta.alive = true;
        ws.send(JSON.stringify({ type: "pong" }));
      }
    } catch (err) {
      console.error("Invalid message:", err.message);
    }
  });

  ws.on("close", () => {
    clearTimeout(authTimeout);
    const meta = wsMeta.get(ws);
    if (meta) {
      decrementIpConnection(meta.ip);
      if (meta.userId) {
        clients.delete(meta.userId);
        console.log(`User ${meta.userId} disconnected`);
      }
    }
    wsMeta.delete(ws);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });
});

// --- Heartbeat: detect stale connections ---
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const meta = wsMeta.get(ws);
    if (!meta || !meta.alive) {
      try { ws.terminate(); } catch {}
      return;
    }
    meta.alive = false;
    ws.ping();
  });
}, HEARTBEAT_INTERVAL_MS);

wss.on("close", () => clearInterval(heartbeatInterval));

// --- Redis pub/sub ---
sub.subscribe("notifications", "order_updates", "repo_transfer", (err) => {
  if (err) {
    console.error("Failed to subscribe to Redis channels:", err.message);
  } else {
    console.log("Subscribed to: notifications, order_updates, repo_transfer");
  }
});

sub.on("message", (channel, message) => {
  try {
    const data = JSON.parse(message);
    if (data.userId && clients.has(data.userId)) {
      const ws = clients.get(data.userId);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: channel, data }));
      }
    }
  } catch (err) {
    console.error("Error processing message:", err.message);
  }
});

// --- Graceful shutdown ---
function shutdown(signal) {
  console.log(`${signal} received — shutting down gracefully`);

  // Close all WebSocket connections
  wss.clients.forEach((ws) => {
    try { ws.close(1001, "Server shutting down"); } catch {}
  });

  // Quit Redis
  pub.quit().catch(() => {});
  sub.quit().catch(() => {});

  // Close HTTP server
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  // Force exit after 5s
  setTimeout(() => {
    console.warn("Forced exit after timeout");
    process.exit(1);
  }, 5_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// --- Start ---
server.listen(PORT, () => {
  console.log(`Real-time service running on port ${PORT}`);
});
