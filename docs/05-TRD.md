# CodeHaat — Technical Requirements Document

> Exact technical specifications for every service, endpoint, and schema.

---

## Table of Contents
1. [Frontend Technical Specs](#1-frontend-technical-specs)
2. [Core Engine (Rust) Technical Specs](#2-core-engine-rust-technical-specs)
3. [AI Service (Python) Technical Specs](#3-ai-service-python-technical-specs)
4. [Infrastructure Worker (Go) Technical Specs](#4-infrastructure-worker-go-technical-specs)
5. [Real-Time Service (Node.js) Technical Specs](#5-real-time-service-nodejs-technical-specs)
6. [Database Schema](#6-database-schema)
7. [Environment Variables](#7-environment-variables)

---

## 1. Frontend Technical Specs

### Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15 | Framework |
| React | 19 | UI library |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | New York | Component library |
| Framer Motion | 12+ | Animations |
| JWT Auth | - | Auth client |

### Key Dependencies

```json
{
  "next": "^15.0.0",
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
POST   /api/orders               # Create order (purchase via Razorpay or Wallet)
GET    /api/orders               # List user orders
GET    /api/orders/:id           # Get order detail
GET    /api/wallet               # Get wallet balance
POST   /api/wallet/topup         # Top up wallet (Razorpay)
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

```mermaid
flowchart LR
    subgraph Triggers
        Order[Order Completed]
        Build[Seller clicks 'Build']
        Inactivity[30 min inactivity]
        Cron[Weekly Cron]
        Event[Event fired]
    end
    
    Queue[(Redis BullMQ)]
    Worker[Go Worker]
    
    Order -.-> |repo_transfer| Queue
    Build -.-> |preview_build| Queue
    Inactivity -.-> |preview_cleanup| Queue
    Cron -.-> |payout_process| Queue
    Event -.-> |notification_send| Queue
    
    Queue --> Worker
    
    Worker --> A[Clone repo & transfer]
    Worker --> B[Start Docker container]
    Worker --> C[Stop Docker container]
    Worker --> D[Process seller payouts]
    Worker --> E[Send email/push]
```

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

```mermaid
sequenceDiagram
    participant Redis as Redis (Pub/Sub)
    participant Node as Node.js Real-Time Service
    participant Client as Web Client
    
    Redis->>Node: New Event Message
    
    alt Event: order.completed
        Node->>Client: { orderId, productId, repoUrl }
    else Event: repo.transferred
        Node->>Client: { orderId, githubUrl }
    else Event: preview.ready
        Node->>Client: { previewUrl, containerId }
    else Event: notification.new
        Node->>Client: { type, message, data }
    end
```

| Event | Direction | Payload |
|-------|-----------|---------|
| `order.completed` | Server → Client | `{ orderId, productId, repoUrl }` |
| `repo.transferred` | Server → Client | `{ orderId, githubUrl }` |
| `preview.ready` | Server → Client | `{ previewUrl, containerId }` |
| `notification.new` | Server → Client | `{ type, message, data }` |

---

## 6. Database Schema

CodeHaat uses 13 core tables to manage the marketplace logic. Below is a summary of all tables and the schema for the most critical ones.

### Tables Overview
1. `profiles`
2. `categories`
3. `products`
4. `wallets`
5. `wallet_transactions`
6. `orders`
7. `escrow`
8. `reviews`
9. `notifications`
10. `payout_accounts`
11. `payout_requests`
12. `product_views`
13. `disputes`

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

*(Remaining tables: `escrow`, `payout_accounts`, `payout_requests`, `product_views`, `disputes` are present in full SQL schema definitions, handling escrow life-cycles, payout processing, analytics, and conflict resolution respectively.)*

---

## 7. Environment Variables

Below is the complete set of required and optional environment variables.

### Main Configuration (`.env`)

```env
# =============================================================================
# CodeHaat - Environment Variables
# =============================================================================
# Razorpay Payment Gateway (REQUIRED)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Database
POSTGRES_PASSWORD=codehaat_secret

# Redis
REDIS_PASSWORD=codehaat_redis_secret

# JWT Secret
JWT_SECRET=codehaat-super-secret-jwt-key-change-in-production-2024
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
NEXT_PUBLIC_WS_URL=ws://localhost:4004
```

### Core Engine (Rust)

```env
PORT=4001
DATABASE_URL=postgres://codehaat:codehaat_secret@localhost:5432/codehaat
REDIS_URL=redis://localhost:6379
JWT_SECRET=codehaat-super-secret-jwt-key-change-in-production-2024
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

*Document Version: v1.3.0 | Last Updated: August 2026*
