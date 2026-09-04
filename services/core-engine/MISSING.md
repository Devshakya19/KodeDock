# KodeDock Core Engine — Missing Auth Features & Roadmap

This document outlines the security vulnerabilities, missing architectural components, and proposed implementation roadmap for the **Authentication & Identity System** in the **KodeDock Core Engine (Rust)**.

---

## 📊 Current vs Missing Auth Matrix

| Feature | Current Status | Production Impact | Priority |
| :--- | :---: | :--- | :---: |
| **Argon2id Password Hashing** | ✅ Implemented | High security password storage with random salt | - |
| **AES-256-GCM OAuth Token Storage** | ✅ Implemented | Encrypted GitHub access tokens in DB | - |
| **TOCTOU-Safe Password Reset** | ✅ Implemented | Atomic token claim prevents race conditions | - |
| **GitHub OAuth Flow & Linking** | ✅ Implemented | Single-click GitHub login and account linking | - |
| **Refresh Token Rotation** | ❌ **Missing** | Access JWTs valid for 24h; no revocation | 🔴 **High** |
| **Real Email Dispatch (SMTP/Resend)** | ❌ **Missing** | Reset links only print to console logs | 🔴 **High** |
| **2FA / TOTP Authenticator** | ❌ **Missing** | No second factor for wallet payouts/logins | 🔴 **High** |
| **Email Verification on Signup** | ❌ **Missing** | Unverified fake emails can transact | 🟡 **Medium** |
| **Server-Side Session Revocation** | ❌ **Missing** | Logout is client-side only; tokens remain valid | 🟡 **Medium** |
| **Google OAuth 2.0 Integration** | ❌ **Missing** | Non-technical buyers unable to use Google | 🟡 **Medium** |
| **Account Lockout on Brute-Force** | ❌ **Missing** | No per-account failed password lockout | 🟢 **Low** |
| **Auth Security Audit Logging** | ❌ **Missing** | No audit trail for IP, Device, and Auth events | 🟢 **Low** |

---

## 🚨 1. Critical Missing Components (High Priority)

### 1.1. Refresh Token Rotation & Token Invalidation (`/api/auth/refresh`)
* **Problem:** Currently, `generate_token()` mints a single 24-hour Access JWT. If a token is compromised, it cannot be revoked before expiration.
* **Solution:**
  - Introduce **15-minute short-lived Access Tokens** and **7-day Refresh Tokens** (stored in HTTP-only cookies).
  - Implement a `refresh_tokens` database table with token family detection (automatic revocation if reuse detected).
* **Database Schema Required:**
  ```sql
  CREATE TABLE refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL UNIQUE,
      family_id UUID NOT NULL,
      is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
  ```

---

### 1.2. Real Transactional Email Dispatch (SMTP / Resend / AWS SES)
* **Problem:** In `handlers/auth.rs`, `forgot_password` creates a token and logs:
  ```rust
  let _reset_url = format!("{}/reset-password?token={}", base_url, token);
  log::info!("Password reset requested for {} (token generated)", body.email);
  ```
  No email is actually sent to the user's inbox.
* **Solution:**
  - Add an asynchronous email delivery service using `lettre` (SMTP) or `reqwest` with **Resend API**.
  - Provide HTML templates for Password Reset, Email Verification, and Payout OTPs.

---

### 1.3. Two-Factor Authentication (2FA / TOTP)
* **Problem:** KodeDock is a digital fintech escrow platform where sellers hold significant balances in INR paise. A single compromised password can lead to unauthorized payout withdrawals.
* **Solution:**
  - Implement RFC 6238 TOTP generator (compatible with Google Authenticator, Authy, 1Password).
  - Require 2FA OTP for:
    1. Login (if 2FA enabled).
    2. Wallet payout withdrawal requests.
    3. Password and email changes.
* **Endpoints Needed:**
  - `POST /api/auth/2fa/setup` — Generates TOTP secret and QR code URI.
  - `POST /api/auth/2fa/enable` — Validates first OTP and activates 2FA.
  - `POST /api/auth/2fa/verify` — Validates OTP during login/payout.
  - `POST /api/auth/2fa/disable` — Disables 2FA with current password + OTP.

---

## 🛡️ 2. Core Security & UX Components (Medium Priority)

### 2.1. Mandatory Email Verification Flow
* **Problem:** Users can register with unverified or fake email addresses and immediately create listings or attempt payments.
* **Solution:**
  - Add `email_verified: boolean` to `users` table.
  - Send a 6-digit confirmation code or verification link upon registration.
  - Restrict product uploads and wallet withdrawals to verified users.

---

### 2.2. Server-Side Session Tracking & "Logout All Devices"
* **Problem:** `logout()` handler is stateless and does not invalidate active JWTs.
* **Solution:**
  - Maintain active user session records in Redis or Postgres with IP and User-Agent.
  - Provide a `/api/auth/logout-all` endpoint to terminate all other active logins.

---

### 2.3. Google OAuth 2.0 Provider
* **Problem:** Only GitHub OAuth is supported. Non-developer buyers (founders, agency owners) often prefer Google Sign-In.
* **Solution:**
  - Implement `/api/auth/google` route alongside GitHub OAuth.
  - Store Google OAuth ID and avatar in `users` and `profiles`.

---

## 📈 3. Additional Hardening (Low Priority / Enterprise)

### 3.1. Account Lockout on Failed Password Attempts
* Track `failed_login_attempts` in `users`.
* Lock account for 15 minutes after 5 consecutive failed attempts to stop brute-force attacks.

### 3.2. Security Audit Logs (`auth_audit_logs`)
* Record login IP, country, device type, timestamp, and event type (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `PASSWORD_RESET`, `2FA_ENABLED`).

---

## 🗺️ Recommended Implementation Steps

1. **Phase 1 (Immediate Security):**
   - [ ] Implement `refresh_tokens` table and `/api/auth/refresh` endpoint.
   - [ ] Integrate Resend / SMTP email delivery for Password Reset.

2. **Phase 2 (Fintech Protection):**
   - [ ] Add TOTP 2FA for wallet withdrawals and seller accounts.
   - [ ] Implement Email Verification on new user registrations.

3. **Phase 3 (User Experience & Scale):**
   - [ ] Add Google OAuth 2.0 flow.
   - [ ] Add Device Session Tracking & "Logout from all devices".
