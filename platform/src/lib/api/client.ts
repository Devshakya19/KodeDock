import {
  AuthResponse,
  CatalogProduct,
  CatalogResponse,
  CreateDisputeInput,
  CreateProductInput,
  DisputeItem,
  DisputeMessage,
  LedgerEntry,
  OrderItem,
  ProductDetail,
  UpdateProfileInput,
  UserAccountBalance,
  UserProfile,
  UserSession,
} from '../types';

function getApiBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  if (!url.includes('/api/v1')) {
    url = url.replace(/\/+$/, '') + '/api/v1';
  }
  return url;
}

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

  // Attach credentials/authorization from localStorage if present
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('kd_access_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${base}${cleanEndpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error?.message || errorMessage;
    } catch {
      // Fallback
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  login: (data: any) => {
    return fetchApi<{ data: AuthResponse; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  register: (data: any) => {
    return fetchApi<{ data: AuthResponse; message?: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getMe: () => {
    return fetchApi<{ data: UserProfile }>('/auth/me');
  },
  updateProfile: (data: UpdateProfileInput) => {
    return fetchApi<{ data: UserProfile; message?: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  getSessions: () => {
    return fetchApi<{ data: UserSession[] }>('/auth/sessions');
  },
  revokeSession: (id: string) => {
    return fetchApi<{ data: boolean; message?: string }>(`/auth/sessions/${id}`, {
      method: 'DELETE',
    });
  },
  changePassword: (data: { current_password: string; new_password: string }) => {
    return fetchApi<{ data: boolean; message?: string }>('/auth/password', {
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
  getWallet: () => fetchApi<UserAccountBalance | { data: UserAccountBalance }>('/fintech/wallet'),

  getWalletTransactions: () => {
    return fetchApi<{ data: LedgerEntry[] }>('/fintech/wallet/transactions');
  },

  topupWallet: (amountPaise: number) => {
    return fetchApi<{ data: UserAccountBalance; message?: string }>('/fintech/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount_paise: amountPaise }),
    });
  },
  
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

  getDisputes: () => {
    return fetchApi<{ data: DisputeItem[] }>('/fintech/disputes');
  },

  createDispute: (data: CreateDisputeInput) => {
    return fetchApi<{ data: DisputeItem; message?: string }>('/fintech/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getDisputeMessages: (disputeId: string) => {
    return fetchApi<{ data: DisputeMessage[] }>(`/fintech/disputes/${disputeId}/messages`);
  },

  sendDisputeMessage: (disputeId: string, message: string, attachmentUrl?: string) => {
    return fetchApi<{ data: DisputeMessage }>(`/fintech/disputes/${disputeId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, attachment_url: attachmentUrl }),
    });
  },
};

export const storageApi = {
  downloadOrderPackage: (orderId: string) => {
    return fetchApi<{
      status: string;
      data: {
        download_url: string;
        order_id: string;
        order_number: string;
        product_title: string;
        license_key: string;
        archive_filename: string;
        status: string;
      };
    }>(`/storage/download/order/${orderId}`);
  },
};

