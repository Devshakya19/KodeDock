// KodeDock Marketplace & Fintech Domain Types

export interface CatalogProduct {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  summary: string;
  asset_type: string;
  base_price_paise: number; // Integer paise (e.g. 499900 = ₹4,999.00)
  status: string;
  is_verified: boolean;
  sales_count: number;
  rating_average?: number;
  created_at: string;
  tags?: string[];
  tech_stack?: string[];
  seller?: {
    username: string;
    verified: boolean;
    rating: number;
    sales: number;
  };
}

export interface CatalogResponse {
  products: CatalogProduct[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductDetail extends CatalogProduct {
  description: string;
  demo_url?: string;
  github_repo_url?: string;
  security_scan: {
    is_clean: boolean;
    ast_tree_verified: boolean;
    secrets_leaked_count: number;
    entropy_scan_status: string;
    inspected_at: string;
  };
  escrow_terms: {
    inspection_hours: number;
    tds_rate_percent: number;
    gst_rate_percent: number;
    platform_fee_percent: number;
  };
}

export interface OrderItem {
  id: string;
  order_number: string;
  product_id: string;
  product_title: string;
  product_slug: string;
  gross_amount_paise: number;
  platform_fee_paise: number;
  tds_amount_paise: number;
  gst_amount_paise: number;
  status: 'pending' | 'paid_held_in_escrow' | 'completed' | 'disputed' | 'refunded';
  created_at: string;
  inspection_deadline?: string;
  download_available: boolean;
}

export interface CreateProductInput {
  title: string;
  summary: string;
  description: string;
  asset_type?: string;
  base_price_paise: number;
  demo_url?: string;
  github_repo_url?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}
