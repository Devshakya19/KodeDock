# CodeHaat — Application Flow Diagrams

> Step-by-step user flows for every feature in the application.

---

## 1. Buyer Flows

### 1.1 Registration Flow

```
User visits /register
  ↓
Fills: Full Name, Email, Password
  ↓
Clicks "Create account"
  ↓
Frontend validates input
  ↓
POST /api/auth/register with role: "user"
  ↓
Backend sends verification email
  ↓
User sees "Check your email" screen
  ↓
User clicks email link
  ↓
/api/auth/callback exchanges code for session
  ↓
Middleware checks role → redirects to /browse
  ↓
User lands on Browse page (buyer home)
```

### 1.2 Login Flow

```
User visits /login
  ↓
Enters Email + Password
  ↓
Clicks "Sign in"
  ↓
POST /api/auth/login
  ↓
Frontend checks user_metadata.role
  ↓
├── role: "user" → redirect to /browse
└── role: "developer" → redirect to /seller
  ↓
User lands on appropriate page
```

### 1.3 Browse & Search Flow

```
User lands on /browse
  ↓
Sees: Welcome banner + Category tabs + Product grid
  ↓
Can: Click category tabs to filter
  ↓
Can: Type in search bar
  ↓
Can: Click product card to view details
  ↓
Can: Click "Load More" for pagination
```

### 1.4 Purchase Flow (Paper Money)

```
User clicks product card
  ↓
Lands on /products/[id] (product detail page)
  ↓
Sees: Title, description, price, preview, reviews
  ↓
Clicks "Buy Now"
  ↓
Frontend sends POST /api/orders with JWT
  ↓
Rust Core verifies JWT
  ↓
Rust Core checks buyer's wallet balance
  ↓
├── Insufficient balance → Show "Top up wallet" prompt
└── Sufficient balance → Continue
  ↓
Rust Core deducts amount from buyer's wallet
  ↓
Rust Core creates escrow record
  ↓
Rust Core creates order record
  ↓
Rust Core publishes "repo_transfer_needed" to Redis
  ↓
Go Worker picks up job
  ↓
Go Worker clones seller's repo
  ↓
Go Worker creates private repo in buyer's GitHub
  ↓
Go Worker pushes code to buyer's repo
  ↓
Go Worker updates order status to "completed"
  ↓
Go Worker sends event to Node.js Realtime
  ↓
Node.js sends WebSocket notification to buyer
  ↓
Buyer sees: "Success! Code delivered to your GitHub!"
  ↓
Order appears in buyer's order history
```

### 1.5 Order History Flow

```
User clicks "My Purchases" in navbar
  ↓
Lands on /dashboard (buyer dashboard)
  ↓
Sees: List of past orders
  ↓
Each order shows: Product name, date, amount, GitHub link
  ↓
User can click GitHub link to open repo
```

---

## 2. Seller Flows

### 2.1 Seller Registration Flow

```
User visits /developer
  ↓
Sees seller marketing page (benefits, commission, CTA)
  ↓
Clicks "Start Selling"
  ↓
Lands on /developer-register
  ↓
Fills: Full Name, Email, Password
  ↓
Clicks "Create seller account"
  ↓
POST /api/auth/register with role: "developer"
  ↓
Backend sends verification email
  ↓
User clicks email link
  ↓
/api/auth/callback exchanges code for session
  ↓
Middleware checks role → redirects to /seller
  ↓
User lands on Seller Dashboard
```

### 2.2 Product Listing Flow

```
Seller clicks "List Product" on dashboard
  ↓
Lands on /seller/products/new
  ↓
Fills form:
  ├── Title
  ├── Description
  ├── Price (₹)
  ├── Category (dropdown)
  ├── GitHub Repository URL
  └── Tags (comma separated)
  ↓
Clicks "List Product"
  ↓
Frontend sends POST /api/seller/products with JWT
  ↓
Rust Core verifies JWT + developer role
  ↓
Rust Core validates input
  ↓
Rust Core creates product record in database
  ↓
Product appears in seller's product list
  ↓
Product becomes visible on /browse for buyers
```

### 2.3 Product Management Flow

```
Seller clicks "Products" in navbar
  ↓
Lands on /seller/products
  ↓
Sees: List of all their products
  ↓
Each product shows: Title, price, status, sales count
  ↓
Can: Click to edit product
  ↓
Can: Toggle status (active/paused)
  ↓
Can: Delete product
```

### 2.4 Earnings Flow

