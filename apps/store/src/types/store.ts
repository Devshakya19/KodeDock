export interface StoreProduct {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_image?: string | null;
  title: string;
  slug: string;
  tagline: string;
  description?: string;
  category: string;
  tech_stack: string[];
  live_demo_url?: string | null;
  thumbnail_url: string;
  preview_images?: string[];
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";
  standard_price: number; // in paise
  extended_price?: number | null; // in paise
  formatted_price: string;
  formatted_extended_price?: string | null;
  total_sales: number;
  avg_rating: number | string;
  created_at: string;
}

export interface StoreCategory {
  category: string;
  count: number;
}

export interface ProductVersion {
  id: string;
  version: string;
  changelog: string;
  file_size_bytes: number;
  checksum_sha256: string;
  created_at: string;
}

export interface ProductDetail extends StoreProduct {
  versions: ProductVersion[];
  pricing?: {
    standard: {
      paise: number;
      formatted: string;
    };
    extended?: {
      paise: number;
      formatted: string;
    } | null;
  };
}
