# KodeDock API Reference

Welcome to the **KodeDock API Reference**. This document provides an overview of the primary RESTful endpoints and WebSocket channels available in the KodeDock platform.

For deeper architectural details, please refer to the [Backend Architecture Documentation](../docs/07-BACKEND.md).

---

## Base URL

All REST API endpoints are prefixed with `/api` and are served by the **Core Engine** (Rust) service running on port `4001`.

```http
https://api.kodedock.com/api
```
*(In local development, this translates to `http://localhost:4001/api`)*

---

## Authentication

KodeDock utilizes stateless **JSON Web Tokens (JWT)** for securing endpoints. When accessing protected resources, the token must be provided in the `Authorization` header as a Bearer token.

```http
Authorization: Bearer <jwt_token>
```

### Public Endpoints (No Auth Required)
Certain endpoints are open for public consumption to support storefront visibility:
- Product listings and public details
- Authentication workflows (`/api/auth/register`, `/api/auth/login`, etc.)
- Public review listings and aggregations

---

## REST Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `POST` | `/api/auth/register` | Register a new user or developer account. | No |
| `POST` | `/api/auth/login` | Authenticate and retrieve a JWT. | No |
| `POST` | `/api/auth/forgot-password` | Initiate a password reset request. | No |
| `POST` | `/api/auth/reset-password` | Reset password using a secure token. | No |
| `POST` | `/api/auth/logout` | Invalidate the current session. | Yes |
| `GET`  | `/api/auth/me` | Retrieve the authenticated user's profile. | Yes |
| `POST` | `/api/auth/change-password` | Update account password securely. | Yes |
| `DELETE`| `/api/auth/delete-account` | Permanently delete the user account. | Yes |
| `POST` | `/api/auth/github` | Handle GitHub OAuth callback and token exchange. | Yes |

### 👤 User Profiles (`/api/profile`)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `GET`  | `/api/profile/:id` | Retrieve public profile information. | No |
| `PUT`  | `/api/profile` | Update the authenticated user's profile. | Yes |

### 🛍️ Products (Public) (`/api/products`)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `GET`  | `/api/products` | Retrieve a paginated list of products with filters. | No |
| `GET`  | `/api/products/:id` | Retrieve detailed information for a specific product. | No |

### 🏪 Seller Studio (`/api/seller`)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `GET`  | `/api/seller/products` | Retrieve all products owned by the authenticated seller. | Yes |
| `POST` | `/api/seller/products` | Create a new product listing. | Yes |
| `PUT`  | `/api/seller/products/:id` | Update an existing product listing. | Yes |
| `DELETE`| `/api/seller/products/:id`| Soft delete or archive a product. | Yes |
| `GET`  | `/api/seller/stats` | Retrieve aggregated dashboard analytics and statistics. | Yes |
| `GET`  | `/api/seller/payout-account`| Retrieve configured bank/UPI payout details. | Yes |
| `POST` | `/api/seller/payout-account`| Add or update bank/UPI payout details. | Yes |
| `DELETE`| `/api/seller/payout-account`| Remove configured payout details. | Yes |

### 💳 Wallet & Finance (`/api/wallet`)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `GET`  | `/api/wallet` | Retrieve current wallet balance and escrow status. | Yes |
| `POST` | `/api/wallet/topup` | Initiate a Razorpay top-up order for the wallet. | Yes |
| `POST` | `/api/wallet/topup/verify`| Verify a completed Razorpay top-up transaction. | Yes |
| `GET`  | `/api/wallet/transactions`| Retrieve a paginated ledger of wallet transactions. | Yes |
| `POST` | `/api/wallet/withdraw` | Request a funds withdrawal to a configured payout account. | Yes |
| `POST` | `/api/wallet/release-escrow`| Manually release eligible funds from escrow holds. | Yes |

### 📦 Orders & Checkout (`/api/orders`)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `POST` | `/api/orders` | Create a new order using wallet balance or Razorpay. | Yes |
| `POST` | `/api/orders/verify` | Verify a completed Razorpay checkout payment. | Yes |
| `GET`  | `/api/orders` | Retrieve a paginated list of historical orders. | Yes |
| `GET`  | `/api/orders/:id` | Retrieve receipt and fulfillment details for an order. | Yes |
| `POST` | `/api/webhooks/razorpay` | Internal webhook handler for Razorpay events. | No |

### ⭐ Reviews (`/api/reviews`)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `GET`  | `/api/reviews/:productId` | Retrieve all verified reviews for a product. | No |
| `POST` | `/api/reviews` | Submit a new review (restricted to verified buyers). | Yes |

### 🔔 Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `GET`  | `/api/notifications` | Retrieve a paginated list of user notifications. | Yes |
| `PUT`  | `/api/notifications/:id/read`| Mark a specific notification as read. | Yes |

### ☁️ Infrastructure & Uploads (`/api/upload`)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `POST` | `/api/upload/presign` | Request a presigned URL for direct secure object storage uploads. | Yes |

---

## Internal Microservices

KodeDock operates an event-driven microservices architecture. The following services support the Core Engine:

### 🧠 AI Inference Service (Port 4002)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `GET`  | `/api/recommendations/:userId` | Fetch personalized product recommendations. | Internal |
| `POST` | `/api/search` | Execute vector-based semantic search queries. | Internal |
| `POST` | `/api/fraud/check` | Analyze transaction payloads for fraud signals. | Internal |
| `GET`  | `/api/analytics/dashboard` | Retrieve aggregated intelligence metrics for HQ. | Internal |

