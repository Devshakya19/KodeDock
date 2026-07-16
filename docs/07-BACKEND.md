# CodeHaat — Backend Work & Schema

> Detailed backend implementation plan — what each service does, complete database schema, and API specifications.

---

## 1. Service Architecture Summary

| Service | Language | Port | Role |
|---------|----------|------|------|
| Core Engine | Rust | 4001 | Security, transactions, wallet |
| AI Service | Python | 4002 | Recommendations, search, fraud |
| Infrastructure Worker | Go | 4003 | GitHub API, Docker, background jobs |
| Real-Time Service | Node.js | 4004 | WebSocket notifications |
| Database | PostgreSQL | - | Primary database |
| Cache/Queue | Redis | 6379 | Jobs, cache, pub/sub |

---

## 2. Database Schema (Complete SQL)

### Enable UUID Extension

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Table: profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'developer', 'admin')),
  bio TEXT,
  avatar_url TEXT,
  github_username TEXT,
  github_access_token TEXT,  -- Encrypted at rest
  website TEXT,
  location TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.full_name, ''), NEW.role);
  INSERT INTO public.wallets (user_id, balance_paise)
  VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Table: categories

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  product_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed categories
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Web Templates', 'web-templates', 'layout', 1),
  ('Mobile Apps', 'mobile-apps', 'smartphone', 2),
  ('UI Kits', 'ui-kits', 'palette', 3),
  ('B.Tech Projects', 'btech-projects', 'graduation-cap', 4),
  ('Boilerplates', 'boilerplates', 'terminal', 5),
  ('API Templates', 'api-templates', 'code', 6);
```

### Table: products

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  price_paise INTEGER NOT NULL CHECK (price_paise >= 4900),  -- Min ₹49
  original_price_paise INTEGER,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  github_repo_url TEXT,
  github_repo_id INTEGER,
  preview_url TEXT,
  image_url TEXT,
  demo_url TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  sales_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_slug ON products(slug);
```

### Table: wallets

```sql
CREATE TABLE wallets (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance_paise INTEGER NOT NULL DEFAULT 0 CHECK (balance_paise >= 0),
  pending_paise INTEGER NOT NULL DEFAULT 0 CHECK (pending_paise >= 0),
  total_earned_paise INTEGER NOT NULL DEFAULT 0,
  total_spent_paise INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: wallet_transactions

```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_user_id UUID NOT NULL REFERENCES wallets(user_id),
  type TEXT NOT NULL CHECK (type IN ('topup', 'purchase', 'sale', 'withdrawal', 'refund', 'adjustment', 'commission')),
  amount_paise INTEGER NOT NULL,
  balance_after_paise INTEGER NOT NULL,
  description TEXT,
  reference_id UUID,  -- order_id, product_id, etc.
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_tx_user ON wallet_transactions(wallet_user_id);
CREATE INDEX idx_wallet_tx_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_tx_created ON wallet_transactions(created_at);
```

### Table: orders

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  product_id UUID NOT NULL REFERENCES products(id),
  amount_paise INTEGER NOT NULL,
  platform_fee_paise INTEGER NOT NULL,  -- 2.5%
  seller_amount_paise INTEGER NOT NULL,  -- 97.5%
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'refunded', 'disputed', 'cancelled')),
  github_repo_url TEXT,
  github_transfer_status TEXT CHECK (github_transfer_status IN ('pending', 'transferring', 'completed', 'failed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  disputed_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_product ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### Table: escrow

```sql
CREATE TABLE escrow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) UNIQUE,
  amount_paise INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded', 'disputed')),
  held_until TIMESTAMPTZ NOT NULL,  -- created_at + 48 hours
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_escrow_status ON escrow(status);
CREATE INDEX idx_escrow_held_until ON escrow(held_until);
```

### Table: reviews

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
```

### Table: notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

### Table: disputes

```sql
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  raised_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
```

---

## 3. Row-Level Security Policies

```sql
-- Note: RLS is optional when using a service-role connection from the backend.
-- Enable if exposing the database directly to clients.
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
-- CREATE POLICY "Update own profile" ON profiles FOR UPDATE USING (id = current_setting('app.current_user_id')::uuid);
```

---

## 4. Redis Job Queues

### Queue Names

| Queue | Producer | Consumer | Purpose |
|-------|----------|----------|---------|
| `repo_transfer` | Core Engine (Rust) | Infra Worker (Go) | GitHub repo creation |
| `preview_build` | Core Engine (Rust) | Infra Worker (Go) | Docker container start |
| `preview_cleanup` | Cron job | Infra Worker (Go) | Docker container cleanup |
| `notification` | Core Engine (Rust) | Real-Time (Node.js) | Push notifications |
| `analytics` | Core Engine (Rust) | AI Service (Python) | User behavior tracking |

### Job Schema (JSON)

```json
{
  "id": "uuid",
  "type": "repo_transfer",
  "payload": {
    "orderId": "uuid",
    "buyerId": "uuid",
    "sellerGithubToken": "encrypted",
    "sellerRepoUrl": "https://github.com/...",
    "buyerGithubToken": "encrypted"
  },
  "priority": "high",
  "attempts": 0,
  "maxAttempts": 5,
  "createdAt": "2026-07-13T00:00:00Z"
}
```

---

## 5. API Route Map

### Core Engine (Rust) — Port 4001

```
POST   /api/auth/verify              # Verify JWT, return user
GET    /api/products                 # List products (with filters)
GET    /api/products/:id             # Get product detail
POST   /api/orders                   # Create order (purchase)
GET    /api/orders                   # List user orders
GET    /api/orders/:id               # Get order detail
GET    /api/wallet                   # Get wallet balance
POST   /api/wallet/topup             # Top up wallet (paper money)
POST   /api/wallet/withdraw          # Request withdrawal
POST   /api/seller/products          # Create product
PUT    /api/seller/products/:id      # Update product
DELETE /api/seller/products/:id      # Delete product
GET    /api/seller/stats             # Get seller statistics
GET    /api/reviews/:productId       # Get product reviews
POST   /api/reviews                  # Create review
POST   /api/disputes                 # Raise dispute
GET    /api/notifications            # Get user notifications
PUT    /api/notifications/:id/read   # Mark notification read
```

### AI Service (Python) — Port 4002

```
GET    /api/recommendations/:userId  # Get recommendations
POST   /api/search                   # AI-powered search
POST   /api/fraud/check              # Check fraud signals
GET    /api/analytics/dashboard      # Admin analytics
```

### Infrastructure Worker (Go) — Port 4003

```
GET    /api/health                   # Health check
GET    /api/jobs/status              # Job queue status
POST   /api/preview/build            # Trigger preview build
POST   /api/preview/stop             # Stop preview container
GET    /api/preview/:id/logs         # Get preview logs
```

### Real-Time Service (Node.js) — Port 4004

```
GET    /ws                           # WebSocket upgrade
GET    /health                       # Health check
```

---

## 6. Caching Strategy

| Data | Cache Duration | Invalidation |
|------|---------------|--------------|
| Product list | 5 minutes | On product update |
| Product detail | 10 minutes | On product update |
| Categories | 1 hour | On category update |
| User profile | 5 minutes | On profile update |
| Search results | 2 minutes | On product change |

---

## 7. Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/*` | 10 requests | 1 minute |
| `/api/products` | 100 requests | 1 minute |
| `/api/orders` | 10 requests | 1 minute |
| `/api/wallet/*` | 20 requests | 1 minute |
| Global | 1000 requests | 1 minute |

---

*Document Version: 1.0 | Last Updated: July 2026*
