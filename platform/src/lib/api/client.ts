// KodeDock API Client Wrapper
import { AuthResponse, CatalogProduct, CatalogResponse, CreateProductInput, OrderItem, ProductDetail } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export function formatPaiseToInr(paise: number): string {
  const rupees = Math.floor(paise / 100);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatPaiseDetailed(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(rupees);
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  // Attach credentials/authorization from localStorage or cookie if present
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('kd_access_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // JSON parse error fallback
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  login: (data: any) => {
    return fetchApi<{ data: AuthResponse }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  register: (data: any) => {
    return fetchApi<{ data: AuthResponse }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const marketplaceApi = {
  getCatalog: (params?: { q?: string; asset_type?: string; sort?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set('q', params.q);
    if (params?.asset_type) searchParams.set('asset_type', params.asset_type);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const queryStr = searchParams.toString();
    return fetchApi<{ data: CatalogResponse }>(`/marketplace/catalog${queryStr ? `?${queryStr}` : ''}`);
  },

  getProduct: (slug: string) => {
    return fetchApi<{ data: ProductDetail }>(`/marketplace/catalog/${slug}`);
  },

  createProduct: (data: CreateProductInput) => {
    return fetchApi<{ data: CatalogProduct }>('/marketplace/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  publishProduct: (id: string) => {
    return fetchApi<{ data: CatalogProduct }>(`/marketplace/products/${id}/publish`, {
      method: 'POST',
    });
  },

  getMyProducts: () => {
    return fetchApi<{ data: CatalogProduct[] }>('/marketplace/products');
  },
};

export const fintechApi = {
  getWallet: () => fetchApi<{ data: any }>('/fintech/wallet'),
  
  createOrder: (productId: string, paymentProvider: 'razorpay' | 'stripe' | 'wallet' = 'razorpay') => {
    return fetchApi<{ data: OrderItem }>('/fintech/orders', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, payment_provider: paymentProvider }),
    });
  },

  getMyOrders: () => {
    return fetchApi<{ data: OrderItem[] }>('/fintech/orders');
  },

  approveEscrow: (orderId: string) => {
    return fetchApi<{ data: any }>(`/fintech/escrow/${orderId}/approve`, {
      method: 'POST',
    });
  },
};
