"use client";

import React, { useState } from "react";
import { Globe, Plus, X } from "lucide-react";

export const DomainAllowlistSettings: React.FC = () => {
  const [domains, setDomains] = useState<string[]>(["mydomain.com", "staging.myapp.dev"]);
  const [newDomain, setNewDomain] = useState("");

  const addDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDomain.trim().toLowerCase();
    if (trimmed && !domains.includes(trimmed)) {
      setDomains((prev) => [...prev, trimmed]);
      setNewDomain("");
    }
  };

  const removeDomain = (d: string) =>
    setDomains((prev) => prev.filter((x) => x !== d));

  return (
    <section className="section-card" id="settings-domain-allowlist">
      <div className="section-card-header">
        <div>
          <div className="card-title">Domain Allowlist</div>
          <div className="card-desc">
            Restrict license activation to specific domains. Licenses will only activate on listed hostnames.
          </div>
        </div>
        <Globe size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
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
              No domain restrictions — license activates on any hostname.
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
                placeholder="yourdomain.com"
                className="form-input font-mono"
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="submit" className="btn btn-primary btn-md">
                <Plus size={15} aria-hidden="true" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="section-card-footer">
        <button type="button" className="btn btn-primary btn-md">Save Allowlist</button>
      </div>
    </section>
  );
};
