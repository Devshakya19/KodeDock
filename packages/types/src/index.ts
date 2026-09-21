/**
 * Kodedock Core Shared Types
 */

// ==========================================
// 1. Roles & Authentication (Better Auth)
// ==========================================

export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

// ==========================================
// 2. Pricing & Currency (INR Native)
// ==========================================

export type Currency = "INR" | "USD";

export interface PriceInPaise {
  amount: number; // in paise (e.g., 99900 = ₹999.00)
  currency: Currency;
  formatted: string; // e.g., "₹999"
}

export const MINIMUM_PRODUCT_PRICE_PAISE = 29900; // ₹299 floor
export const PLATFORM_TOTAL_FEE_PERCENT = 5.0; // 5% total deduction
export const DEVELOPER_PAYOUT_PERCENT = 95.0; // 95% net to creator

// ==========================================
// 3. Product Catalog & Assets
// ==========================================

export type ProductCategory =
  | "saas-starter"
  | "ui-kit"
  | "ai-agent"
  | "backend"
  | "devops"
  | "tools"
  | "database";

export type ProductStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "REJECTED";

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: ProductCategory;
  techStack: string[];
  liveDemoUrl?: string | null;
  thumbnailUrl: string;
  previewImages: string[];
  status: ProductStatus;
  standardPrice: number; // in paise
  extendedPrice?: number | null; // in paise
  totalSales: number;
  avgRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVersion {
  id: string;
  productId: string;
  version: string; // e.g. "1.0.0"
  changelog?: string | null;
  fileSizeBytes: number;
  createdAt: Date;
}

// ==========================================
// 4. Orders, Licenses & Payouts
// ==========================================

export type LicenseType = "STANDARD" | "COMMERCIAL" | "EXTENDED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "REFUNDED";
export type PaymentMethod = "razorpay" | "cashfree" | "stripe";

export interface Order {
  id: string;
  buyerId: string;
  productId: string;
  licenseType: LicenseType;
  amount: number; // in paise
  currency: Currency;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string | null;
  createdAt: Date;
}

export interface License {
  id: string;
  orderId: string;
  buyerId: string;
  productId: string;
  licenseKey: string; // e.g. KD-XXXX-XXXX-XXXX-XXXX
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  createdAt: Date;
}

export interface SellerPayout {
  id: string;
  sellerId: string;
  amount: number; // in paise (95%)
  platformFee: number; // in paise (5%)
  status: "PENDING" | "PROCESSED" | "FAILED";
  payoutAccount: string; // UPI ID or Bank Account
  processedAt?: Date | null;
  createdAt: Date;
}

// ==========================================
// 5. Standard API Response Envelope
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
