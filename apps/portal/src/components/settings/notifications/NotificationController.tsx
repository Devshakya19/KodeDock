"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";

const NOTIF_SETTINGS = [
  { id: "new-release",    label: "New Version Releases",        desc: "Alert when any acquired software publishes a new release." },
  { id: "security-patch", label: "Security Patch Advisories", desc: "Critical CVE and dependency vulnerability notifications." },
  { id: "download-ready", label: "Signed Download Ready",     desc: "Notify when a 60-second signed link is generated." },
  { id: "payment-confirm", label: "Payment Confirmations",    desc: "Receipt notifications after successful purchases." },
  { id: "license-expiry", label: "License Expiry Warnings",   desc: "7-day advance notice before any license expires." },
  { id: "newsletter",     label: "KodeDock Product Newsletter",  desc: "Monthly digest of new tools and platform updates." },
];

export const NotificationController: React.FC = () => {
  const [rules, setRules]     = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/portal/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data && d.data.notificationRules) {
          setRules(d.data.notificationRules);
        } else {
          setRules(Object.fromEntries(NOTIF_SETTINGS.map((s) => [s.id, true])));
        }
      })
      .catch(() => {
        setRules(Object.fromEntries(NOTIF_SETTINGS.map((s) => [s.id, true])));
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    const updated = { ...rules, [id]: !rules[id] };
    setRules(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationRules: rules }),
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

  return (
    <section className="section-card" id="settings-notifications">
      <div className="section-card-header">
        <div>
          <div className="card-title">Notification Preferences</div>
          <div className="card-desc">Control which alerts and events trigger email and in-app notifications, stored in PostgreSQL.</div>
        </div>
        <Bell size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        {loading ? (
          <div className="font-mono text-muted" style={{ padding: "1.5rem 0", fontSize: "0.78rem" }}>
            Fetching PostgreSQL Notification Rules...
          </div>
        ) : (
          NOTIF_SETTINGS.map((item, i) => (
            <div
              key={item.id}
              className="toggle-row"
              style={{ borderBottom: i < NOTIF_SETTINGS.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
            >
              <div className="toggle-info">
                <div className="toggle-name">{item.label}</div>
                <div className="toggle-desc">{item.desc}</div>
              </div>
              <label className="toggle" aria-label={`Toggle ${item.label}`}>
                <input
                  type="checkbox"
                  checked={Boolean(rules[item.id])}
                  onChange={() => toggle(item.id)}
                  aria-checked={Boolean(rules[item.id])}
                />
                <span className="toggle-track" aria-hidden="true" />
              </label>
            </div>
          ))
        )}
      </div>

      <div className="section-card-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {success ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--status-success)", fontSize: "0.82rem", fontWeight: 600 }}>
            <Check size={16} aria-hidden="true" />
            <span>Notification Preferences Saved in PostgreSQL!</span>
          </div>
        ) : <div />}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="btn btn-primary btn-md"
        >
          {saving ? "Saving to DB..." : "Save Preferences"}
        </button>
      </div>
    </section>
  );
};
