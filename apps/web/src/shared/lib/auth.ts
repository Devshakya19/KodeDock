/**
 * Auth client for browser-side code.
 *
 * All calls go through same-origin `/api/auth/*` routes. The actual token is
 * stored in an HttpOnly cookie set by the server — never exposed to JS.
 * `localStorage` is NOT used, making XSS token theft impossible.
 */

const API_URL = process.env.CORE_ENGINE_URL || "http://localhost:4001";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
}

/**
 * Server-side user fetch. Reads the JWT from cookies, verifies it,
 * and fetches user data directly from the Rust backend.
 * Use this in server components instead of auth.getUser().
 */
export async function getServerUser(): Promise<User | null> {
  try {
    const { cookies } = await import("next/headers");
    const { verifyToken } = await import("@/shared/lib/server-auth");

    const cookieStore = await cookies();
    const token = cookieStore.get("codehaat_token")?.value;
    if (!token) return null;

    const claims = await verifyToken(token);
    if (!claims) return null;

    // Fetch full user data from backend
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const result = await res.json();
    return result.data || null;
  } catch {
    return null;
  }
}

/**
 * Get the JWT token from cookies server-side.
 * Use this in server components for API calls.
 */
export async function getServerToken(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers");
    const { verifyToken } = await import("@/shared/lib/server-auth");
    const cookieStore = await cookies();
    const token = cookieStore.get("codehaat_token")?.value;
    if (!token) return null;
    const claims = await verifyToken(token);
    return claims ? token : null;
  } catch {
    return null;
  }
}

/**
 * Server-side API fetch. Reads token from cookies and calls the Rust backend directly.
 * Use this in server components instead of apiGet().
 */
export async function serverApiGet<T>(path: string): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = await getServerToken();
    if (!token) return { success: false, error: "Not authenticated" };

    const res = await fetch(`${API_URL}/api${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch {
    return { success: false, error: "Network error" };
  }
}

export async function serverApiPost<T>(path: string, body: unknown): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = await getServerToken();
    if (!token) return { success: false, error: "Not authenticated" };

    const res = await fetch(`${API_URL}/api${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch {
    return { success: false, error: "Network error" };
  }
}

export async function serverApiPut<T>(path: string, body: unknown): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = await getServerToken();
    if (!token) return { success: false, error: "Not authenticated" };

    const res = await fetch(`${API_URL}/api${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch {
    return { success: false, error: "Network error" };
  }
}

export const auth = {
  async signUp(data: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }): Promise<AuthResponse> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        role: data.role || "user",
      }),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || "Registration failed");
    }
    return result.data;
  },

  async signIn(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || "Login failed");
    }
    return result.data;
  },

  async signOut(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
  },

  async getUser(): Promise<User | null> {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      const result = await res.json();
      return result.data || null;
    } catch {
      return null;
    }
  },

  async requireAuth(): Promise<User | null> {
    return this.getUser();
  },
};
