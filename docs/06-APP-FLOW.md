# CodeHaat — Application Flow Diagrams

> Step-by-step user flows for every feature in the application.

---

## Table of Contents
1. [Buyer Flows](#1-buyer-flows)
2. [Seller Flows](#2-seller-flows)
3. [Admin Flows](#3-admin-flows)
4. [System Flows](#4-system-flows)
5. [Company & Legal Page Flows](#5-company--legal-page-flows)
6. [State Diagrams](#6-state-diagrams)

---

## 1. Buyer Flows

### 1.1 Registration Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend as Backend (Rust)
    participant Email as Email Service
    
    User->>Frontend: Visits /register
    User->>Frontend: Fills Name, Email, Password & Clicks "Create account"
    Frontend->>Frontend: Validates input
    Frontend->>Backend: POST /api/auth/register (role: "user")
    Backend->>Email: Send verification email
    Frontend-->>User: Shows "Check your email" screen
    User->>Email: Clicks email link
    Email->>Backend: /api/auth/callback (exchanges code)
    Backend-->>Frontend: Sets session
    Frontend->>Frontend: Middleware checks role (redirects to /browse)
    Frontend-->>User: Lands on Browse page (buyer home)
```

### 1.2 Login Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend as Backend (Rust)
    
    User->>Frontend: Visits /login
    User->>Frontend: Enters Email + Password & Clicks "Sign in"
    Frontend->>Backend: POST /api/auth/login
    Backend-->>Frontend: Returns session & user_metadata
    Frontend->>Frontend: Checks user_metadata.role
    alt role: "user"
        Frontend->>Frontend: Redirect to /browse
    else role: "developer"
        Frontend->>Frontend: Redirect to /seller
    end
    Frontend-->>User: Lands on appropriate page
```

### 1.3 Browse & Search Flow

```mermaid
flowchart TD
    A([User lands on /browse]) --> B[Sees: Welcome banner, Categories, Product grid]
    B --> C{User Actions}
    C -->|Filter| D[Click category tabs]
    C -->|Search| E[Type in search bar]
    C -->|View| F[Click product card to view details]
    C -->|Paginate| G[Click "Load More"]
    D --> B
    E --> B
    G --> B
    F --> H([Lands on /products/id])
```

### 1.4 Purchase Flow (Razorpay)

```mermaid
sequenceDiagram
    actor Buyer
    participant Frontend
    participant Razorpay
    participant Rust as Rust Core
    participant Redis
    participant GoWorker as Go Worker
    participant Github as GitHub API
    participant NodeRT as Node.js Realtime

    Buyer->>Frontend: Clicks "Buy Now" on product page
    Frontend->>Razorpay: Initiates checkout
    Buyer->>Razorpay: Completes payment (UPI/Card/Netbanking)
    Razorpay->>Rust: Webhook POST /api/webhooks/razorpay
    Rust->>Rust: Verifies signature & status
    Rust->>Rust: Creates escrow & order records
    Rust->>Redis: Publishes "repo_transfer_needed"
    Redis->>GoWorker: Picks up job
    GoWorker->>Github: Clones seller's repo
    GoWorker->>Github: Creates private repo for buyer
    GoWorker->>Github: Pushes code to buyer's repo
    GoWorker->>Rust: Updates order status "completed"
    GoWorker->>NodeRT: Sends "repo.transferred" event
    NodeRT->>Buyer: WebSocket notification "Success!"
    Frontend-->>Buyer: Order appears in history
```

### 1.5 Order History Flow

```mermaid
flowchart TD
    A([User clicks "My Purchases"]) --> B[Lands on /dashboard]
    B --> C[Sees list of past orders]
    C --> D[Shows: Name, Date, Amount, GitHub Link]
    D --> E[User clicks GitHub link]
    E --> F([Opens repo in GitHub])
```

---

## 2. Seller Flows

### 2.1 Seller Registration Flow

```mermaid
sequenceDiagram
    actor Seller
    participant Frontend
    participant Backend as Backend (Rust)
    participant Email
    
    Seller->>Frontend: Visits /developer (Sees marketing page)
    Seller->>Frontend: Clicks "Start Selling"
    Frontend-->>Seller: Lands on /developer-register
    Seller->>Frontend: Fills Name, Email, Password & Submits
    Frontend->>Backend: POST /api/auth/register (role: "developer")
    Backend->>Email: Sends verification email
    Seller->>Email: Clicks email link
    Email->>Backend: /api/auth/callback (exchanges code)
    Backend-->>Frontend: Sets session
    Frontend->>Frontend: Middleware checks role
    Frontend-->>Seller: Redirects to /seller (Dashboard)
```

### 2.2 Product Listing Flow

```mermaid
sequenceDiagram
    actor Seller
    participant Frontend
    participant Backend as Rust Core
    participant DB as Database
    
    Seller->>Frontend: Clicks "List Product" (Lands on /seller/products/new)
    Seller->>Frontend: Fills form (Title, Price, Repo URL, etc.)
    Seller->>Frontend: Clicks "List Product"
    Frontend->>Backend: POST /api/seller/products (with JWT)
    Backend->>Backend: Verifies JWT & Developer Role
    Backend->>Backend: Validates input
    Backend->>DB: Creates product record
    DB-->>Backend: Success
    Backend-->>Frontend: Returns product data
    Frontend-->>Seller: Product appears in product list
    Frontend->>Frontend: Product becomes visible on /browse for buyers
```

### 2.3 Product Management Flow

```mermaid
flowchart TD
    A([Seller clicks "Products"]) --> B[Lands on /seller/products]
    B --> C[Sees list of products with stats]
    C --> D{Actions}
    D -->|Edit| E[Update product details]
    D -->|Status| F[Toggle active/paused]
    D -->|Delete| G[Remove product]
    E --> H([Changes saved])
    F --> H
    G --> H
```

### 2.4 Earnings & Payout Flow

```mermaid
sequenceDiagram
    actor Seller
    participant Frontend
    participant Backend as Rust Core
    participant Admin
    
    Seller->>Frontend: Clicks "Earnings"
    Frontend-->>Seller: Shows revenue, balance, tx history
    Seller->>Frontend: Requests withdrawal (balance > ₹500)
    Frontend->>Backend: POST /api/wallet/withdraw
    Backend->>Backend: Verifies payout account exists
    Backend->>Backend: Creates payout request & deducts wallet
    Backend-->>Admin: Alerts admin/automated system
    Admin->>Admin: Processes payout
    Admin->>Backend: Updates status
    Backend-->>Seller: Withdrawal complete notification
```

---

## 3. Admin Flows

### 3.1 Admin Login Flow

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend
    participant Backend
    
    Admin->>Frontend: Visits /login
    Admin->>Frontend: Enters admin credentials
    Frontend->>Backend: POST /api/auth/login
    Backend-->>Frontend: Returns session
    Frontend->>Frontend: Checks role: "admin"
    Frontend->>Frontend: Redirects to /admin
    Frontend-->>Admin: Shows dashboard (Metrics, Disputes, Activity)
```

### 3.2 Product Moderation Flow

```mermaid
flowchart TD
    A([Admin clicks "Products"]) --> B[Sees list of all products with filters]
    B --> C{Actions}
    C -->|Approve| D[Mark draft as active]
    C -->|Pause| E[Suspend suspicious products]
    C -->|Delete| F[Remove violating products]
    D --> G([Database Updated])
    E --> G
    F --> G
```

### 3.3 Dispute Resolution Flow

```mermaid
sequenceDiagram
    actor Admin
    participant DB
    participant Parties as Buyer & Seller
    
    Admin->>DB: Views open disputes (/admin/disputes)
    DB-->>Admin: Shows order details, complaint, response
    alt Refund Buyer
        Admin->>DB: Release escrow to Buyer
    else Release to Seller
        Admin->>DB: Release escrow to Seller
    else Request Info
        Admin->>Parties: Asks for more details
    end
    DB->>Parties: Both parties notified of decision
```

---

## 4. System Flows

### 4.1 Wallet Top-Up Flow (Razorpay)

```mermaid
sequenceDiagram
    actor Buyer
    participant Frontend
    participant Backend as Rust Core
    participant Razorpay
    
    Buyer->>Frontend: Chooses to add funds (e.g. ₹100)
    Frontend->>Backend: POST /api/wallet/topup { amount: 10000 }
    Backend-->>Frontend: Returns Razorpay order ID
    Frontend->>Razorpay: Opens checkout widget
    Buyer->>Razorpay: Completes payment
    Razorpay->>Backend: Webhook POST /api/webhooks/razorpay
    Backend->>Backend: Verifies signature
    Backend->>Backend: Adds 10000 paise to wallet
    Backend-->>Buyer: Wallet balance updated
```

### 4.2 GitHub Repo Transfer Flow

```mermaid
flowchart TD
    A[Order Completed] --> B[Job queued in Redis]
    B --> C[Go Worker picks job]
    C --> D[Authenticates with GitHub API]
    D --> E[Bare-clones seller's repo]
    E --> F[Creates new private repo for buyer]
    F --> G[Pushes branches and tags]
    G --> H[Adds LICENSE if missing]
    H --> I[Updates order.github_repo_url]
    I --> J[Fires 'repo.transferred' event]
    J --> K[Node.js sends WebSocket]
    K --> L([Buyer notified])
```

### 4.3 Escrow Flow

```mermaid
flowchart TD
    A[Payment Received] --> B[Escrow Created 'held']
    B --> C[7-Day Dispute Window]
    C -->|No Dispute| D[Auto-release]
    C -->|Dispute Raised| E[Admin Review]
    D --> F[2.5% to Platform]
    D --> G[97.5% to Seller Wallet]
    E -->|Refund Buyer| H[Amount returned to Buyer]
    E -->|Release to Seller| G
```

### 4.4 Notification Flow

```mermaid
sequenceDiagram
    participant Event as System Event
    participant Backend
    participant Redis
    participant NodeRT as Node.js Realtime
    actor Client
    
    Event->>Backend: Trigger (order, dispute, etc.)
    Backend->>Backend: Writes to notifications table
    Backend->>Redis: Publishes to Pub/Sub
    Redis->>NodeRT: Subscribes and receives event
    NodeRT->>Client: Sends WebSocket message
    Client->>Client: Shows toast/popup
    Client->>Backend: (Optional) Marks as read
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

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> completed
    completed --> disputed
    completed --> [*]
    disputed --> refunded
    disputed --> resolved
    refunded --> [*]
    resolved --> [*]
    pending --> cancelled
    cancelled --> [*]
```

### Product Status

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> active
    active --> paused
    paused --> active
    active --> archived
    paused --> archived
    draft --> archived
    archived --> [*]
```

### Wallet Transaction Types

```mermaid
stateDiagram-v2
    [*] --> topup
    [*] --> sale
    [*] --> refund
    [*] --> adjustment
    topup --> purchase
    sale --> withdrawal
    purchase --> [*]
    withdrawal --> [*]
```

---

*Document Version: v1.3.0 | Last Updated: August 2026*
