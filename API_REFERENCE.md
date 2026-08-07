# CodeHaat API Reference

This document provides a quick reference to the main API endpoints in CodeHaat. For detailed information, please refer to [docs/07-BACKEND.md](../docs/07-BACKEND.md).

## Base URL
All API endpoints are prefixed with `/api` and are served by the Core Engine (Rust) service on port 4001.

## Authentication
Most endpoints require authentication via JWT token. The token should be sent in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Exceptions (public endpoints):
- Product listing and detail
- Authentication endpoints (`/api/auth/*`)
- Public review listing

## Endpoint Categories

### Auth Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register (user or developer) | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |
| POST | `/api/auth/logout` | Logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| DELETE | `/api/auth/delete-account` | Delete account | Yes |
| POST | `/api/auth/github` | GitHub OAuth | Yes |

### Profile Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile/:id` | Get profile | No |
| PUT | `/api/profile` | Update own profile | Yes |

### Product Endpoints (Public)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | List products (search/filter) | No |
| GET | `/api/products/:id` | Get product detail | No |

### Seller Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/seller/products` | List seller's products | Yes |
| POST | `/api/seller/products` | Create product | Yes |
| PUT | `/api/seller/products/:id` | Update product (owner only) | Yes |
| DELETE | `/api/seller/products/:id` | Delete product (owner only) | Yes |
| GET | `/api/seller/stats` | Seller dashboard stats | Yes |
| GET | `/api/seller/payout-account` | Get payout method (bank/UPI) | Yes |
| POST | `/api/seller/payout-account` | Add/update payout method | Yes |
| DELETE | `/api/seller/payout-account` | Remove payout method | Yes |

### Wallet Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/wallet` | Get wallet balance | Yes |
| POST | `/api/wallet/topup` | Create Razorpay top-up order | Yes |
| POST | `/api/wallet/topup/verify` | Verify top-up payment | Yes |
| GET | `/api/wallet/transactions` | Transaction history (paginated) | Yes |
| POST | `/api/wallet/withdraw` | Request withdrawal (developer only) | Yes |
| POST | `/api/wallet/release-escrow` | Release expired escrow funds | Yes |

### Order Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create order (wallet or Razorpay) | Yes |
| POST | `/api/orders/verify` | Verify Razorpay payment | Yes |
| GET | `/api/orders` | List orders (buyer or seller) | Yes |
| GET | `/api/orders/:id` | Get order detail | Yes |
| POST | `/api/webhooks/razorpay` | Razorpay webhook (signature-verified) | No |

### Review Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reviews/:productId` | List product reviews | No |
| POST | `/api/reviews` | Create review (verified purchase only) | Yes |

### Notification Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | List notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |

### Upload Endpoint
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload/presign` | Get presigned S3 upload URL | Yes |

## Service-Specific APIs

### AI Service (Port 4002)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/recommendations/:userId` | Get recommendations | No* |
| POST | `/api/search` | AI-powered search | No* |
| POST | `/api/fraud/check` | Check fraud signals | No* |
| GET | `/api/analytics/dashboard` | Admin analytics | No* |

*Note: May have separate authentication mechanism or be internal-only

### Infrastructure Worker (Port 4003)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | No |
| GET | `/api/jobs/status` | Job queue status | No* |
| POST | `/api/preview/build` | Trigger preview build | No* |
| POST | `/api/preview/stop` | Stop preview container | No* |
| GET | `/api/preview/:id/logs` | Get preview logs | No* |

*Note: May be internal-only or have different auth

### Real-time Service (Port 4004)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/ws` | WebSocket upgrade | Yes (via token in auth message) |
| GET | `/health` | Health check | No |

## WebSocket Events (Real-time Service)

Clients receive messages via WebSocket with the following structure:
```json
{
  "type": "<channel>",
  "data": { ... }
}
```

Channels:
- `notifications`: General notifications
- `order_updates`: Order status updates
- `repo_transfer`: Repository transfer completion

Example notification message:
```json
{
  "type": "notifications",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "type": "sale",
    "title": "New sale!",
    "message": "You made a sale of ₹2500!",
    "data": { "order_id": "uuid" },
    "is_read": false,
    "created_at": "2026-08-07T10:30:00Z"
  }
}
```

## Error Responses

All API endpoints return JSON responses with the following format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "data": null
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 422: Unprocessable Entity (validation failed)
- 429: Too Many Requests (rate limiting)
- 500: Internal Server Error
- 502: Bad Gateway (backend connection failed)
- 503: Service Unavailable (service not configured)

## Rate Limiting

Certain endpoints are rate-limited to prevent abuse:

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| `/api/auth/register, login, forgot/reset-password` | 5 requests | 12 seconds |
| `/api/upload/presign` | 10 requests | 6 seconds |
| `/api/orders/verify` | 10 requests | 6 seconds |

Rate limits are applied per client IP address (using X-Forwarded-For header).

## Database Tables Reference

For direct database access (not recommended for production use), the main tables are:

| Table | Purpose |
|-------|---------|
| `users` | Core authentication data |
| `profiles` | Extended user data, roles |
| `categories` | Product categories |
| `products` | Product listings |
| `wallets` | User wallet balances |
| `wallet_transactions` | Financial transaction log |
| `orders` | Purchase orders |
| `escrow` | Payment holding mechanism |
| `reviews` | Product reviews |
| `notifications` | In-app notifications |
| `disputes` | Order dispute resolution |
| `seller_payout_accounts` | Seller banking/payout info |

## Development Notes

### Making API Changes
1. Add/update endpoint in `services/core-engine/src/main.rs`
2. Implement handler function in appropriate file under `services/core-engine/src/handlers/`
3. Update models in `services/core-engine/src/models/` if needed
4. Add any necessary database queries
5. Test thoroughly with both valid and invalid inputs

### Versioning
Currently, the API does not use explicit versioning. Backward compatibility is maintained within reason. Breaking changes are communicated via internal documentation.

### Security Considerations
- All sensitive operations require authentication
- Passwords are hashed with Argon2
- JWT tokens are stored in HttpOnly cookies (never accessible to JavaScript)
- SQL injection is prevented by SQLx compile-time checking
- Rate limiting protects against abuse
- CORS is strictly controlled
- File uploads use presigned URLs to prevent direct server handling