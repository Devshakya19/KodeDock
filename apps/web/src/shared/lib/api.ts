import { auth } from "@/shared/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = auth.getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}${path}`, { headers });
    return await response.json();
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function apiPut<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers,
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}
