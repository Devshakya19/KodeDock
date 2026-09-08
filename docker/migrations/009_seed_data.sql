-- =============================================================================
-- KODEDOCK MIGRATION 009: PRODUCTION SEED DATA
-- Idempotent initialization data for categories, configs, and roles
-- =============================================================================

-- 1. Base Marketplace Categories
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
('SaaS Starters', 'saas-starters', 'Full-stack production-ready SaaS boilerplates with auth, billing & database', 'Rocket', 1),
('Web Applications', 'web-applications', 'Modern Next.js, React, and Vue web application codebases', 'Globe', 2),
('Mobile Apps', 'mobile-apps', 'Cross-platform Flutter and React Native mobile applications', 'Smartphone', 3),
('Backend & Microservices', 'backend-microservices', 'Ultra-fast Rust, Go, and Node.js backend microservices and APIs', 'Server', 4),
('AI & Machine Learning', 'ai-machine-learning', 'AI agent workflows, LangChain pipelines, and LLM integrations', 'Bot', 5),
('DevOps & Infrastructure', 'devops-infra', 'Kubernetes Helm charts, Docker Compose, and Terraform modules', 'Container', 6),
('UI Components & Themes', 'ui-components', 'Tailwind CSS, Radix UI, and Framer Motion component libraries', 'Palette', 7)
ON CONFLICT (slug) DO NOTHING;

-- 2. Dynamic Platform Configurations (Basis Points & Policy Limits)
-- 1 bps = 0.01%, 100 bps = 1.0%, 250 bps = 2.5%, 1800 bps = 18.0%
INSERT INTO platform_configs (key, value_bps, value_json, description) VALUES
('platform_commission_bps', 250, '{"bps": 250}', 'Global marketplace platform commission rate (2.5%)'),
('tds_section_194o_bps', 100, '{"bps": 100}', 'Indian Section 194-O TDS deduction rate for e-commerce operators (1.0%)'),
('gst_rate_bps', 1800, '{"bps": 1800}', 'Standard Indian GST rate applied to platform services (18.0%)'),
('escrow_hold_period_days', 7, '{"days": 7}', 'Escrow holding duration before buyer funds are credited to seller wallet'),
('min_withdrawal_paise', 50000, '{"paise": 50000}', 'Minimum seller payout withdrawal amount (₹500.00 = 50000 Paise)'),
('totp_high_risk_threshold_paise', 1000000, '{"paise": 1000000}', 'Withdrawal threshold requiring mandatory RFC 6238 TOTP 2FA (₹10,000.00 = 1000000 Paise)')
ON CONFLICT (key) DO NOTHING;

-- 3. Base HQ RBAC System Roles
INSERT INTO hq_roles (name, description, is_system_role) VALUES
('Super Admin', 'Full unrestricted platform governance, security and financial authority', TRUE),
('Finance Manager', 'Management of payouts, escrow settlements, TDS invoices, and ledger audits', TRUE),
('Product Moderator', 'Code verification, security scanner reviews, and listing approvals', TRUE),
('Support Specialist', 'Customer tickets, buyer disputes, and user account verification', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 4. Base Platform Integrations
INSERT INTO platform_integrations (provider, is_active, config) VALUES
('razorpay', TRUE, '{"key_id": "", "key_secret": "", "webhook_secret": ""}'),
('github', TRUE, '{"client_id": "", "client_secret": ""}'),
('google', TRUE, '{"client_id": "", "client_secret": ""}'),
('seaweedfs', TRUE, '{"endpoint": "http://seaweedfs:8333", "media_bucket": "kodedock-media", "vault_bucket": "kodedock-vault"}')
ON CONFLICT (provider) DO NOTHING;
