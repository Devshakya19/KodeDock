/**
 * Creator & Seller Studio Types (PostgreSQL-aligned)
 */

export interface CreatorStats {
  totalRevenuePaise: number;
  formattedRevenue: string;
  totalSalesCount: number;
  activeListingsCount: number;
  pendingPayoutPaise: number;
  formattedPendingPayout: string;
  viewsCount: number;
}

export interface CreatorProduct {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description?: string;
  category: string;
  tech_stack: string[];
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";
  standard_price: number; // in paise
  extended_price?: number | null; // in paise
  formatted_price: string;
  formatted_extended_price?: string | null;
  total_sales: number;
  total_revenue_paise: number;
  formatted_revenue: string;
  active_version: string;
  thumbnail_url: string;
  live_demo_url?: string | null;
  github_repo_url?: string | null;
  created_at: string;
}

export interface CreatorRelease {
  id: string;
  productId: string;
  productTitle: string;
  version: string;
  changelog: string;
  checksumSha256: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface CreatorPayout {
  id: string;
  amountPaise: number; // 95% creator share
  platformFeePaise: number; // 5% platform fee
  formattedAmount: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  payoutAccount: string;
  processedAt: string | null;
  createdAt: string;
}

export interface CreatorSale {
  id: string;
  orderNumber: string;
  productTitle: string;
  buyerEmailMasked: string;
  licenseType: string;
  grossPaise: number;
  creatorSharePaise: number;
  formattedCreatorShare: string;
  createdAt: string;
}
