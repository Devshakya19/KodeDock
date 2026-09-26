"use client";

import React, { useState, useEffect } from "react";
import { User, Check } from "lucide-react";

export const AccountSettings: React.FC = () => {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    fetch("/api/portal/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setName(d.data.name || "");
          setEmail(d.data.email || "");
          setUsername(d.data.username || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      // Fallback
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-card" id="settings-account">
      <div className="section-card-header">
        <div>
          <div className="card-title">Account Information</div>
          <div className="card-desc">Update your real developer profile stored in PostgreSQL database.</div>
        </div>
        <User size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <form onSubmit={handleSave}>
        <div className="section-card-body">
          {loading ? (
            <div style={{ padding: "1.5rem", textTransform: "uppercase", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Syncing PostgreSQL Account Data...
            </div>
          ) : (
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="account-name" className="form-label">Full Name</label>
                <input
                  id="account-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="account-username" className="form-label">Developer Handle</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <span style={{ position: "absolute", left: "0.85rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.88rem" }}>@</span>
                  <input
                    id="account-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: "1.75rem" }}
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="account-email" className="form-label">Primary Email (Verified)</label>
                <input
                  id="account-email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="form-input"
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="account-timezone" className="form-label">Timezone</label>
                <select id="account-timezone" className="form-select" defaultValue="Asia/Kolkata">
                  <option value="Asia/Kolkata">Asia/Kolkata (IST — UTC+05:30)</option>
                  <option value="America/New_York">America/New_York (EST — UTC-05:00)</option>
                  <option value="Europe/London">Europe/London (GMT — UTC+00:00)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="section-card-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {success ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--status-success)", fontSize: "0.82rem", fontWeight: 600 }}>
              <Check size={16} aria-hidden="true" />
              <span>PostgreSQL Account Profile Saved!</span>
            </div>
          ) : <div />}

          <button type="submit" disabled={saving || loading} className="btn btn-primary btn-md">
            {saving ? "Saving to DB..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
};
