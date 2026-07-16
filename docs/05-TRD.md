# CodeHaat — Technical Requirements Document

> Exact technical specifications for every service, endpoint, and schema.

---

## 1. Frontend Technical Specs

### Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16+ | Framework |
| React | 19 | UI library |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | New York | Component library |
| Framer Motion | 12+ | Animations |
| JWT Auth | - | Auth client |

### Key Dependencies

```json
{
  "next": "^16.1.1",
  "react": "^19.0.0",
  "framer-motion": "^12.23.2",
  "lucide-react": "^0.525.0",
  "sonner": "^2.0.6"
}
```

---

## 2. Core Engine (Rust) Technical Specs

### Stack

| Technology | Purpose |
|------------|---------|
| Rust | Language |
| Actix-Web / Axum | HTTP framework |
| SQLx / Diesel | Database access |
| Serde | JSON serialization |
| Tokio | Async runtime |

### API Endpoints

```
POST   /api/auth/verify          # Verify JWT token
GET    /api/products             # List products
GET    /api/products/:id         # Get product detail
POST   /api/orders               # Create order (purchase)
GET    /api/orders               # List user orders
GET    /api/orders/:id           # Get order detail
GET    /api/wallet               # Get wallet balance
POST   /api/wallet/topup         # Top up wallet (paper money)
POST   /api/wallet/withdraw      # Request withdrawal
POST   /api/seller/products      # Create product
PUT    /api/seller/products/:id  # Update product
DELETE /api/seller/products/:id  # Delete product
GET    /api/seller/stats         # Get seller statistics
```

---

## 3. AI Service (Python) Technical Specs

### Stack

| Technology | Purpose |
|------------|---------|
| Python 3.11+ | Language |
| FastAPI | HTTP framework |
| Pydantic | Data validation |
| Sentence Transformers | Embeddings |
| Redis | Event subscription |

### Endpoints

```
GET    /api/recommendations/:userId     # Get personalized recommendations
POST   /api/search                      # AI-powered search
POST   /api/fraud/check                 # Check for fraudulent activity
GET    /api/analytics/user/:userId      # User behavior analytics
```

---

## 4. Infrastructure Worker (Go) Technical Specs

### Stack

| Technology | Purpose |
|------------|---------|
| Go 1.22+ | Language |
| Standard library | HTTP, concurrency |
| go-redis | Redis client |
| Octokit | GitHub API |

### Background Jobs

| Job | Trigger | Action |
|-----|---------|--------|
| `repo_transfer` | Order completed | Clone repo → Create in buyer's GitHub |
| `preview_build` | Seller clicks "Build" | Start Docker container for preview |
| `preview_cleanup` | 30 min inactivity | Stop and remove Docker container |
| `payout_process` | Weekly cron | Process seller payouts |
| `notification_send` | Event fired | Send email/push notification |

---

## 5. Real-Time Service (Node.js) Technical Specs

### Stack

| Technology | Purpose |
|------------|---------|
| JavaScript | Language |
| ws | WebSocket library |
| Redis | Pub/Sub for events |

### WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `order.completed` | Server → Client | `{ orderId, productId, repoUrl }` |
| `repo.transferred` | Server → Client | `{ orderId, githubUrl }` |
| `preview.ready` | Server → Client | `{ previewUrl, containerId }` |
| `notification.new` | Server → Client | `{ type, message, data }` |

---

## 6. Database Schema

### Table: `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'developer', 'admin')),
  bio TEXT,
  avatar_url TEXT,
  github_username TEXT,
  github_access_token TEXT,  -- Encrypted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `categories`

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `products`

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  price_paise INTEGER NOT NULL CHECK (price_paise > 0),
  original_price_paise INTEGER,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  github_repo_url TEXT,
  github_repo_id INTEGER,
  preview_url TEXT,
  image_url TEXT,
  sales_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `wallets`

```sql
CREATE TABLE wallets (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance_paise INTEGER NOT NULL DEFAULT 0 CHECK (balance_paise >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `wallet_transactions`

```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_user_id UUID NOT NULL REFERENCES wallets(user_id),
  type TEXT NOT NULL CHECK (type IN ('topup', 'purchase', 'sale', 'withdrawal', 'refund', 'adjustment')),
  amount_paise INTEGER NOT NULL,
  description TEXT,
  reference_id UUID,  -- Links to order_id if purchase/sale
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `orders`

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  product_id UUID NOT NULL REFERENCES products(id),
  amount_paise INTEGER NOT NULL,
  platform_fee_paise INTEGER NOT NULL,
  seller_amount_paise INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'disputed')),
  github_repo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  disputed_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);
```

### Table: `reviews`

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);
```

### Table: `notifications`

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
NEXT_PUBLIC_WS_URL=ws://localhost:4004
```

### Core Engine (Rust)

```env
PORT=4001
DATABASE_URL=postgres://codehaat:codehaat_secret@localhost:5432/codehaat
REDIS_URL=redis://localhost:6379
JWT_SECRET=xxx
```

### AI Service (Python)

```env
PORT=4002
REDIS_URL=redis://localhost:6379
```

### Infrastructure Worker (Go)

```env
PORT=4003
REDIS_URL=redis://localhost:6379
GITHUB_APP_ID=xxx
GITHUB_PRIVATE_KEY=xxx
DOCKER_SOCKET=/var/run/docker.sock
```

### Real-Time Service (Node.js)

```env
PORT=4004
REDIS_URL=redis://localhost:6379
```

---

*Document Version: 1.0 | Last Updated: July 2026*
