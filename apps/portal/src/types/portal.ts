/**
 * Buyer Developer Portal Types (PostgreSQL-aligned)
 */

export interface PurchasedProduct {
  orderId: string;
  productId: string;
  title: string;
  slug: string;
  tagline: string;
  category: string;
  thumbnailUrl: string;
  techStack: string[];
  licenseKey: string;
  licenseType: "COMMERCIAL" | "EXTENDED";
  licenseStatus: "ACTIVE" | "REVOKED" | "EXPIRED";
  purchasedVersion: string;
  latestVersion: string;
  checksumSha256: string;
  fileSizeBytes: number;
  purchasedAt: string;
}

export interface LicenseItem {
  id: string;
  productTitle: string;
  productSlug: string;
  licenseKey: string;
  licenseType: "COMMERCIAL" | "EXTENDED";
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  allowedDomains: string[];
  issuedAt: string;
  lastVerifiedAt: string | null;
}

export interface OrderInvoice {
  id: string;
  orderNumber: string;
  productTitle: string;
  amountPaise: number;
  formattedAmount: string; // e.g. ₹1,499
  paymentMethod: "UPI" | "CARD" | "NETBANKING";
  paymentStatus: "COMPLETED" | "REFUNDED";
  transactionId: string;
  createdAt: string;
}

export interface ApiToken {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: "SECURITY_PATCH" | "VERSION_RELEASE" | "BILLING" | "SYSTEM";
  title: string;
  message: string;
  productSlug?: string;
  read: boolean;
  createdAt: string;
}

export interface DeveloperProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  username: string;
  bio: string;
  primaryTech: string[];
  githubHandle?: string;
  twitterHandle?: string;
  linkedinHandle?: string;
  websiteUrl?: string;
  joinedAt: string;
  totalLicenses: number;
  totalOrders: number;
  accountTier: string;
  cryptographicFingerprint: string;
  location?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  identityVerified?: boolean;
  lookingFor?: string;
  avgResponseTime?: string;
  favoriteCategory?: string;
  lastActivity?: string;
}
