"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  ShieldCheck,
  Globe,
  Code2,
  Check,
  Save,
} from "lucide-react";

export default function StudioSettingsPage() {
  const [displayName, setDisplayName] = useState("Alex Dev");
  const [creatorEmail, setCreatorEmail] = useState("creator@kodedock.local");
  const [bio, setBio] = useState("Full-stack systems architect building production-ready Next.js and Go microservices.");
  const [githubHandle, setGithubHandle] = useState("alexdev");
  const [twitterHandle, setTwitterHandle] = useState("alex_dev");
  const [notifyOnSale, setNotifyOnSale] = useState(true);
  const [notifyOnPayout, setNotifyOnPayout] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetch("/api/portal/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          if (d.data.name) setDisplayName(d.data.name);
          if (d.data.email) setCreatorEmail(d.data.email);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="page-container" style={{ maxWidth: "880px" }}>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="page-eyebrow">
          <Settings size={12} color="var(--accent-primary)" />
          <span>Creator Preferences</span>
        </div>
        <h1 className="page-title">
          Studio <span style={{ color: "var(--accent-primary)" }}>Settings</span>
        </h1>
        <p className="page-subtitle">
          Configure your public seller identity, verified creator credentials, and notification thresholds.
        </p>
      </motion.div>

      <form onSubmit={handleSave}>
        {/* ── Verified Creator Badge Status ─────────────────────────────────── */}
        <div className="studio-bezel-card" style={{ padding: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <strong style={{ color: "#ffffff", fontSize: "1rem" }}>Verified Creator Standing</strong>
                <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", padding: "0.15rem 0.45rem", borderRadius: "4px", background: "rgba(16, 185, 129, 0.15)", color: "var(--status-success)", fontWeight: 700 }}>
                  ACTIVE
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                Eligible for instant automated 95% payouts and featured marketplace placement.
              </p>
            </div>
          </div>
        </div>

        {/* ── Public Seller Profile ─────────────────────────────────────────── */}
        <div className="studio-bezel-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", marginBottom: "1.25rem" }}>
            Public Seller Profile
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group-custom">
              <label className="form-label-custom">Display Name / Studio Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="form-input-custom"
              />
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Contact Email</label>
              <input
                type="email"
                required
                value={creatorEmail}
                onChange={(e) => setCreatorEmail(e.target.value)}
                className="form-input-custom"
              />
            </div>
          </div>

          <div className="form-group-custom" style={{ marginTop: "1rem" }}>
            <label className="form-label-custom">Public Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="form-input-custom"
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div className="form-group-custom">
              <label className="form-label-custom">GitHub Username</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={githubHandle}
                  onChange={(e) => setGithubHandle(e.target.value)}
                  className="form-input-custom"
                  style={{ paddingLeft: "2.2rem" }}
                />
                <Code2 size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              </div>
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Website / Portfolio URL</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  className="form-input-custom"
                  style={{ paddingLeft: "2.2rem" }}
                />
                <Globe size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Notification Preferences ──────────────────────────────────────── */}
        <div className="studio-bezel-card" style={{ padding: "1.75rem", marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", marginBottom: "1.25rem" }}>
            Notification Triggers
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <div>
                <strong style={{ color: "#ffffff", fontSize: "0.88rem" }}>Instant Sale Alert</strong>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Receive an immediate notification whenever a developer buys your codebase.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifyOnSale}
                onChange={(e) => setNotifyOnSale(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "var(--accent-primary)", cursor: "pointer" }}
              />
            </label>

            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <div>
                <strong style={{ color: "#ffffff", fontSize: "0.88rem" }}>Payout Settlement Notice</strong>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Receive confirmation when UPI / IMPS payouts are credited to your bank account.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifyOnPayout}
                onChange={(e) => setNotifyOnPayout(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "var(--accent-primary)", cursor: "pointer" }}
              />
            </label>
          </div>
        </div>

        {/* ── Save Action ───────────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: "0.65rem 1.5rem", fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            {isSaved ? (
              <>
                <Check size={16} color="var(--status-success)" />
                <span>Settings Saved</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