```
Seller clicks "Earnings" in navbar
  ↓
Lands on /seller/earnings
  ↓
Sees: Total revenue, total sales, pending balance
  ↓
Sees: Transaction history (recent sales)
  ↓
Can: Request withdrawal (when balance > ₹500)
  ↓
Withdrawal processed in 7-day cycle
```

---

## 3. Admin Flows

### 3.1 Admin Login Flow

```
Admin visits /login
  ↓
Enters admin credentials
  ↓
POST /api/auth/login
  ↓
Frontend checks role: "admin"
  ↓
Redirects to /admin
  ↓
Admin sees dashboard with:
  ├── Total users, products, orders
  ├── Revenue metrics
  ├── Recent activity
  └── Pending disputes
```

### 3.2 Product Moderation Flow

```
Admin clicks "Products" in admin nav
  ↓
Sees: List of all products with status filters
  ↓
Can: Approve draft products
  ↓
Can: Pause suspicious products
  ↓
Can: Delete violating products
```

### 3.3 Dispute Resolution Flow

```
Admin clicks "Disputes" in admin nav
  ↓
Sees: List of open disputes
  ↓
Each dispute shows: Order details, buyer complaint, seller response
  ↓
Admin can:
  ├── Refund buyer (release escrow)
  ├── Release to seller (release escrow)
  └── Request more information
  ↓
Decision recorded in database
  ↓
Both parties notified
```

---

## 4. System Flows

### 4.1 Payment Flow (Paper Money)

```
Buyer tops up wallet:
  POST /api/wallet/topup { amount: 10000 }
  ↓
Rust Core adds ₹100 to buyer's wallet
  ↓
Wallet balance updated
  ↓
Transaction recorded in wallet_transactions

Buyer purchases product:
  POST /api/orders { productId: "xxx" }
  ↓
Rust Core checks balance ≥ price
  ↓
Deducts price from buyer's wallet
  ↓
Creates escrow record (amount held)
  ↓
Creates order record
  ↓
After 48h (no dispute):
  ├── 2.5% → Platform wallet
  └── 97.5% → Seller wallet
```

### 4.2 GitHub Repo Transfer Flow

```
Order completed → Job queued in Redis
  ↓
Go Worker picks job
  ↓
Go Worker authenticates with GitHub API
  ↓
Go Worker bare-clones seller's repo (full history)
  ↓
Go Worker creates new private repo in buyer's account
  ↓
Go Worker pushes all branches and tags
  ↓
Go Worker adds LICENSE file if missing
  ↓
Go Worker updates order.github_repo_url
  ↓
Go Worker fires "repo.transferred" event
  ↓
Node.js sends WebSocket to buyer's browser
  ↓
Buyer sees notification: "Code delivered!"
```

### 4.3 Escrow Flow

```
Payment received → Escrow created (status: held)
  ↓
48-hour dispute window starts
  ↓
├── No dispute → Auto-release
│   ├── 2.5% to platform
│   └── 97.5% to seller wallet
│
└── Dispute raised → Admin review
    ├── Refund buyer → Amount returned to buyer wallet
    └── Release to seller → Amount sent to seller wallet
```

### 4.4 Notification Flow

```
Event occurs (order, dispute, etc.)
  ↓
Backend writes to notifications table
  ↓
Backend publishes to Redis pub/sub
  ↓
Node.js Realtime subscribes to Redis
  ↓
Node.js sends WebSocket to connected clients
  ↓
Client receives notification
  ↓
Client shows toast/popup
  ↓
Client marks as read (optional)
```

---

## 5. Company & Legal Page Flows

### Company Pages

| Route | Content | Purpose |
|-------|---------|---------|
| `/about` | Company story, mission, values | About CodeHaat |
| `/blog` | Blog posts with categories | Content marketing |
| `/careers` | Job openings, company perks | Recruitment |
| `/contact` | Contact info + form | Customer support |
| `/press` | Brand assets, key facts | Media relations |

### Legal Pages

| Route | Content | Purpose |
|-------|---------|---------|
| `/privacy` | Privacy policy | Data protection compliance |
| `/terms` | Terms of service | Platform rules |
| `/refund` | Refund policy | Purchase protection |
| `/license` | License agreement | Code usage rights |
| `/cookies` | Cookie policy | Cookie compliance |

All Company and Legal pages use the shared `StaticPageLayout` component for consistent header/footer.

---

## 6. State Diagrams

### Order Status

```
pending → completed → (disputed → refunded OR resolved)
    ↓
  cancelled
```

### Product Status

```
draft → active → paused
              ↓
           archived
```

### Wallet Transaction Types

```
topup → purchase → sale → withdrawal
                    ↓
                  refund
```

---

*Document Version: 1.0 | Last Updated: July 2026*
