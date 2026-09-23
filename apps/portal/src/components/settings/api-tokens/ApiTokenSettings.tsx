"use client";

import React, { useState } from "react";
import { Key, Plus, Trash2 } from "lucide-react";

interface Token {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  expiresAt: string;
}

const MOCK_TOKENS: Token[] = [
  { id: "t1", name: "Production CI Pipeline", prefix: "kd_pat_live_a8f1", createdAt: "2026-09-01", expiresAt: "2026-12-01" },
  { id: "t2", name: "GitHub Actions Deploy",   prefix: "kd_pat_live_c3e9", createdAt: "2026-08-15", expiresAt: "2027-08-15" },
];

export const ApiTokenSettings: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>(MOCK_TOKENS);
  const [newName, setNewName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const hex = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((b) => b.toString(16).padStart(2, "0")).join("");
    setTokens((prev) => [
      ...prev,
      {
        id: hex,
        name: newName.trim(),
        prefix: `kd_pat_live_${hex}`,
        createdAt: new Date().toISOString().slice(0, 10),
        expiresAt: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      },
    ]);
    setNewName("");
  };

  const revoke = (id: string) =>
    setTokens((prev) => prev.filter((t) => t.id !== id));

  return (
    <section className="section-card" id="settings-api-tokens">
      <div className="section-card-header">
        <div>
          <div className="card-title">API & CLI Tokens</div>
          <div className="card-desc">Personal access tokens for automated CI/CD downloads and API access.</div>
        </div>
        <Key size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        {/* Existing tokens */}
        {tokens.length > 0 && (
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
                    {tok.prefix}•••• · Expires {tok.expiresAt}
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
              <button type="submit" className="btn btn-primary btn-md w-full">
                <Plus size={15} aria-hidden="true" />
                <span>Generate Token</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};
