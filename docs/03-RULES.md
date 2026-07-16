# CodeHaat — Rules & Conventions

> Consistency is key. Every developer should follow these rules to keep the codebase professional.

---

## 1. Folder Structure Rules

### Frontend (Next.js)

```
src/
├── features/           # Self-contained feature modules
│   ├── <feature>/
│   │   ├── components/ # Feature-specific components
│   │   ├── pages/      # Feature pages (multi-page features)
│   │   ├── page.tsx    # Main page (single-page features)
│   │   └── index.ts    # Public exports
│
├── shared/             # Cross-cutting concerns
│   ├── components/     # Reusable UI components
│   ├── ui/             # shadcn/ui primitives
│   ├── lib/            # Utilities, configs, services
│   └── hooks/          # Custom React hooks
│
├── app/                # Next.js App Router (thin wrappers only)
└── middleware.ts        # Route protection
```

**Rule:** Never put feature-specific code in `shared/`. Never put shared code in `features/`.

### Backend (Per Service)

```
src/
├── handlers/          # Request handlers / controllers
├── models/            # Data models / schemas
├── services/          # Business logic
├── middleware/         # Auth, validation, rate limiting
├── utils/             # Helper functions
└── main.rs/go/app.py  # Entry point
```

---

## 2. Naming Conventions

### Files

| Type | Convention | Example |
|------|-----------|---------|
| React Components | `kebab-case.tsx` | `product-card.tsx` |
| Utilities | `kebab-case.ts` | `use-mobile.ts` |
| Page files | `page.tsx` | `app/browse/page.tsx` |
| Layout files | `layout.tsx` | `app/seller/layout.tsx` |
| API routes | `route.ts` | `app/api/auth/callback/route.ts` |
| Index files | `index.ts` | `features/browse/index.ts` |

### Components

| Type | Convention | Example |
|------|-----------|---------|
| Component files | `kebab-case` | `product-card.tsx` |
| Component names | `PascalCase` | `ProductCard` |
| Props interfaces | `PascalCase + Props` | `ProductCardProps` |
| Default exports | Named function | `export function ProductCard()` |

### Variables & Functions

| Type | Convention | Example |
|------|-----------|---------|
| Variables | `camelCase` | `userName`, `isSelected` |
| Functions | `camelCase` | `getUserRole()`, `formatPrice()` |
| Constants | `UPPER_SNAKE_CASE` | `ROLES`, `API_URL` |
| Types/Interfaces | `PascalCase` | `UserRole`, `ProductCardProps` |

### Routes

| Type | Convention | Example |
|------|-----------|---------|
| Pages | `kebab-case` | `/seller/products/new` |
| API routes | `kebab-case` | `/api/auth/callback` |
| Dynamic routes | `[param]` | `/products/[id]` |

---

## 3. Code Style Rules

### TypeScript

```typescript
// ✅ DO: Use explicit types for function parameters
function formatPrice(price: number): string {
  return `₹${price}`;
}

// ✅ DO: Use interface for props
interface ProductCardProps {
  title: string;
  price: number;
}

// ❌ DON'T: Use `any`
const data: any = {};

// ❌ DON'T: Use `var`
var x = 1;
```

### React

```typescript
// ✅ DO: Use functional components
export function ProductCard({ title }: ProductCardProps) {
  return <div>{title}</div>;
}

// ✅ DO: Use proper imports
import { Button } from "@/shared/ui/button";

// ❌ DON'T: Use class components
class ProductCard extends React.Component {}
```

### CSS/Tailwind

```tsx
// ✅ DO: Use Tailwind classes
<div className="flex items-center gap-4">

// ✅ DO: Use cn() for conditional classes
className={cn("base-class", isActive && "active-class")}

// ❌ DON'T: Use inline styles
<div style={{ display: "flex" }}>
```

---

## 4. Git Rules

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<name>` | `feature/product-listing` |
| Bug fix | `fix/<name>` | `fix/login-redirect` |
| Hotfix | `hotfix/<name>` | `hotfix/payment-crash` |
| Refactor | `refactor/<name>` | `refactor/auth-flow` |

### Commit Messages

```
<type>: <description>

Types:
  feat:     New feature
  fix:      Bug fix
  docs:     Documentation
  style:    Code style (formatting, no logic change)
  refactor: Code refactoring
  test:     Adding tests
  chore:    Build/config changes

Examples:
  feat: add product listing page
  fix: redirect after login for sellers
  docs: update architecture document
```

### Pull Requests

- Title: Clear description of changes
- Description: What changed and why
- Link to issue if applicable
- Self-review before requesting review

---

## 5. API Design Rules

### REST Endpoints

```
GET    /api/products          # List products
GET    /api/products/:id      # Get product
POST   /api/products          # Create product
PUT    /api/products/:id      # Update product
DELETE /api/products/:id      # Delete product

GET    /api/orders            # List orders
POST   /api/orders            # Create order
GET    /api/orders/:id        # Get order

GET    /api/wallet            # Get wallet balance
POST   /api/wallet/topup      # Top up wallet
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Product created successfully"
}

{
  "success": false,
  "error": "Insufficient balance",
  "code": "INSUFFICIENT_BALANCE"
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 6. Database Rules

### Table Naming

- Plural: `products`, `orders`, `users`
- Snake case: `wallet_transactions`, `order_items`

### Column Naming

- Snake case: `created_at`, `user_id`, `price_paise`
- Primary keys: `id` (UUID)
- Foreign keys: `<table>_id` (e.g., `user_id`, `product_id`)

### Monetary Values

- Always store as integers in paise (not decimals)
- `price_paise: 49900` = ₹499.00
- Never use floating point for money

---

## 7. Security Rules

1. **Never expose** service-role keys to the frontend
2. **Always verify** JWT tokens on every API request
3. **Validate** all inputs on the backend
4. **Validate** all inputs with Zod on the backend
5. **Rate limit** all API endpoints
6. **Sanitize** user inputs to prevent XSS
7. **Use HTTPS** everywhere in production
8. **Encrypt** sensitive data (GitHub tokens, API keys)

---

## 8. Environment Variables

### Rule: Never commit .env files

```gitignore
.env
.env.local
.env.*.local
```

### Rule: Document all env vars

```env
# .env.example (committed to git)
NEXT_PUBLIC_API_URL=http://localhost:4001
```

---

*Document Version: 1.0 | Last Updated: July 2026*