### ⚙️ Infrastructure Worker (Port 4003)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `GET`  | `/api/health` | Service health and liveness probe. | No |
| `GET`  | `/api/jobs/status` | Monitor background Redis job queues (emails, transfers). | Internal |
| `POST` | `/api/preview/build` | Trigger a new isolated preview environment build. | Internal |
| `POST` | `/api/preview/stop` | Terminate and clean up a preview container. | Internal |
| `GET`  | `/api/preview/:id/logs` | Stream logs from an active preview container. | Internal |

### ⚡ Real-Time Service (Port 4004)
| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `GET`  | `/ws` | Upgrade connection to WebSocket. | Yes* |
| `GET`  | `/health` | Service health and liveness probe. | No |
*(WebSocket auth requires transmitting the JWT during the initial connection handshake payload).*

---

## WebSocket Events (Real-Time Subscriptions)

Clients connected to `/ws` receive structured JSON payloads pushed instantly from the Rust backend via Redis Pub/Sub.

### Payload Structure
```json
{
  "type": "<channel_name>",
  "data": { ... }
}
```

### Supported Channels
- `notifications`: Push alerts for account activity, security events, and milestones.
- `order_updates`: Live checkout status updates and fulfillment tracking.
- `repo_transfer`: Real-time progress updates for GitHub repository transfers.

### Example: Incoming Sale Notification
```json
{
  "type": "notifications",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "type": "sale",
    "title": "New sale!",
    "message": "You made a sale of ₹2500!",
    "data": { "order_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479" },
    "is_read": false,
    "created_at": "2026-08-07T10:30:00Z"
  }
}
```

---

## Response Formatting

KodeDock adheres to a strict, predictable JSON response schema across all REST endpoints.

### ✅ Success Response
```json
{
  "success": true,
  "data": {
    "id": "123",
    "status": "active"
  },
  "message": "Operation completed successfully."
}
```

### ❌ Error Response
```json
{
  "success": false,
  "error": "Insufficient funds in wallet.",
  "data": null
}
```

### Standard HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource was successfully created.
- `400 Bad Request`: Invalid payload or business logic violation.
- `401 Unauthorized`: Missing, expired, or invalid JWT token.
- `403 Forbidden`: Authenticated, but insufficient privileges (e.g., non-admin accessing HQ).
- `404 Not Found`: The requested resource does not exist.
- `422 Unprocessable Entity`: Payload schema validation failed.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: An unexpected failure occurred on the server.

---

## Rate Limiting (DDoS Protection)

To protect infrastructure, strict rate limiting via `actix-governor` is enforced based on the client's IP address (derived via `X-Forwarded-For`).

| Endpoint Route | Request Limit | Time Window |
|:---------------|:-------------:|:------------|
| `/api/auth/*` (Login, Register, Reset) | 5 requests | 12 seconds |
| `/api/upload/presign` | 10 requests | 6 seconds |
| `/api/orders/verify` | 10 requests | 6 seconds |

---

## Database Architecture (PostgreSQL)

For operational context, the primary relational entities backing the API are structured as follows:

| Table Name | Description |
|:-----------|:------------|
| `users` | Core identity and authentication records. |
| `profiles` | Extended demographic and role-based data. |
| `categories` | Global taxonomy for products. |
| `products` | Core product catalog listings. |
| `wallets` | Ledger of user financial balances. |
| `wallet_transactions`| Immutable ledger of all deposits, withdrawals, and transfers. |
| `orders` | Transactional records for buyer purchases. |
| `escrow` | Temporary holding records for seller funds pending release. |
| `reviews` | Buyer sentiment and rating data. |
| `notifications` | Internal event alerts for users. |
| `disputes` | Conflict resolution cases between buyers and sellers. |
| `seller_payout_accounts`| Encrypted routing and account data for creator payouts. |

---

## Security & Best Practices

- **Zero-Trust Access:** Every mutable operation is explicitly validated against the user's role and ownership scopes via middleware.
- **Argon2id Hashing:** All passwords are mathematically secured using modern Argon2id hashing algorithms before persistence.
- **Stateless Tokens:** JWTs are issued with short expirations and are designed to be stored in `HttpOnly` secure cookies by client implementations.
- **SQLx Compilation:** All database queries in the Rust engine are verified at compile-time to prevent SQL injection vulnerabilities.
- **Signed Uploads:** The API never ingests large files directly. It issues securely signed, time-limited presigned URLs allowing direct-to-storage proxying.


## 👑 HQ (Admin) API

> [!IMPORTANT]
> All `/api/hq/*` routes require the caller to possess the `ADMIN` or `OWNER` role.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/api/hq/integrations` | Fetch all platform integrations (GitHub, Stripe, etc.) | Yes (`ADMIN`) |
| `PUT`  | `/api/hq/integrations` | Update an integration (triggers dynamic `.env` sync) | Yes (`ADMIN`) |
| `GET`  | `/api/hq/catalog/categories` | Retrieve all categories for catalog management. | Yes (`ADMIN`) |
| `POST` | `/api/hq/catalog/categories` | Create a new product category. | Yes (`ADMIN`) |
| `DELETE`| `/api/hq/catalog/categories/:id` | Soft-delete or archive a category. | Yes (`ADMIN`) |
| `GET`  | `/api/hq/finance/stats` | Retrieve global platform financial statistics. | Yes (`ADMIN`) |
| `GET`  | `/api/hq/finance/payouts` | List all pending seller payout requests. | Yes (`ADMIN`) |
| `POST` | `/api/hq/finance/payouts/:id/process` | Mark a payout as processed. | Yes (`ADMIN`) |
| `GET`  | `/api/hq/audit-logs` | Retrieve system-wide audit logs for security tracking. | Yes (`ADMIN`) |
| `GET`  | `/api/hq/users` | List platform users with advanced filtering. | Yes (`ADMIN`) |
| `PATCH`| `/api/hq/users/:id/status` | Suspend or activate a user account. | Yes (`ADMIN`) |
