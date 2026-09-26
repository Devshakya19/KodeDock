"use client";

import React, { useState, useEffect } from "react";
import { Lock, Download, Check } from "lucide-react";

export const PrivacyDataSettings: React.FC = () => {
  const [publicProfile, setPublicProfile]               = useState(true);
  const [purchaseHistoryPublic, setPurchaseHistoryPublic] = useState(false);
  const [analyticsSharing, setAnalyticsSharing]         = useState(true);
  const [loading, setLoading]                           = useState(true);
  const [saving, setSaving]                             = useState(false);
  const [success, setSuccess]                           = useState(false);

  useEffect(() => {
    fetch("/api/portal/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setPublicProfile(d.data.publicProfile ?? true);
          setPurchaseHistoryPublic(d.data.purchaseHistoryPublic ?? false);
          setAnalyticsSharing(d.data.analyticsSharing ?? true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updatePrivacySetting = async (key: string, value: boolean) => {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      // Error handling
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    window.open("/api/portal/export-data", "_blank");
  };

  return (
    <section className="section-card" id="settings-privacy-data">
      <div className="section-card-header">
        <div>
          <div className="card-title">Privacy &amp; Data Export</div>
          <div className="card-desc">Control your data visibility, download a full export, and manage privacy preferences stored in PostgreSQL.</div>
        </div>
        <Lock size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        {loading ? (
          <div className="font-mono text-muted" style={{ padding: "1.5rem 0", fontSize: "0.78rem" }}>
            Fetching PostgreSQL Privacy Settings...
          </div>
        ) : (
          <>
            {/* Profile visibility */}
            <div className="toggle-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="toggle-info">
                <div className="toggle-name">Public Developer Profile</div>
                <div className="toggle-desc">Allow other KodeDock users to view your profile and tech stack.</div>
              </div>
              <label className="toggle" aria-label="Toggle public profile visibility">
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={(e) => {
                    setPublicProfile(e.target.checked);
                    updatePrivacySetting("publicProfile", e.target.checked);
                  }}
                  aria-checked={publicProfile}
                />
                <span className="toggle-track" aria-hidden="true" />
              </label>
            </div>

            {/* Purchase history */}
            <div className="toggle-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="toggle-info">
                <div className="toggle-name">Purchase History Visibility</div>
                <div className="toggle-desc">Show which software products you have acquired on your public profile.</div>
              </div>
              <label className="toggle" aria-label="Toggle purchase history visibility">
                <input
                  type="checkbox"
                  checked={purchaseHistoryPublic}
                  onChange={(e) => {
                    setPurchaseHistoryPublic(e.target.checked);
                    updatePrivacySetting("purchaseHistoryPublic", e.target.checked);
                  }}
                  aria-checked={purchaseHistoryPublic}
                />
                <span className="toggle-track" aria-hidden="true" />
              </label>
            </div>

            {/* Analytics */}
            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-name">Analytics Data Sharing</div>
                <div className="toggle-desc">Help improve KodeDock by sharing anonymized usage analytics.</div>
              </div>
              <label className="toggle" aria-label="Toggle analytics data sharing">
                <input
                  type="checkbox"
                  checked={analyticsSharing}
                  onChange={(e) => {
                    setAnalyticsSharing(e.target.checked);
                    updatePrivacySetting("analyticsSharing", e.target.checked);
                  }}
                  aria-checked={analyticsSharing}
                />
                <span className="toggle-track" aria-hidden="true" />
              </label>
            </div>

            <div className="divider" />

            {/* Data Export */}
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              Export Your Data (PostgreSQL JSON Dump)
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
              Download a complete archive of your account data including orders, licenses, API keys, and settings from PostgreSQL in JSON format.
            </p>
            <button
              type="button"
              onClick={handleExportData}
              className="btn btn-secondary btn-md"
            >
              <Download size={15} aria-hidden="true" />
              <span>Download PostgreSQL Data Export</span>
            </button>
          </>
        )}
      </div>

      {success && (
        <div className="section-card-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--status-success)", fontSize: "0.82rem", fontWeight: 600 }}>
            <Check size={16} aria-hidden="true" />
            <span>Privacy Settings Saved in PostgreSQL!</span>
          </div>
        </div>
      )}
    </section>
  );
};
