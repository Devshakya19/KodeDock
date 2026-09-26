"use client";

import React, { useState, useEffect } from "react";
import { Globe, Plus, X, Check } from "lucide-react";

export const DomainAllowlistSettings: React.FC = () => {
  const [domains, setDomains]     = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState(false);

  const fetchSettings = () => {
    setLoading(true);
    fetch("/api/portal/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data && Array.isArray(d.data.domainAllowlist)) {
          setDomains(d.data.domainAllowlist);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const addDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDomain.trim().toLowerCase();
    if (trimmed && !domains.includes(trimmed)) {
      const updated = [...domains, trimmed];
      setDomains(updated);
      setNewDomain("");
      saveAllowlist(updated);
    }
  };

  const removeDomain = (d: string) => {
    const updated = domains.filter((x) => x !== d);
    setDomains(updated);
    saveAllowlist(updated);
  };

  const saveAllowlist = async (listToSave: string[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainAllowlist: listToSave }),
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
    <section className="section-card" id="settings-domain-allowlist">
      <div className="section-card-header">
        <div>
          <div className="card-title">Domain Allowlist</div>
          <div className="card-desc">
            Restrict license activation to specific hostnames. Domain rules are stored in PostgreSQL.
          </div>
        </div>
        <Globe size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        {loading ? (
          <div className="font-mono text-muted" style={{ padding: "1.5rem 0", fontSize: "0.78rem" }}>
            Fetching PostgreSQL Domain Allowlist...
          </div>
        ) : (
          <>
            {/* Current domains */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem", minHeight: "2rem" }}>
              {domains.map((d) => (
                <span key={d} className="chip">
                  <Globe size={11} aria-hidden="true" />
                  {d}
                  <button
                    type="button"
                    className="chip-remove"
                    onClick={() => removeDomain(d)}
                    aria-label={`Remove domain ${d}`}
                  >
                    <X size={11} aria-hidden="true" />
                  </button>
                </span>
              ))}
              {domains.length === 0 && (
                <p className="text-muted" style={{ fontSize: "0.82rem" }}>
                  No domain restrictions stored in PostgreSQL — license activates on any hostname.
                </p>
              )}
            </div>

            <div className="divider" />

            {/* Add domain */}
            <form onSubmit={addDomain}>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="new-domain" className="form-label">Add Allowed Domain</label>
                  <input
                    id="new-domain"
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="e.g. app.myorganization.com"
                    className="form-input font-mono"
                  />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button type="submit" disabled={saving || !newDomain.trim()} className="btn btn-primary btn-md">
                    <Plus size={15} aria-hidden="true" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>

      <div className="section-card-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {success ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--status-success)", fontSize: "0.82rem", fontWeight: 600 }}>
            <Check size={16} aria-hidden="true" />
            <span>Domain Allowlist Saved in PostgreSQL!</span>
          </div>
        ) : <div />}

        <button
          type="button"
          onClick={() => saveAllowlist(domains)}
          disabled={saving || loading}
          className="btn btn-primary btn-md"
        >
          {saving ? "Saving to DB..." : "Save Allowlist"}
        </button>
      </div>
    </section>
  );
};
