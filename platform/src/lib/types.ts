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
  access_token: string;
  token?: string;
  expires_in_seconds?: number;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
  bio?: string | null;
  pan_number?: string | null;
  gst_number?: string | null;
  is_email_verified?: boolean;
  created_at?: string;
}

export interface UpdateProfileInput {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  pan_number?: string;
  gst_number?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  ip_address?: string | null;
  user_agent?: string | null;
  is_active: boolean;
  last_seen_at: string;
  expires_at: string;
  created_at: string;
}

export interface DisputeItem {
  id: string;
  order_id: string;
  order_number: string;
  product_title: string;
  buyer_id: string;
  seller_id: string;
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved_refunded' | 'resolved_released';
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDisputeInput {
  order_id: string;
  reason: string;
  description: string;
}

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  message: string;
  attachment_url?: string | null;
  created_at: string;
}

export interface UserAccountBalance {
  user_id: string;
  available_balance_paise: number;
  pending_escrow_paise: number;
  lifetime_earned_paise: number;
  lifetime_withdrawn_paise: number;
  is_payout_frozen: boolean;
}

export interface LedgerEntry {
  id: string;
  transaction_id: string;
  account_id: string;
  entry_type: 'debit' | 'credit';
  amount_paise: number;
  category: string;
  description: string;
  created_at: string;
}

