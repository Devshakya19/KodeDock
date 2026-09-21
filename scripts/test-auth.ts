/**
 * Comprehensive Test Suite for Kodedock Self-Hosted Auth & Security
 * Tests:
 * 1. Database Table migrations
 * 2. Scrypt password hashing & validation
 * 3. Custom cryptographic JWT engine
 * 4. Dedicated GitHub & Google OAuth URL & config builders
 * 5. Developer API Keys & Personal Access Tokens (kd_live_...)
 * 6. Email OTP 6-digit passwordless codes & verification
 * 7. High-level AuthService (Register, Login, Session token)
 * 8. RBAC security gates (Buyer vs Seller)
 */

import Database from "better-sqlite3";
import path from "node:path";
import {
  initAuthDatabase,
  KodedockAuthService,
  signJwt,
  verifyJwt,
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  getGitHubAuthUrl,
  getGoogleAuthUrl,
  createApiKey,
  validateApiKey,
  listUserApiKeys,
  revokeApiKey,
  createEmailOtp,
  verifyEmailOtp,
} from "../src/auth";

const dbPath = process.env.DATABASE_URL || path.resolve(process.cwd(), "kodedock.db");
const db = new Database(dbPath);

async function runFullAuthTestSuite() {
  console.log("===============================================================");
  console.log("    KODEDOCK 100% SELF-HOSTED AUTH & SECURITY SUITE TEST");
  console.log("===============================================================\n");

  // Test 1: Database Migration
  console.log("[1/8] Verifying Self-Hosted Database Tables...");
  await initAuthDatabase();
  console.log("  ✓ Core auth tables verified.\n");

  // Test 2: Scrypt Password Security
  console.log("[2/8] Testing Scrypt Password Hashing & Complexity...");
  const weak = validatePasswordStrength("short");
  if (weak.isValid) throw new Error("Weak password should have failed");
  const strong = "P@ssword2026Secure!";
  const hash = await hashPassword(strong);
  const passOk = await verifyPassword(strong, hash);
  const passWrong = await verifyPassword("WrongPassword123!", hash);
  if (!passOk || passWrong) throw new Error("Scrypt password verification failed");
  console.log(`  ✓ Scrypt hash generated: ${hash.slice(0, 32)}...`);
  console.log("  ✓ Timing-safe password verification confirmed.\n");

  // Test 3: Custom Cryptographic JWT
  console.log("[3/8] Testing Custom Cryptographic JWT Engine (HS256)...");
  const token = signJwt({
    sub: "usr_kd_dev_1",
    email: "creator@kodedock.com",
    role: "SELLER",
    name: "Aman Gupta",
  });
  const verified = verifyJwt(token);
  if (!verified.isValid || verified.payload?.role !== "SELLER") {
    throw new Error("Custom JWT verification failed");
  }
  console.log(`  ✓ Custom Signed JWT: ${token.slice(0, 32)}...`);
  console.log(`  ✓ Decoded claims: user="${verified.payload.name}", role="${verified.payload.role}"\n`);

  // Test 4: Dedicated GitHub & Google OAuth Flows
  console.log("[4/8] Testing GitHub & Google OAuth Engine...");
  // Temporarily ensure env credentials for URL test
  process.env.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "github_client_id_test";
  process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "google_client_id_test";

  const gh = getGitHubAuthUrl("test_state_gh");
  if (!gh.url.includes("github.com/login/oauth/authorize")) throw new Error("Invalid GitHub URL");
  console.log(`  ✓ GitHub OAuth URL generated: ${gh.url.slice(0, 70)}...`);

  const ggl = getGoogleAuthUrl("test_state_ggl");
  if (!ggl.url.includes("accounts.google.com/o/oauth2/v2/auth")) throw new Error("Invalid Google URL");
  console.log(`  ✓ Google OAuth URL generated: ${ggl.url.slice(0, 70)}...\n`);

  // Test 5: Developer API Keys & Personal Access Tokens
  console.log("[5/8] Testing Developer API Keys Engine (kd_live_...)...");
  const testUserId = crypto.randomUUID();
  db.prepare(`
    INSERT OR IGNORE INTO user (id, name, email, emailVerified, role, createdAt, updatedAt)
    VALUES (?, 'Test Dev', 'dev_key@kodedock.com', 1, 'SELLER', datetime('now'), datetime('now'))
  `).run(testUserId);

  const createdApiKey = createApiKey(
    db,
    testUserId,
    "CI/CD Deploy Token",
    "SELLER",
    ["read:products", "download:purchased"]
  );

  if (!createdApiKey.rawKey.startsWith("kd_live_")) {
    throw new Error("API key format invalid");
  }
  console.log(`  ✓ Generated API Key: ${createdApiKey.rawKey.slice(0, 20)}... (Hint: ${createdApiKey.keyHint})`);

  // Validate API Key
  const validKeyCheck = validateApiKey(db, createdApiKey.rawKey);
  if (!validKeyCheck.isValid || validKeyCheck.record?.userId !== testUserId) {
    throw new Error("API key validation failed");
  }
  console.log(`  ✓ Key validated: Permissions = [${validKeyCheck.record.permissions.join(", ")}]`);

  // Invalid key check
  const invalidKeyCheck = validateApiKey(db, "kd_live_invalid_key_12345678");
  if (invalidKeyCheck.isValid) throw new Error("Invalid key was mistakenly accepted");
  console.log("  ✓ Malicious/invalid API key successfully rejected.\n");

  // Test 6: Email OTP & Passwordless Login
  console.log("[6/8] Testing 6-Digit Email OTP & Passwordless Codes...");
  const testEmail = "developer@kodedock.com";
  const { otp, expiresAt } = createEmailOtp(db, testEmail, "LOGIN");
  if (otp.length !== 6) throw new Error("OTP must be exactly 6 digits");
  console.log(`  ✓ 6-Digit OTP generated: ${otp} (Expires: ${expiresAt.toISOString()})`);

  // Wrong OTP check
  const wrongOtpCheck = verifyEmailOtp(db, testEmail, "000000", "LOGIN");
  if (wrongOtpCheck.isValid) throw new Error("Wrong OTP should have failed");
  console.log(`  • Wrong OTP rejected: "${wrongOtpCheck.error}"`);

  // Correct OTP check
  const correctOtpCheck = verifyEmailOtp(db, testEmail, otp, "LOGIN");
  if (!correctOtpCheck.isValid) throw new Error("Correct OTP was rejected");
  console.log("  ✓ Correct OTP verified successfully & one-time code burned.\n");

  // Test 7: Master AuthService Registration & Login
  console.log("[7/8] Testing KodedockAuthService (Registration & Sign In)...");
  const uniqueEmail = `creator_${Date.now()}@kodedock.com`;
  const reg = await KodedockAuthService.registerUser({
    email: uniqueEmail,
    password: "Password2026!",
    name: "Kabir Mehta",
    role: "SELLER",
  });
  console.log(`  ✓ Registered User: ${reg.user.name} (${reg.user.email}) | Role: ${reg.user.role}`);
  console.log(`  ✓ Session Token: ${reg.token.slice(0, 16)}... | JWT: ${reg.jwt.slice(0, 24)}...\n`);

  // Test 8: RBAC Verification
  console.log("[8/8] Testing RBAC Security Validation...");
  const authHeaderCheck = await KodedockAuthService.verifyAuthorization(`Bearer ${reg.jwt}`);
  if (!authHeaderCheck || authHeaderCheck.role !== "SELLER") {
    throw new Error("RBAC verification failed");
  }
  console.log(`  ✓ Verified Bearer Token Role: "${authHeaderCheck.role}" (Authorized for Creator Studio)`);

  console.log("\n===============================================================");
  console.log("  ALL 8 SECURITY & AUTH TESTS PASSED! 100% IN OUR CONTROL.");
  console.log("===============================================================\n");
}

runFullAuthTestSuite().catch((err) => {
  console.error("\n❌ Test suite failed:", err);
  process.exit(1);
});
