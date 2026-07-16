const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Store token in memory (for client-side)
let currentToken: string | null = null;

export const auth = {
  async signUp(data: { email: string; password: string; fullName: string; role?: string }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        role: data.role || "user",
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Registration failed");
    }

    currentToken = result.data.token;
    if (typeof window !== "undefined") {
      localStorage.setItem("codehaat_token", result.data.token);
      document.cookie = `codehaat_token=${result.data.token}; path=/; max-age=86400; SameSite=Lax`;
    }
    return result.data;
  },

  async signIn(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Login failed");
    }

    currentToken = result.data.token;
    if (typeof window !== "undefined") {
      localStorage.setItem("codehaat_token", result.data.token);
      document.cookie = `codehaat_token=${result.data.token}; path=/; max-age=86400; SameSite=Lax`;
    }
    return result.data;
  },

  async signOut(): Promise<void> {
    if (currentToken) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentToken}`,
        },
      });
    }
    currentToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("codehaat_token");
      document.cookie = "codehaat_token=; path=/; max-age=0";
    }
  },

  async getUser(): Promise<User | null> {
    if (!currentToken) {
      // Try to get token from localStorage
      if (typeof window !== "undefined") {
        currentToken = localStorage.getItem("codehaat_token");
      }
    }

    if (!currentToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          "Authorization": `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        currentToken = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem("codehaat_token");
        }
        return null;
      }

      const result = await response.json();
      return result.data;
    } catch {
      return null;
    }
  },

  async getSession(): Promise<{ token: string } | null> {
    if (!currentToken) {
      if (typeof window !== "undefined") {
        currentToken = localStorage.getItem("codehaat_token");
      }
    }

    return currentToken ? { token: currentToken } : null;
  },

  setToken(token: string) {
    currentToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("codehaat_token", token);
      // Also set cookie for Next.js middleware
      document.cookie = `codehaat_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    }
  },

  getToken(): string | null {
    if (!currentToken && typeof window !== "undefined") {
      currentToken = localStorage.getItem("codehaat_token");
    }
    return currentToken;
  },

  clearToken() {
    currentToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("codehaat_token");
    }
  },
};
