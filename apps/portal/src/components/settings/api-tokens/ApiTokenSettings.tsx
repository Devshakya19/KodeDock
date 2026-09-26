"use client";

import React, { useState, useEffect } from "react";
import { Key, Plus, Trash2, Check } from "lucide-react";

interface Token {
  id: string;
  name: string;
  tokenMasked: string;
  createdAt: string;
  expiresIn: string;
}

export const ApiTokenSettings: React.FC = () => {
  const [tokens, setTokens]     = useState<Token[]>([]);
  const [loading, setLoading]   = useState(true);
  const [newName, setNewName]   = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTokens = () => {
    setLoading(true);
    fetch("/api/portal/tokens")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setTokens(d.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/portal/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), expiryDays: 90 }),
      });
      const data = await res.json();
      if (data.success) {
        setNewName("");
        fetchTokens();
      }
    } catch {
      // Fallback
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string) => {
    try {
      await fetch(`/api/portal/tokens?id=${id}`, { method: "DELETE" });
      fetchTokens();
    } catch {
      setTokens((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <section className="section-card" id="settings-api-tokens">
      <div className="section-card-header">
        <div>
          <div className="card-title">API &amp; CLI Access Keys</div>
          <div className="card-desc">Personal access tokens stored in PostgreSQL for automated CI/CD downloads and API access.</div>
        </div>
        <Key size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        {loading && (
          <div className="font-mono text-muted" style={{ fontSize: "0.78rem", padding: "1rem 0" }}>
            Fetching PostgreSQL API Keys...
          </div>
        )}

        {!loading && tokens.length === 0 && (
          <div className="text-muted" style={{ fontSize: "0.82rem", padding: "0.5rem 0 1.5rem" }}>
            No personal access tokens generated in PostgreSQL yet.
          </div>
        )}

        {/* Existing tokens */}
        {!loading && tokens.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            {tokens.map((tok, i) => (
              <div
                key={tok.id}
                className="toggle-row"
                style={{ borderBottom: i < tokens.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
              >
                <div>
                  <div className="toggle-name">{tok.name}</div>
                  <div className="toggle-desc font-mono" style={{ fontSize: "0.68rem" }}>
                    {tok.tokenMasked} · Expires {tok.expiresIn}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => revoke(tok.id)}
                  aria-label={`Revoke token: ${tok.name}`}
                >
                  <Trash2 size={13} aria-hidden="true" />
                  <span>Revoke</span>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="divider" />

        {/* Create new token */}
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.85rem" }}>
          Create New Token
        </h3>
        <form onSubmit={handleCreate}>
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="new-token-name" className="form-label">Token Name</label>
              <input
                id="new-token-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Staging Deploy Script"
                className="form-input"
                required
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="submit" disabled={creating} className="btn btn-primary btn-md w-full">
                <Plus size={15} aria-hidden="true" />
                <span>{creating ? "Generating..." : "Generate Token"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};
