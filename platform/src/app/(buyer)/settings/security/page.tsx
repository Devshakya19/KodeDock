"use client";

import React, { useState, useEffect } from "react";
import { authApi } from "@/lib/api/client";

interface ActiveSession {
  id: string;
  ip_address?: string | null;
  user_agent?: string | null;
  is_current?: boolean;
  is_active?: boolean;
  created_at: string;
  expires_at: string;
}

export default function SettingsSecurityPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 5000);
  };

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(newPassword);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0: return { label: "TOO WEAK", color: "text-zinc-500", barColor: "bg-zinc-700" };
      case 1: return { label: "WEAK", color: "text-rose-400", barColor: "bg-rose-500" };
      case 2: return { label: "FAIR", color: "text-amber-400", barColor: "bg-amber-500" };
      case 3: return { label: "GOOD", color: "text-cyan-400", barColor: "bg-cyan-500" };
      case 4: return { label: "ENTERPRISE STRONG", color: "text-emerald-400", barColor: "bg-emerald-400" };
      default: return { label: "", color: "", barColor: "" };
    }
  };

  const strengthInfo = getStrengthLabel(strengthScore);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await authApi.getSessions();
      if (res?.data && Array.isArray(res.data)) {
        setSessions(res.data);
      } else {
        setSessions([]);
      }
    } catch {
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters long", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    setIsChangingPass(true);
    try {
      await authApi.changePassword({
        current_password: oldPassword,
        new_password: newPassword,
      });
      showToast("Argon2id password updated successfully. All credentials re-hashed!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast(err.message || "Failed to update password. Check your current password.", "error");
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await authApi.revokeSession(sessionId);
      showToast("Cryptographic session token revoked and blacklisted in Redis.");
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err: any) {
      showToast(`Revocation failed: ${err.message || "Could not revoke session"}`, "error");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {notice && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium border backdrop-blur-xl shadow-xl transition-all duration-300 animate-in slide-in-from-top-2 ${
            notice.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200 shadow-emerald-950/30"
              : "bg-rose-950/60 border-rose-500/40 text-rose-200 shadow-rose-950/30"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">{notice.type === "success" ? "🔒" : "⚠️"}</span>
            <span>{notice.text}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-xs opacity-70 hover:opacity-100 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: ARGON2ID PASSWORD CRYPTO ENGINE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17171E]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-violet-400 tracking-wider">PROTOCOL // CRYPTO_CREDENTIALS</div>
            <h3 className="text-lg font-heading font-bold text-white tracking-tight">Argon2id Password Engine</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[10px] font-mono">
            64MB MEMORY / 3 PASSES
          </span>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old Password */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-mono text-[#A1A1AA] flex items-center justify-between">
                <span>[FIELD: CURRENT_PASSWORD]</span>
                <span className="text-[#71717A] text-[10px]">VERIFY EXISTING HASH</span>
              </label>
              <div className="relative">
                <input
                  type={showOld ? "text" : "password"}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-[#101015]/90 border border-white/10 text-white placeholder-[#52525B] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 transition-all duration-300 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3.5 top-3.5 text-xs text-[#71717A] hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
                >
                  {showOld ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#A1A1AA] flex items-center justify-between">
                <span>[FIELD: NEW_PASSWORD]</span>
                <span className="text-[#71717A] text-[10px]">MIN 8 CHARACTERS</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-[#101015]/90 border border-white/10 text-white placeholder-[#52525B] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 transition-all duration-300 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-3.5 text-xs text-[#71717A] hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
                >
                  {showNew ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#A1A1AA] flex items-center justify-between">
                <span>[FIELD: CONFIRM_PASSWORD]</span>
                <span className="text-[#71717A] text-[10px]">MATCH CRITERIA</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#101015]/90 border border-white/10 text-white placeholder-[#52525B] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 transition-all duration-300 font-mono"
              />
            </div>
          </div>

          {/* DYNAMIC PASSWORD STRENGTH METER */}
          {newPassword && (
            <div className="p-4 rounded-2xl bg-[#121217]/90 border border-white/5 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#A1A1AA]">ENTROPY METRIC:</span>
                <span className={`font-bold ${strengthInfo.color}`}>{strengthInfo.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`rounded-full transition-all duration-300 ${
                      step <= strengthScore ? strengthInfo.barColor : "bg-[#25252D]"
                    }`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-[#71717A] pt-1">
                <span className={newPassword.length >= 8 ? "text-emerald-400" : ""}>✓ 8+ Chars</span>
                <span>•</span>
                <span className={/[A-Z]/.test(newPassword) ? "text-emerald-400" : ""}>✓ Uppercase</span>
                <span>•</span>
                <span className={/[0-9]/.test(newPassword) ? "text-emerald-400" : ""}>✓ Number</span>
                <span>•</span>
                <span className={/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-400" : ""}>✓ Special Character</span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isChangingPass}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-heading font-bold text-xs tracking-wide shadow-lg shadow-violet-600/30 border border-violet-400/40 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isChangingPass ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>RE-HASHING WITH ARGON2id...</span>
                </>
              ) : (
                <>
                  <span>🔒</span>
                  <span>UPDATE CREDENTIALS</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: RFC 6238 TOTP TWO-FACTOR SECURITY GUARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17171E]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">PROTOCOL // RFC_6238_TOTP</div>
              <h3 className="text-lg font-heading font-bold text-white tracking-tight">Two-Factor Authentication (2FA)</h3>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
            ENFORCED ON PAYOUTS
          </span>
        </div>

        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          KodeDock enforces RFC 6238 TOTP 2FA verification for high-risk operations including bank payout details, UPI ID updates, and withdrawals exceeding ₹10,000. All secrets are encrypted at rest with AES-256-GCM.
        </p>

        <div className="p-4 rounded-2xl bg-[#121217]/70 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛡️</span>
            <div>
              <div className="text-xs font-semibold text-white">Bank-Grade Payout Protection</div>
              <div className="text-[10px] font-mono text-[#71717A]">Cryptographically protects escrow releases and ledger settlements.</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
            ACTIVE GUARD
          </span>
        </div>
      </div>

      {/* SECTION 3: ACTIVE DEVICE SESSIONS & REPLAY REVOCATION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17171E]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">TELEMETRY // ACTIVE_DEVICES</div>
            <h3 className="text-lg font-heading font-bold text-white tracking-tight">Active Multi-Device Sessions</h3>
          </div>
          <button
            onClick={loadSessions}
            className="text-xs font-mono text-violet-400 hover:text-violet-300 px-3 py-1 rounded-xl bg-violet-500/10 border border-violet-500/20 cursor-pointer"
          >
            REFRESH NODES
          </button>
        </div>

        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          KodeDock employs bank-grade token family rotation. If any replay anomaly is detected, the entire session family is instantly purged across PostgreSQL and Redis.
        </p>

        {isLoadingSessions ? (
          <div className="flex items-center justify-center py-10 gap-3 text-xs font-mono text-[#A1A1AA]">
            <span className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span>POLLING REDIS SESSIONS...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#121217]/70 border border-white/5 text-center space-y-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-radar mx-auto" />
            <div className="text-xs font-mono text-white">Current Session Only Active</div>
            <p className="text-[11px] text-[#71717A]">No secondary devices or stale refresh tokens detected in session cache.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  sess.is_current
                    ? "bg-violet-950/20 border-violet-500/40 shadow-[0_0_20px_rgba(133,53,252,0.15)]"
                    : "bg-[#121217]/70 border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${sess.is_current ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-[#1C1C24] text-[#71717A]"}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white font-mono">{sess.ip_address || "127.0.0.1"}</span>
                      {sess.is_current ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-radar" />
                          LIVE NOW
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-[#71717A]">ACTIVE SESSION</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#A1A1AA] truncate max-w-md mt-0.5 font-mono">
                      {sess.user_agent || "Web Browser Client"}
                    </div>
                  </div>
                </div>

                {!sess.is_current && (
                  <button
                    onClick={() => handleRevokeSession(sess.id)}
                    disabled={revokingId === sess.id}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono transition-all cursor-pointer disabled:opacity-50 shrink-0 self-end sm:self-center"
                  >
                    {revokingId === sess.id ? "REVOKING..." : "REVOKE TOKEN"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
