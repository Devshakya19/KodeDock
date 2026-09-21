/**
 * Kodedock Authentication & Security Engine
 * 100% Self-Hosted, Sovereign Architecture (Zero External BaaS).
 *
 * Fully modular and editable directly in your codebase:
 * - Oauth/github.oauth.ts: Dedicated GitHub OAuth 2.0 flow & profile/repo parser
 * - Oauth/google.oauth.ts: Dedicated Google OAuth 2.0 flow & profile parser
 * - keys/apiKey.service.ts: Developer API Keys & CLI Personal Access Tokens (kd_live_...)
 * - email/otp.service.ts: 6-digit Email OTP & Passwordless login codes
 * - JWT/jwt.service.ts: Custom cryptographic JWT signing, verification, and decoding
 * - session/session.service.ts: Database session creation, verification, and revocation
 * - passwords/password.service.ts: Scrypt hashing, salt generation, and password complexity
 * - auth.service.ts: Master Auth Service (register, login, role updates)
 * - auth.ts: Better Auth server instance & database adapter integration
 */

export * from "./auth";
export * from "./auth.service";
export * from "./JWT/jwt.service";
export * from "./Oauth/oauth.service";
export * from "./Oauth/github.oauth";
export * from "./Oauth/google.oauth";
export * from "./keys/apiKey.service";
export * from "./email/otp.service";
export * from "./session/session.service";
export * from "./passwords/password.service";
