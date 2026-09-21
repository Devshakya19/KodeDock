# Kodedock - Financial Model, Unit Economics & Cost Analysis (INR & 5% Disruption Model)

| **Document Version** | 2.0.0 (INR Disruption Update) |
| :--- | :--- |
| **Status** | Approved Financial Model |
| **Last Updated** | 2026-09-21 |
| **Target Audience** | Founders, Finance, Operations, Tech Leads |

---

## 1. Executive Financial Summary

Kodedock operates on a **high-volume, developer-first disruptive marketplace model** native to the Indian tech ecosystem with global reach. 

### The Core Disruption:
- **Primary Currency**: Indian Rupee (**INR - ₹**) with native **UPI (GPay / PhonePe / Paytm)** priority checkout.
- **Flat 5% Total Cut**: Kodedock charges a **total of only 5%** (including payment gateway charges and platform fees combined).
- **95% Payout to Developers**: Developers retain an unprecedented **95% of gross revenue** deposited directly into their Indian bank accounts.

By leveraging **self-hosted Better Auth** ($0 licensing fee) and **Cloudflare R2** ($0 egress / bandwidth fee), Kodedock maintains positive unit economics even with this hyper-competitive 5% fee structure.

---

## 2. Unit Economics: The ₹1,000 Transaction Breakdown

Below is the unit economics model for an average ₹1,000 digital asset sale (e.g., a Full-Stack Starter, UI Component Pack, or Backend Service):

```
                     BUYER PAYS: ₹1,000.00 (via UPI / Card / NetBanking)
                                           │
                 ┌─────────────────────────┴─────────────────────────┐
                 ▼                                                   ▼
       DEVELOPER PAYOUT: ₹950.00                           TOTAL DEDUCTION: ₹50.00
       (95% Direct Bank Transfer)                          (5.0% Total Platform & PG Cut)
                                                                     │
                                           ┌─────────────────────────┴─────────────────────────┐
                                           ▼                                                   ▼
                                Payment Gateway (Razorpay/Cashfree)                     KODEDOCK NET MARGIN
                                UPI/Card Fee (~1.8% - 2.0%)                             (Pure Platform Margin)
                                        ~₹18.00 - ₹20.00                                  ~₹30.00 - ₹32.00
                                                                                         (3.0% - 3.2% of GMV)
```

### 2.1 Per-Transaction Financial Line Items (₹1,000 Sale)

| Component | Amount | Percentage | Borne By | Explanation |
| :--- | :--- | :--- | :--- | :--- |
| **Gross Merchandise Value (GMV)** | **₹1,000.00** | 100.0% | Buyer | Total product list price. |
| **Developer Payout** | **₹950.00** | **95.0%** | Kodedock | Dispatched directly to creator's bank account via IMPS/NEFT/UPI. |
| **Total Deduction (All-Inclusive)**| **₹50.00** | **5.0%** | Creator | Total deduction covering gateway and platform combined. |
| **Payment Gateway Fee (UPI/Card)**| ~₹18.00 - ₹20.00 | 1.8% - 2.0% | Platform | Razorpay / Cashfree blended MDR (UPI is ~1.2% - 1.5%, Cards ~2%). |
| **Direct Tech Delivery Cost** | ~₹0.50 | 0.05% | Platform | Cloudflare R2 download, presigned URL creation, email alert. |
| **Kodedock Net Profit Margin** | **₹29.50 - ₹31.50** | **~3.0% of GMV** | **Kodedock** | **Net operational profit per ₹1,000 transaction.** |

---

## 3. Financial Guardrails (Ensuring Kodedock Never Runs at a Loss)

To maintain profitability with a 5% total take rate, Kodedock implements three strict operational guardrails:

### Guardrail 1: Minimum Product Listing Price (₹299 Floor)
- **Why**: Micro-transactions below ₹150 risk being eaten by minimum gateway flat fees (e.g. ₹2-₹3 base charge + GST).
- **Rule**: No product can be listed for less than **₹299**. 
- On ₹299: 5% = ₹14.95. Payment gateway takes ~₹5.50. Kodedock retains ~₹9.45 net profit.

