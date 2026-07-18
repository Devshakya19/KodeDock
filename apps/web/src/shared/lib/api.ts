/**
 * API client — all requests go through the Next.js /api/proxy route.
 *
 * The proxy reads the HttpOnly `codehaat_token` cookie server-side and
 * forwards it as a Bearer Authorization header to the Rust backend.
 * This means the raw JWT token is never exposed to browser JS.
 *
 * File uploads use the proxy only for the presign request (small JSON).
 * The actual file PUT goes directly to SeaweedFS via the presigned URL,
 * keeping large payloads off the Next.js server.
 */

const PROXY_BASE = "/api/proxy";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${PROXY_BASE}${path}`, {
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${PROXY_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function apiPut<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${PROXY_BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${PROXY_BASE}${path}`, {
      method: "DELETE",
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}
