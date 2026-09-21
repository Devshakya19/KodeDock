import { createAuthClient } from "better-auth/client";
import { jwtClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { UserRole } from "@kodedock/types";

/**
 * Shared Better Auth Client for Kodedock Frontends
 * Frontends only communicate via API endpoints without any backend credentials.
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
        "http://localhost:4000",
  plugins: [
    jwtClient(),
    inferAdditionalFields<{
      user: {
        role: UserRole;
      };
    }>(),
  ],
});

export const { signIn, signUp, useSession, signOut } = authClient;
