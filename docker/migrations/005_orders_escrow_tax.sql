-- =============================================================================
-- KODEDOCK MIGRATION 005: ORDERS, 7-DAY ESCROW, REVIEWS & TAX INVOICES
-- Financial arithmetic strictly in BIGINT (Integer Paise)
-- =============================================================================

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  amount_paise BIGINT NOT NULL CHECK (amount_paise >= 0),
  platform_fee_paise BIGINT NOT NULL DEFAULT 0 CHECK (platform_fee_paise >= 0),
  seller_amount_paise BIGINT NOT NULL DEFAULT 0 CHECK (seller_amount_paise >= 0),
  tds_amount_paise BIGINT NOT NULL DEFAULT 0 CHECK (tds_amount_paise >= 0), -- 1% Sec 194-O TDS
  gst_amount_paise BIGINT NOT NULL DEFAULT 0 CHECK (gst_amount_paise >= 0), -- 18% GST
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'refunded', 'disputed', 'cancelled')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  github_repo_url TEXT,
  github_transfer_status TEXT CHECK (github_transfer_status IN ('pending', 'transferring', 'completed', 'failed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  disputed_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7-Day Escrow table
CREATE TABLE IF NOT EXISTS escrow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) UNIQUE ON DELETE CASCADE,
  amount_paise BIGINT NOT NULL CHECK (amount_paise >= 0),
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded', 'disputed')),
  held_until TIMESTAMPTZ NOT NULL, -- Defaults to NOW() + INTERVAL '7 days'
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table (Verified purchase only)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  seller_reply TEXT,
  replied_at TIMESTAMPTZ,
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id)
);

-- Tax Invoices table (Indian GST & Section 194-O TDS Compliance)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(64) NOT NULL UNIQUE, -- e.g. 'KD-2026-INV-00001'
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  taxable_amount_paise BIGINT NOT NULL CHECK (taxable_amount_paise >= 0),
  cgst_paise BIGINT NOT NULL DEFAULT 0,
  sgst_paise BIGINT NOT NULL DEFAULT 0,
  igst_paise BIGINT NOT NULL DEFAULT 0,
  tds_section_194o_paise BIGINT NOT NULL DEFAULT 0,
  total_amount_paise BIGINT NOT NULL CHECK (total_amount_paise >= 0),
  buyer_gstin VARCHAR(15),
  seller_pan VARCHAR(10),
  pdf_s3_bucket VARCHAR(64) DEFAULT 'kodedock-vault',
  pdf_s3_key TEXT, -- SeaweedFS S3 key for PDF
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders (seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders (product_id);
CREATE INDEX IF NOT EXISTS idx_escrow_held_until ON escrow (held_until) WHERE status = 'held';
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices (order_id);