### Guardrail 2: Priority UPI Checkout
- **Why**: Credit cards in India carry a 2% + 18% GST (= 2.36%) MDR, whereas UPI QR and UPI Intent carry lower MDR rates (typically 0.8% - 1.2% for commercial volume).
- **Rule**: Default checkout renders **UPI QR Code & Intent** first. Over 80% of Indian developer transactions occur via UPI, maximizing Kodedock's net margin.

### Guardrail 3: Zero Egress Storage (Cloudflare R2)
- AWS S3 charges $0.09 (~₹7.50) per GB of download traffic. If buyers download a 500MB zip file 5 times, AWS S3 would cost ~₹18 (eating the entire margin!).
- **Cloudflare R2 charges ₹0 bandwidth / egress fees**. Downloads are 100% free of bandwidth tax.

---

## 4. Infrastructure & Operational Costs (OpEx in INR)

Because Kodedock is built with high-efficiency technologies, monthly fixed server costs are remarkably low:

| Expense Category | Service Provider | Monthly Cost (INR) | Kyon Aayega? (Purpose) | Optimization Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **API & Web Compute** | Hetzner VPS / Cloud VPS | **₹2,500 – ₹4,500 / mo** | Node.js backend, SSR store and portal apps. | Docker Compose multi-container stack running on dedicated CPU VPS. |
| **Database & Cache** | Managed PostgreSQL + Redis | **₹2,000 – ₹3,500 / mo** | Relational user metadata, order history, BullMQ task queues. | Indexed queries, connection pooling (PgBouncer). |
| **Asset Storage (Code Zips)** | Cloudflare R2 | **₹500 – ₹1,200 / mo** | Encrypted storage of creator codebases and previews. | Zero egress fees; pay only for actual stored disk space (~₹1.20 per GB/mo). |
| **Authentication Engine** | **Better Auth** (Self-Hosted) | **₹0 / mo** | JWT/OAuth sessions, RBAC, user management. | Eliminates Clerk/Auth0 SaaS fee (which costs ₹4 per active user). |
| **Transactional Email** | Resend / Postmark | **₹1,200 – ₹1,800 / mo** | Invoices, login OTPs, order download receipts. | Free tier covers first 3,000 emails/month. |
| **Domain & Edge Security** | Cloudflare Pro / DNS | **₹0 – ₹1,600 / mo** | DDoS shield, SSL, edge caching for landing pages. | Cloudflare handles CDN and security on edge. |
| **Total Base Monthly Tech OpEx** | — | **₹6,200 – ₹12,600 / mo** | **Extremely lean fixed cost.** | **Only ~25 to 35 sales of ₹1,000 per month completely pays for 100% of platform overhead!** |

---

## 5. Taxes, Compliance & Legal Deductions

### 5.1 GST (Goods & Services Tax)
1. **Buyer Side (Forward Charge)**:
   - Digital code templates and software fall under SAC code **997331** (Licensing services for the right to use computer software).
   - In India, 18% GST is added to the checkout invoice for domestic buyers where applicable.
   - For example: ₹1,000 product + 18% GST = ₹1,180 total paid by buyer.
   - The ₹180 GST is collected and remitted to the government.
   - **Impact on Developer**: **Zero.** Developer still receives their full **₹950 (95%)**.
   - **Impact on Kodedock**: **Zero.** Kodedock's 5% cut is calculated on the pre-tax base price.

2. **Seller Income & Invoicing**:
   - Developers receive an automated monthly payout summary and invoice in `apps/studio` detailing GMV, platform deduction (5%), and net payout for their income tax filings.

### 5.2 Payout Cycle & Rolling Reserve
- **Payout Schedule**: Every Tuesday / Friday via automated batch payout (UPI or direct IMPS bank transfer).
- **Escrow Buffer**: 3-day verification window post-download to prevent fraudulent chargebacks.

---

## 6. Competitor Comparison: The ₹1,000 Sale Reality

How much does an Indian creator actually take home when selling a ₹1,000 template?

```
  [ Envato / ThemeForest ] ──> Developer keeps only ₹500 - ₹620 (Loses 38% - 50% + high foreign exchange fees)
  [ Gumroad ]              ──> Developer keeps ~₹860 (10% + $0.30 fixed fee + expensive foreign payout withdrawal)
  [ Lemon Squeezy ]        ──> Developer keeps ~₹900 (5% + $0.50 [₹42 fixed fee] + currency conversion loss)
  [ KODEDOCK ]             ──> Developer keeps ₹950.00 FLAT (Direct UPI/Bank transfer, ₹0 hidden fees, modern dev tooling)
```

