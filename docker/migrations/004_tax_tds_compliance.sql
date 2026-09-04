-- =============================================================
-- Migration 004: Section 194-O TDS & GST Tax Compliance
-- =============================================================

-- 1. GST Seller Profiles & Statutory Details
CREATE TABLE IF NOT EXISTS gst_seller_profiles (
    seller_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    legal_business_name VARCHAR(255) NOT NULL,
    registered_address TEXT NOT NULL,
    state_code VARCHAR(2) NOT NULL, -- e.g. '27' for Maharashtra, '29' for Karnataka, '07' for Delhi
    state_name VARCHAR(64) NOT NULL,
    gstin VARCHAR(15),
    pan_number VARCHAR(10) NOT NULL,
    is_gst_registered BOOLEAN NOT NULL DEFAULT FALSE,
    is_pan_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gst_profiles_pan ON gst_seller_profiles(pan_number);

-- 2. Section 194-O TDS Withholding Ledger (Indian Income Tax)
CREATE TABLE IF NOT EXISTS tds_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_pan VARCHAR(10) NOT NULL,
    financial_year VARCHAR(9) NOT NULL,    -- e.g. '2026-2027'
    financial_quarter VARCHAR(8) NOT NULL, -- e.g. 'Q1', 'Q2', 'Q3', 'Q4'
    gross_amount_paise BIGINT NOT NULL CHECK (gross_amount_paise > 0),
    tds_rate_bps BIGINT NOT NULL DEFAULT 100, -- 1.0% = 100 basis points
    tds_amount_paise BIGINT NOT NULL CHECK (tds_amount_paise >= 0),
    status VARCHAR(32) NOT NULL DEFAULT 'withheld' CHECK (status IN (
        'withheld',
        'deposited_with_govt',
        'form16a_issued'
    )),
    gov_challan_number VARCHAR(64),
    deposited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tds_records_seller_id ON tds_records(seller_id);
CREATE INDEX IF NOT EXISTS idx_tds_records_quarter ON tds_records(financial_year, financial_quarter);
CREATE INDEX IF NOT EXISTS idx_tds_records_pan ON tds_records(seller_pan);

-- 3. Compliant Tax Invoices Table (B2B & B2C GST)
CREATE TABLE IF NOT EXISTS tax_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(64) UNIQUE NOT NULL, -- e.g. 'KD/2026-27/00001'
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    buyer_gstin VARCHAR(15),
    seller_gstin VARCHAR(15),
    place_of_supply_state_code VARCHAR(2) NOT NULL,
    hsn_sac_code VARCHAR(16) NOT NULL DEFAULT '998431', -- Digital Content Services Code
    taxable_value_paise BIGINT NOT NULL CHECK (taxable_value_paise > 0),
    cgst_rate_bps BIGINT NOT NULL DEFAULT 0,
    cgst_amount_paise BIGINT NOT NULL DEFAULT 0,
    sgst_rate_bps BIGINT NOT NULL DEFAULT 0,
    sgst_amount_paise BIGINT NOT NULL DEFAULT 0,
    igst_rate_bps BIGINT NOT NULL DEFAULT 0,
    igst_amount_paise BIGINT NOT NULL DEFAULT 0,
    total_tax_paise BIGINT NOT NULL DEFAULT 0,
    total_invoice_paise BIGINT NOT NULL CHECK (total_invoice_paise > 0),
    invoice_pdf_storage_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_invoices_buyer_id ON tax_invoices(buyer_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_seller_id ON tax_invoices(seller_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_created_at ON tax_invoices(created_at DESC);
