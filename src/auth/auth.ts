import { betterAuth } from "better-auth";
import { jwt, bearer } from "better-auth/plugins";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

// Load root or local .env
const possibleEnvPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(__dirname, "../../.env"),
];
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

import pg from "pg";
const { Pool } = pg;

/**
 * Self-Hosted Database Initialization (Zero BaaS)
 * - Primary Standard: Self-Hosted PostgreSQL
 */
const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgrespassword@localhost:5432/kodedock";
let dbInstance: Database.Database | pg.Pool;

if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
  dbInstance = new Pool({ connectionString: dbUrl });
} else {
  const resolvedDbPath = path.isAbsolute(dbUrl)
    ? dbUrl
    : path.resolve(process.cwd(), dbUrl);
  const dbDir = path.dirname(resolvedDbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  dbInstance = new Database(resolvedDbPath);
}

/**
 * Better Auth Core Configuration
 */
export const auth = betterAuth({
  database: dbInstance as any,
  logger: {
    level: "error",
  },
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "kodedock_dev_secret_key_32_characters_long_min!",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "BUYER",
      },
    },
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: "7d",
      },
    }),
    bearer(),
  ],
});

/**
 * Helper to ensure database tables are migrated on server startup
 */
export async function initAuthDatabase(): Promise<void> {
  // Database tables & migrations are handled in src/db/index.ts
}

export type Auth = typeof auth;
export type SessionUser = typeof auth.$Infer.Session.user;
export type SessionData = typeof auth.$Infer.Session.session;
