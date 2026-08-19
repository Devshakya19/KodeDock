# KodeDock — Privacy Policy

> How we collect, use, store, and protect your data.

---

**Effective Date:** August 1, 2026  
**Last Updated:** August 2, 2026

---

## 1. Overview

KodeDock ("we," "us," "our") respects your privacy. This Privacy Policy explains what data we collect, why we collect it, how we use it, and the controls you have over your information.

We comply with applicable Indian data protection regulations, including the **Digital Personal Data Protection Act, 2023**.

---

## 2. Data We Collect

### 2.1 Data You Provide

| Data Type | Examples | Purpose |
|-----------|----------|---------|
| **Account** | Full name, email, password (hashed) | Authentication |
| **Profile** | Bio, avatar, GitHub username, website, location | Public profile |
| **Seller** | Bank account number, IFSC, UPI ID | Withdrawals |
| **Payment** | Razorpay order IDs, payment IDs | Transaction records |

### 2.2 Data Collected Automatically

| Data Type | Examples | Purpose |
|-----------|----------|---------|
| **Usage** | Products viewed, searches, purchases | Recommendations, analytics |
| **Technical** | IP address, browser type, device info | Security, rate limiting |
| **Cookies** | Auth token (HttpOnly), session data | Authentication |

---

## 3. How We Use Your Data

### 3.1 Primary Uses
- **Authentication:** Verify your identity and maintain your session
- **Transactions:** Process purchases, wallet top-ups, and withdrawals
- **Delivery:** Transfer purchased code to your GitHub account
- **Communication:** Send order confirmations, notifications, and support responses
- **Security:** Detect fraud, prevent abuse, rate-limit malicious traffic

### 3.2 Secondary Uses
- **Analytics:** Aggregate, anonymized data for Platform improvement
- **Recommendations:** Suggest relevant products (via AI service)
- **Legal:** Comply with legal obligations and resolve disputes

### 3.3 What We Do NOT Do
- ❌ We do **not** sell your personal data to third parties
- ❌ We do **not** use your bank details for marketing
- ❌ We do **not** share your email with sellers (unless you contact them)
- ❌ We do **not** track you across other websites

---

## 4. Data Storage & Security

### 4.1 Storage Architecture

| Data | Storage | Encryption |
|------|---------|-----------|
| Passwords | PostgreSQL | Argon2 hash (irreversible) |
| Auth tokens | HttpOnly cookies | JWT HS256 signed |
| Bank account numbers | PostgreSQL | Masked in API (last 4 digits only) |
| IFSC codes | PostgreSQL | Stored as plaintext (public info) |
| UPI IDs | PostgreSQL | Stored as plaintext (shareable by design) |
| Images | SeaweedFS (S3-compatible) | Server-side access only |
| GitHub tokens | PostgreSQL | Used only for repo transfer |

### 4.2 Security Measures
- **Argon2** password hashing (memory-hard, industry best)
- **JWT in HttpOnly cookies** — tokens never exposed to browser JavaScript (XSS-proof)
- **SQLx compile-time checked queries** — SQL injection impossible
- **SSRF protection** — whitelist-based URL validation
- **Rate limiting** — per-endpoint limits prevent brute force
- **CORS** — strict origin allowlist
- **Security headers** — X-Frame-Options, X-Content-Type-Options, CSP

### 4.3 Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| Account data | Until account deletion |
| Transaction records | 7 years (legal requirement) |
| Password reset tokens | 1 hour (auto-expire) |
| Session tokens | 24 hours (auto-expire) |
| Product views | Indefinitely (anonymized) |

---

## 5. Cookies

| Cookie | Type | Duration | Purpose |
|--------|------|----------|---------|
| `kodedock_token` | HttpOnly | 24 hours | Authentication (JWT) |

We use only **essential cookies** for authentication. We do **not** use third-party tracking cookies, analytics cookies, or advertising cookies.

---

## 6. Your Rights (Data Subject Rights)

Under the Digital Personal Data Protection Act, 2023, you have the right to:

| Right | How to Exercise |
|-------|-----------------|
| **Access** — Get a copy of your data | Email privacy@kodedock.com |
| **Correction** — Fix inaccurate data | Use Profile Settings or email us |
| **Erasure** — Delete your data | Use Settings → Delete Account |
| **Withdrawal** — Revoke consent | Delete your account |
| **Grievance** — File a complaint | Contact Grievance Officer (below) |

### Data Deletion
When you delete your account:
- ✅ Your profile, wallet, and personal data are **permanently removed**
- ✅ Your password and auth tokens are **immediately destroyed**
- ⚠️ Transaction records are retained for **7 years** (legal compliance)
- ⚠️ Product reviews remain (anonymized — your name is removed)

---

## 7. Data Sharing

We share data only in these circumstances:

| Recipient | Data Shared | Reason |
|-----------|-------------|--------|
| **Razorpay** | Payment amount, order ID | Process payments |
| **GitHub** | Repository URL (on purchase) | Deliver code to buyers |
| **Legal authorities** | As required by law | Court orders, legal compliance |
| **Hosting providers** | Server logs | Infrastructure (we self-host most services) |

We **never** share:
- ❌ Your bank details with third parties
- ❌ Your email with marketers
- ❌ Your purchase history with sellers (beyond what's necessary)

---

## 8. Children's Privacy

KodeDock is not intended for users under 18. We do not knowingly collect data from minors. If we become aware of such data, we will delete it immediately. Contact privacy@kodedock.com to report underage accounts.

---

## 9. International Data Transfer

Your data is stored on servers located in **India**. We do not transfer personal data outside India except:
- When required for payment processing (Razorpay)
- When required for GitHub repo delivery

In such cases, only the minimum necessary data is shared.

---

## 10. Grievance Officer

As required by Indian law, our Grievance Officer is available to address privacy concerns:

| | Details |
|---|---------|
| **Name** | KodeDock Privacy Grievance Officer |
| **Email** | privacy@kodedock.com |
| **Response Time** | Within 48 hours of receipt |
| **Resolution Time** | Within 30 days (or as per applicable law) |

---

## 11. Changes to This Policy

- We may update this Privacy Policy periodically
- Material changes will be notified via email at least 7 days before taking effect
- The "Last Updated" date reflects the most recent revision
- Continued use after changes constitutes acceptance

---

## 12. Contact

For privacy questions or data requests:
- **Email:** privacy@kodedock.com
- **Grievance:** See Section 10 above
- **General:** See [Contact](05-CONTACT.md)

---

*Document Version: 1.0 | Last Updated: August 2026*

© 2025-2026 KodeDock. All rights reserved.
