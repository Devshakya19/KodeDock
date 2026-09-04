# KodeDock Infra Worker — Missing Features & Implementation Roadmap

This document outlines the architectural gaps, simulated mock logic, and required implementation roadmap for the **Background Infrastructure & GitHub Automation Worker (Go)** in **KodeDock**.

---

## 📊 Feature Status & Priority Matrix

| Feature | Current Status | Impact / Risk | Priority |
| :--- | :---: | :--- | :---: |
| **Redis Queue Consumer (`BLPop`)** | ✅ Implemented | Asynchronous job consumer loop | - |
| **Graceful Shutdown Handler** | ✅ Implemented | Safe context cancellation on SIGINT | - |
| **Real GitHub Repo Duplication** | ❌ **Mock (`time.Sleep`)** | Codebase never actually delivered to buyer | 🔴 **Critical** |
| **PostgreSQL Order Status Sync** | ❌ **Missing** | Order delivery state never updated in DB | 🔴 **Critical** |
| **SeaweedFS ZIP Extraction** | ❌ **Missing** | Cannot deliver `.zip` uploaded code assets | 🔴 **High** |
| **Real PDF Invoice Generation** | ❌ **Mock (`time.Sleep`)** | Tax-compliant invoice PDFs not generated | 🟡 **Medium** |
| **Transactional Email Dispatch** | ❌ **Mock (`time.Sleep`)** | Emails with attachments never sent | 🟡 **Medium** |
| **Job Retries & Dead-Letter Queue (DLQ)** | ❌ **Missing** | Silent failures on GitHub API limits/errors | 🟡 **Medium** |

---

## 🚨 1. Critical Missing Implementations

### 1.1. Real GitHub Repository Duplication & Transfer Engine
* **Current Code:**
  ```go
  // Line 99 in cmd/main.go:
  time.Sleep(2 * time.Second)
  log.Printf("[WORKER] Success! Repository cloned and transferred to buyer.")
  ```
* **Required Implementation:**
  1. Receive `order_id`, `product_id`, `buyer_github_token`, `seller_github_token` from job payload.
  2. Use `go-git` or local `exec.Command("git", "clone", ...)` to clone seller repository into a sandboxed temp directory.
  3. Strip commit history / sensitive branches (`git checkout --orphan main`).
  4. Call GitHub REST API (`POST https://api.github.com/user/repos`) using buyer's access token to initialize a private repository.
  5. Push the codebase to buyer's private repository.
  6. Clean up temporary directories.

---

### 1.2. PostgreSQL Database Order Lifecycle Synchronization
* **Problem:** Currently `infra-worker` does not connect to PostgreSQL.
* **Required Implementation:**
  - Add `database/sql` + `lib/pq` (or `pgx`) connection.
  - Update `orders` table:
    - `SET delivery_status = 'transferring'` when job starts.
    - `SET delivery_status = 'delivered'`, `buyer_repo_url = $url` when complete.
    - `SET delivery_status = 'failed'`, `delivery_error = $err` upon error.

---

### 1.3. SeaweedFS ZIP Archive Handling
* **Problem:** Sellers can upload direct `.zip` code archives instead of GitHub URLs.
* **Required Implementation:**
  - Download `.zip` archive from SeaweedFS S3 endpoint (`http://seaweedfs:8333`).
  - Extract files in memory or temp disk.
  - Initialize git repository and push directly to buyer's private GitHub repo.

---

## 📄 2. Supporting Services (Medium Priority)

### 2.1. Real PDF Invoice Generator
* Integrate `johnfercher/maroto` or `jung-kurt/gofpdf` to generate PDF invoices containing:
  - Seller & Buyer details.
  - Order ID, Payment ID, Date, Amount (in INR paise converted to ₹).
  - Platform commission & GST breakdown.

### 2.2. Email Delivery with Attachment
* Integrate Resend Go SDK or SMTP client to send generated PDF invoice to buyer's verified email.

### 2.3. Retry Mechanism & Dead-Letter Queue (DLQ)
* Implement 3-tier retry with exponential backoff on GitHub rate limits (`403` / `429`).
* Push exhausted failures to `repo_transfer_dlq` for HQ admin intervention.

---

## 🗺️ Implementation Roadmap

1. **Phase 1 (Core Automation):**
   - [ ] Replace `time.Sleep` in `processRepoTransferJobs` with real GitHub API client & `go-git`.
   - [ ] Add PostgreSQL database connection and order status updater.
2. **Phase 2 (Storage & Invoicing):**
   - [ ] Add SeaweedFS S3 `.zip` extractor for non-git products.
   - [ ] Implement Go PDF Invoice generation (`maroto`).
3. **Phase 3 (Reliability):**
   - [ ] Implement Redis Dead-Letter Queue (DLQ) and retry backoff.
