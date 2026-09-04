# 🛡️ Security Policy

## Supported Versions
We actively release security patches and updates for the following versions of KodeDock:

| Version | Supported          |
| :---    | :---               |
| 1.x.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## 🔒 Security Architecture Highlights
KodeDock enforces bank-grade security across every layer:
1. **Password Hashing:** Argon2id (64MB memory cost, 3 iterations, 4 parallelism).
2. **Session Security:** 15-minute Access JWTs + 7-Day Refresh Token Family Rotation with automatic replay/theft revocation.
3. **Sensitive Data Encryption:** Database TOTP 2FA secret keys, PAN numbers, and payout bank details are encrypted at rest with **AES-256-GCM**.
4. **Codebase Protection:** Pre-publish Tree-Sitter AST & Aho-Corasick Regex scanner detecting leaked AWS keys, Stripe tokens, and private SSH/RSA keys.
5. **Fintech Integrity:** Row-level locks (`SELECT ... FOR UPDATE`) and double-entry integer paise accounting preventing race conditions and double-spending.

---

## 🚨 Reporting a Vulnerability

We take the security of KodeDock, our creators, and our buyers extremely seriously. If you discover a security vulnerability, please follow our **Responsible Disclosure Policy**:

### How to Report:
1. **Do NOT open a public GitHub issue.**
2. Send an email with full technical details, reproduction steps, and proof-of-concept (PoC) to:
   - 📧 **`security@kodedock.internal`** (or through private repository security advisories).
3. If reporting cryptographic or financial vulnerabilities, please include relevant transaction IDs or trace headers.

### Our Commitment:
- **Acknowledgment:** We will acknowledge receipt of your vulnerability report within **24 hours**.
- **Assessment:** Our engineering team will assess and validate the issue within **48 hours**.
- **Remediation:** We will release a patch and notify affected users promptly.
- **Credit:** We will publicly credit your responsible disclosure in our release notes (unless you prefer anonymity).