### Competitor Breakdown Matrix:

| Platform | Creator Receives on ₹1,000 Sale | Platform Cut + Fees | Payout Method to India | Why Indian Developers Choose Kodedock |
| :--- | :--- | :--- | :--- | :--- |
| **ThemeForest / Envato** | **₹500 – ₹625** | 37.5% – 50% + Buyer Fee | Payoneer / Wire (High forex loss) | Kodedock gives **₹950** directly into their Indian bank account. |
| **Gumroad** | **~₹860** | 10% + $0.30 + payout fee | PayPal (Loses 4-5% on currency conversion) | Gumroad has no UPI, no developer search, and high currency fees. |
| **Lemon Squeezy** | **~₹900** | 5% + $0.50 + 2% payout | Stripe Express (Delayed payouts) | High fixed fee eats margins on smaller developer products. |
| **KODEDOCK** | **₹950.00 (95%)** | **5.0% Total All-Inclusive** | **Direct UPI / Bank Transfer** | **Zero forex loss, 1-click UPI checkout, 95% payout.** |

---

## 7. Three-Year Financial Projections (INR Model)

### Assumptions:
- **Average Order Value (AOV)**: ₹1,200 (ranging from ₹299 micro-components to ₹4,999 full SaaS kits).
- **Total Deduction**: 5% of GMV (~3% net platform margin after PG fees).
- **Ancillary Revenue**: Creator featured listings (₹499/week) + Pro Developer Passes.

### Financial Forecast Table (in INR):

| Metric | Year 1 (Launch & Community) | Year 2 (Growth & Scale) | Year 3 (India Market Leader) |
| :--- | :--- | :--- | :--- |
| **Active Listed Products** | 500 | 3,000 | 12,000 |
| **Total Orders / Year** | 10,000 orders | 60,000 orders | 250,000 orders |
| **Gross Merchandise Value (GMV)** | **₹1,20,00,000 (1.20 Cr)** | **₹7,20,00,000 (7.20 Cr)** | **₹30,00,00,000 (30.0 Cr)** |
| **Paid Out to Developers (95%)** | **₹1,14,00,000 (1.14 Cr)** | **₹6,84,00,000 (6.84 Cr)** | **₹28,50,00,000 (28.5 Cr)** |
| **Total 5% Deductions** | ₹6,00,000 | ₹36,00,000 | ₹1,50,00,000 |
| **Payment Gateway Costs (~1.9%)** | -₹2,28,000 | -₹13,68,000 | -₹57,00,000 |
| **Kodedock Net Commission** | ₹3,72,000 | ₹22,32,000 | ₹93,00,000 |
| **Featured Listings & Boost Ads** | ₹1,20,000 | ₹7,50,000 | ₹30,00,000 |
| **Total Platform Gross Revenue** | **₹4,92,00,0** | **₹29,82,000** | **₹1,23,00,000 (1.23 Cr)** |
| **Annual Tech OpEx & Infrastructure**| -₹1,20,000 (₹10k/mo) | -₹3,60,000 (₹30k/mo) | -₹12,00,000 (₹1L/mo) |
| **Support & Ops Reserves** | -₹60,000 | -₹2,40,000 | -₹8,00,000 |
| **Platform Net Profit (EBITDA)** | **₹3,12,000** | **₹23,82,000** | **₹1,03,00,000 (1.03 Cr Net Profit)** |

---

## 8. Why This Model Wins

1. **Unbeatable Value Proposition**: In a country with over 5 million software developers, offering **95% creator payout** and **1-click UPI checkout** creates an unbeatable growth flywheel.
2. **Lean Architecture**: Cloudflare R2 and self-hosted Better Auth make tech costs practically negligible, enabling Kodedock to remain profitable at just 5% total fee.
3. **High Volume Flywheel**: Low fees attract the best creators -> better creators attract all buyers -> huge transaction volume delivers over **₹1 Crore annual net profit** by Year 3.
