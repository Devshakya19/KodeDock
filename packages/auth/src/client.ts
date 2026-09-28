import { createAuthClient } from "better-auth/client";
import { jwtClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { UserRole } from "@kodedock/types";

/**
 * Storage keys for browser localStorage and sessionStorage
 * Guarantees that user, role, session, and auth state are cleanly accessible in DevTools.
 */
export const STORAGE_KEYS = {
  USER: "kodedock_user",
  ROLE: "kodedock_role",
  SESSION: "kodedock_session",
  SESSION_TOKEN: "kodedock_session_token",
  AUTH_STATE: "kodedock_auth_state",
} as const;

export interface StoredUser {
  id?: string;
  name?: string;
  email?: string;
  role?: UserRole | string;
  image?: string | null;
  emailVerified?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: any;
}

export interface SyncStorageOptions {
  user?: StoredUser | null;
  session?: any;
  role?: UserRole | string;
  token?: string;
}

/**
 * Synchronize authenticated user and session state into both localStorage and sessionStorage.
 * Prevents browser storage from appearing blank and maintains instant client state.
 */
export function syncAuthStorage(data: SyncStorageOptions): void {
  if (typeof window === "undefined") return;

  try {
    const user = data.user;
    const role = (data.role || user?.role || "BUYER") as UserRole;

    if (user) {
      const userPayload = {
        ...user,
        role,
      };
      const userStr = JSON.stringify(userPayload);
      window.localStorage.setItem(STORAGE_KEYS.USER, userStr);
      window.sessionStorage.setItem(STORAGE_KEYS.USER, userStr);

      window.localStorage.setItem(STORAGE_KEYS.ROLE, role);
      window.sessionStorage.setItem(STORAGE_KEYS.ROLE, role);
    }

    if (data.session) {
      const sessStr = typeof data.session === "string" ? data.session : JSON.stringify(data.session);
      window.localStorage.setItem(STORAGE_KEYS.SESSION, sessStr);
      window.sessionStorage.setItem(STORAGE_KEYS.SESSION, sessStr);
    }

    if (data.token) {
      window.localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, data.token);
      window.sessionStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, data.token);
    }

    if (user || data.token || data.session) {
      const authState = {
        isAuthenticated: true,
        userId: user?.id,
        name: user?.name,
        email: user?.email,
        role,
        lastActive: new Date().toISOString(),
      };
      const stateStr = JSON.stringify(authState);
      window.localStorage.setItem(STORAGE_KEYS.AUTH_STATE, stateStr);
      window.sessionStorage.setItem(STORAGE_KEYS.AUTH_STATE, stateStr);
    }
  } catch (err) {
    console.warn("[kodedock] Error writing to browser storage:", err);
  }
}

/**
 * Clear all Kodedock authentication records from localStorage and sessionStorage
 */
export function clearAuthStorage(): void {
  if (typeof window === "undefined") return;

  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    });
  } catch (err) {
    console.warn("[kodedock] Error clearing browser storage:", err);
  }
}

/**
 * Retrieve current user and auth state from browser storage
 */
export function getAuthStorage(): {
  user: StoredUser | null;
  role: string | null;
  session: any | null;
  token: string | null;
  isAuthenticated: boolean;
} {
  if (typeof window === "undefined") {
    return { user: null, role: null, session: null, token: null, isAuthenticated: false };
  }

  try {
    const rawUser = window.localStorage.getItem(STORAGE_KEYS.USER) || window.sessionStorage.getItem(STORAGE_KEYS.USER);
    const user = rawUser ? JSON.parse(rawUser) : null;
    const role = window.localStorage.getItem(STORAGE_KEYS.ROLE) || window.sessionStorage.getItem(STORAGE_KEYS.ROLE) || user?.role || null;
    const rawSession = window.localStorage.getItem(STORAGE_KEYS.SESSION) || window.sessionStorage.getItem(STORAGE_KEYS.SESSION);
    const session = rawSession ? JSON.parse(rawSession) : null;
    const token = window.localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN) || window.sessionStorage.getItem(STORAGE_KEYS.SESSION_TOKEN) || null;
    const rawState = window.localStorage.getItem(STORAGE_KEYS.AUTH_STATE) || window.sessionStorage.getItem(STORAGE_KEYS.AUTH_STATE);
    const authState = rawState ? JSON.parse(rawState) : null;

    return {
      user,
      role,
      session,
      token,
      isAuthenticated: Boolean(authState?.isAuthenticated || user || token),
    };
  } catch {
    return { user: null, role: null, session: null, token: null, isAuthenticated: false };
  }
}

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
  advanced: {
    cookiePrefix: "kodedock",
  },
  plugins: [
    jwtClient(),
    inferAdditionalFields<{
      user: {
        role: UserRole;
      };
    }>(),
  ],
});

export const { signIn, signUp, useSession } = authClient;

/**
 * Sign out helper that clears Better Auth session as well as localStorage and sessionStorage
 */
export const signOut: typeof authClient.signOut = async (
  ...args: Parameters<typeof authClient.signOut>
) => {
  clearAuthStorage();
  return (authClient.signOut as any)(...args);
};
