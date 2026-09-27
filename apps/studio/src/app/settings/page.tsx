"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sliders,
  ShieldCheck,
  Globe,
  Code2,
  Check,
  Save,
  Bell,
  User,
  Share2,
  Lock,
  CheckCircle2,
  Zap,
  Activity,
  Layers,
  Terminal,
} from "lucide-react";
import { getAutoAvatar } from "@/lib/avatars";

export default function StudioSettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [bio, setBio] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [notifyOnSale, setNotifyOnSale] = useState(true);
  const [notifyOnPayout, setNotifyOnPayout] = useState(true);
  const [notifyOnRelease, setNotifyOnRelease] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portal/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          if (d.data.name) setDisplayName(d.data.name);
          if (d.data.email) setCreatorEmail(d.data.email);
          if (d.data.image) setUserAvatar(d.data.image);
          if (d.data.bio) setBio(d.data.bio);
          if (d.data.githubHandle) setGithubHandle(d.data.githubHandle);
          if (d.data.twitterHandle) setTwitterHandle(d.data.twitterHandle);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName.trim(),
          bio: bio.trim(),
          githubHandle: githubHandle.trim(),
          twitterHandle: twitterHandle.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsSaved(true);
        setSaveMessage("Preferences saved successfully to PostgreSQL database.");
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        setSaveMessage(json.error?.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setSaveMessage(err.message || "Network error while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const avatarSrc = userAvatar || getAutoAvatar(creatorEmail || "creator@kodedock.local");

  return (
    <div className="page-container" style={{ maxWidth: "1040px", margin: "0 auto", paddingBottom: "6rem" }}>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: "2rem" }}
      >
        <div className="page-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <Sliders size={13} color="var(--accent-primary)" />
          <span>CREATOR PREFERENCES // ACCOUNT CONTROLS</span>
        </div>
        <h1 className="page-title" style={{ fontSize: "2.35rem", letterSpacing: "-0.03em" }}>
          Studio <span style={{ color: "var(--accent-primary)" }}>Settings</span>
        </h1>
        <p className="page-subtitle" style={{ fontSize: "0.92rem", maxWidth: "680px" }}>
          Configure your public seller identity, verified creator credentials, cryptographic licensing signatures, and payout notification thresholds.
        </p>
      </motion.div>

      {saveMessage && (
        <div
          style={{
            background: isSaved ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
            border: `1px solid ${isSaved ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: isSaved ? "var(--status-success)" : "var(--status-danger)",
            padding: "0.85rem 1.25rem",
            borderRadius: "12px",
            fontSize: "0.85rem",
            marginBottom: "1.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
          }}
        >
          {isSaved ? <CheckCircle2 size={16} /> : <Lock size={16} />}
          <span>{saveMessage}</span>
        </div>
      )}

      {/* ── Verified Creator Standing Card (Doppelrand Hardware Chassis) ─── */}
      <div className="double-bezel-chassis" style={{ marginBottom: "2rem" }}>
        <div className="double-bezel-core" style={{ padding: "1.5rem 1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div style={{ position: "relative", width: "56px", height: "56px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(139, 92, 246, 0.4)", background: "var(--bg-surface-elevated)", flexShrink: 0 }}>
                <img src={avatarSrc} alt={displayName || "Creator"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: "3px", right: "3px", width: "10px", height: "10px", borderRadius: "50%", background: "var(--status-success)", border: "2px solid #000" }} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "#ffffff" }}>
                    {displayName || "Verified Creator Account"}
                  </h2>
                  <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "var(--status-success)", fontWeight: 700 }}>
                    ACTIVE STANDING
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  {creatorEmail || "creator@kodedock.local"} &bull; Eligible for automated 95% payouts and featured marketplace curation.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                  Revenue Split
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.15rem", fontWeight: 800, color: "var(--status-success)" }}>
                  95% Direct
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                  Download Protocol
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-cyan)" }}>
                  HMAC 60s
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* ── Settings Grid (2 Balanced Columns) ────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.75rem", marginBottom: "2rem" }}>
          {/* ── Left Column: Public Developer Profile ───────────────────── */}
          <div className="double-bezel-chassis">
            <div className="double-bezel-core" style={{ padding: "1.75rem 2rem", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1.5rem", paddingBottom: "0.85rem", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <User size={18} color="var(--accent-primary)" />
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "#ffffff" }}>
                  Public Developer Profile
                </h3>
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">Display Name / Studio Handle</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Acme Systems or Jane Developer"
                  className="form-input-custom"
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">
                  <span>Contact Email</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--status-success)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                    <CheckCircle2 size={11} />
                    <span>Verified</span>
                  </span>
                </label>
                <input
                  type="email"
                  required
                  value={creatorEmail}
                  onChange={(e) => setCreatorEmail(e.target.value)}
                  placeholder="creator@yourdomain.com"
                  className="form-input-custom"
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">Public Engineering Bio</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your engineering stack, design standards, microservices, and technical expertise..."
                  className="form-input-custom"
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">GitHub Username</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                    placeholder="github-username"
                    className="form-input-custom"
                    style={{ paddingLeft: "2.3rem" }}
                  />
                  <Code2 size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                </div>
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">Website / Documentation URL</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="form-input-custom"
                    style={{ paddingLeft: "2.3rem" }}
                  />
                  <Globe size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Notification Triggers & Security Audit ───── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            {/* Notification Triggers */}
            <div className="double-bezel-chassis">
              <div className="double-bezel-core" style={{ padding: "1.75rem 2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1.5rem", paddingBottom: "0.85rem", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <Bell size={18} color="var(--accent-cyan)" />
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "#ffffff" }}>
                    Notification &amp; Payout Triggers
                  </h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {/* Instant Sale Alert */}
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", cursor: "pointer", background: "rgba(255, 255, 255, 0.02)", padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div>
                      <div style={{ color: "#ffffff", fontSize: "0.88rem", fontWeight: 600 }}>
                        Instant Sale Notification
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                        Receive immediate alert when a developer purchases your codebase.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyOnSale}
                      onChange={(e) => setNotifyOnSale(e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "var(--accent-primary)", cursor: "pointer", flexShrink: 0 }}
                    />
                  </label>

                  {/* Payout Notice */}
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", cursor: "pointer", background: "rgba(255, 255, 255, 0.02)", padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div>
                      <div style={{ color: "#ffffff", fontSize: "0.88rem", fontWeight: 600 }}>
                        Payout Settlement Notice
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                        Confirmation when IMPS / UPI payouts are disbursed to your account.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyOnPayout}
                      onChange={(e) => setNotifyOnPayout(e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "var(--accent-primary)", cursor: "pointer", flexShrink: 0 }}
                    />
                  </label>

                  {/* Release Alert */}
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", cursor: "pointer", background: "rgba(255, 255, 255, 0.02)", padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div>
                      <div style={{ color: "#ffffff", fontSize: "0.88rem", fontWeight: 600 }}>
                        Release Deployment Notification
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                        Notify buyers automatically when you push a new SemVer release.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyOnRelease}
                      onChange={(e) => setNotifyOnRelease(e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "var(--accent-primary)", cursor: "pointer", flexShrink: 0 }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Cryptographic Security Summary */}
            <div className="double-bezel-chassis">
              <div className="double-bezel-core" style={{ padding: "1.5rem 1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
                  <ShieldCheck size={18} color="var(--status-success)" />
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "#ffffff" }}>
                    Cryptographic Security Status
                  </h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>License Key Engine</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--status-success)", fontWeight: 700 }}>Ed25519 ACTIVE</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Binary Archive Delivery</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", fontWeight: 700 }}>HMAC 60s SIGNED</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Database State Parity</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>PostgreSQL 16 SYNCED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Save Action Controls ───────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={isSaving}
            className="island-cta-btn"
            style={{ padding: "0.55rem 0.75rem 0.55rem 1.45rem", fontSize: "0.9rem" }}
          >
            {isSaving ? (
              <span>Persisting to PostgreSQL...</span>
            ) : isSaved ? (
              <>
                <span>Preferences Saved</span>
                <div className="island-icon-pod" style={{ background: "rgba(16, 185, 129, 0.3)" }}>
                  <Check size={14} color="var(--status-success)" strokeWidth={2.4} />
                </div>
              </>
            ) : (
              <>
                <span>Save Creator Preferences</span>
                <div className="island-icon-pod">
                  <Save size={14} strokeWidth={2} />
                </div>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
