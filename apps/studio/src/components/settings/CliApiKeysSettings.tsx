"use client";

import React, { useState, useEffect } from "react";
import { Key, Plus, Trash2, Copy, Check, Terminal, ShieldAlert, Sparkles } from "lucide-react";

interface StudioToken {
  id: string;
  name: string;
  tokenMasked: string;
  createdAt: string;
  expiresIn: string;
  scopes: string[];
  lastUsed: string;
  status: string;
}

export const CliApiKeysSettings: React.FC = () => {
  const [tokens, setTokens]             = useState<StudioToken[]>([]);
  const [loading, setLoading]           = useState(true);
  const [newName, setNewName]           = useState("");
  const [expiryDays, setExpiryDays]     = useState<string>("180");
  const [scopes, setScopes]             = useState<string[]>([
    "packages:write",
    "releases:publish",
    "telemetry:read",
  ]);
  const [creating, setCreating]         = useState(false);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);
  const [copied, setCopied]             = useState(false);
  const [errorMsg, setErrorMsg]         = useState<string | null>(null);

  const fetchTokens = () => {
    setLoading(true);
    fetch("/api/studio/api-keys")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setTokens(d.data);
        }
      })
      .catch(() => {
        setErrorMsg("Failed to load CLI tokens from PostgreSQL");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/studio/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          expiryDays: expiryDays === "never" ? "never" : Number(expiryDays),
          scopes,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        setNewlyCreatedToken(data.data.token);
        setNewName("");
        fetchTokens();
      } else {
        setErrorMsg(data.error?.message || "Failed to generate token");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while creating CLI token");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this deployment token? Any CI/CD pipelines using this key will immediately fail.")) {
      return;
    }
    try {
      await fetch(`/api/studio/api-keys?id=${id}`, { method: "DELETE" });
      fetchTokens();
    } catch {
      setTokens((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleScope = (scope: string) => {
    if (scopes.includes(scope)) {
      setScopes(scopes.filter((s) => s !== scope));
    } else {
      setScopes([...scopes, scope]);
    }
  };

  return (
    <section className="section-card" id="settings-cli-keys">
      <div className="section-card-header">
        <div>
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Studio CLI Deployment Tokens</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.2rem 0.5rem",
                fontSize: "0.68rem",
                fontFamily: "var(--font-mono)",
                background: "rgba(56, 189, 248, 0.12)",
                color: "var(--accent-cyan)",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}
            >
              <Terminal size={11} /> HEADLESS PUBLISHING
            </span>
          </div>
          <div className="card-desc">
            Cryptographic access keys for the KodeDock CLI (`kodedock deploy`, `kodedock release`) and GitHub Actions CI pipelines.
          </div>
        </div>
        <Key size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        {errorMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              borderRadius: "var(--radius-md)",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "var(--status-danger)",
              fontSize: "0.82rem",
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Newly Created Token One-Time Reveal Banner */}
        {newlyCreatedToken && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1.25rem",
              borderRadius: "var(--radius-lg)",
              background: "rgba(139, 92, 246, 0.08)",
              border: "1.5px solid var(--accent-primary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-primary)", marginBottom: "0.5rem" }}>
              <ShieldAlert size={16} />
              <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                Secret Deployment Key Generated — Copy Immediately
              </span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
              For cryptographic safety, this token is stored as a SHA-256 hash in PostgreSQL and can never be retrieved again.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(0,0,0,0.5)",
                padding: "0.5rem 0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <code
                style={{
                  flex: 1,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.82rem",
                  color: "var(--accent-cyan)",
                  wordBreak: "break-all",
                }}
              >
                {newlyCreatedToken}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(newlyCreatedToken)}
                className="btn btn-secondary"
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.75rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                {copied ? <Check size={12} color="var(--accent-cyan)" /> : <Copy size={12} />}
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
          </div>
        )}

        {/* Existing Tokens Table */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
            Active PostgreSQL CLI Deployment Tokens
          </div>

          {loading ? (
            <div style={{ padding: "1rem 0", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Fetching Deployment Keys from PostgreSQL...
            </div>
          ) : tokens.length === 0 ? (
            <div
              style={{
                padding: "1.5rem",
                textAlign: "center",
                background: "rgba(255,255,255,0.015)",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--border-subtle)",
                color: "var(--text-muted)",
                fontSize: "0.82rem",
              }}
            >
              No active CLI deployment keys found in PostgreSQL. Generate one below to deploy from terminal or CI.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {tokens.map((tok) => (
                <div
                  key={tok.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1rem",
                    background: "var(--bg-surface-elevated)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)" }}>{tok.name}</span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontFamily: "var(--font-mono)",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "var(--radius-sm)",
                          background: tok.status === "ACTIVE" ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
                          color: tok.status === "ACTIVE" ? "var(--status-success)" : "var(--status-danger)",
                        }}
                      >
                        {tok.status}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginTop: "0.3rem",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.74rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <span style={{ color: "var(--accent-cyan)" }}>{tok.tokenMasked}</span>
                      <span>•</span>
                      <span>Expires: {tok.expiresIn}</span>
                      <span>•</span>
                      <span>Last used: {tok.lastUsed}</span>
                    </div>
                    {tok.scopes && tok.scopes.length > 0 && (
                      <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.4rem" }}>
                        {tok.scopes.map((sc) => (
                          <span
                            key={sc}
                            style={{
                              fontSize: "0.65rem",
                              fontFamily: "var(--font-mono)",
                              background: "rgba(255,255,255,0.04)",
                              padding: "0.1rem 0.4rem",
                              borderRadius: "var(--radius-xs)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {sc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRevoke(tok.id)}
                    title="Revoke Token"
                    className="btn btn-ghost"
                    style={{
                      padding: "0.4rem",
                      color: "var(--status-danger)",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Token Form */}
        <form
          onSubmit={handleCreate}
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
          }}
        >
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Plus size={15} color="var(--accent-primary)" />
            Generate New Deployment Token
          </div>

          <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="token-name" className="form-label">Token Name / Purpose</label>
              <input
                id="token-name"
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="form-input"
                placeholder="e.g. GitHub Actions Release Pipeline"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="token-expiry" className="form-label">Expiration Window</label>
              <select
                id="token-expiry"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="form-input font-mono"
              >
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="180">180 Days (Recommended)</option>
                <option value="365">365 Days</option>
                <option value="never">Never (Persistent)</option>
              </select>
            </div>
          </div>

          {/* Scopes */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" style={{ marginBottom: "0.4rem" }}>Authorized Scopes</label>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {[
                { id: "packages:write", label: "packages:write", desc: "Upload and update architecture listings" },
                { id: "releases:publish", label: "releases:publish", desc: "Publish new version tags and archives" },
                { id: "telemetry:read", label: "telemetry:read", desc: "Read sales metrics and download telemetry" },
              ].map((item) => (
                <label
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={scopes.includes(item.id)}
                    onChange={() => toggleScope(item.id)}
                  />
                  <span style={{ fontFamily: "var(--font-mono)", color: scopes.includes(item.id) ? "var(--accent-cyan)" : "inherit" }}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="btn btn-primary"
            style={{
              padding: "0.5rem 1.25rem",
              fontSize: "0.82rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {creating ? (
              <>
                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                GENERATING KEY...
              </>
            ) : (
              <>
                <Sparkles size={13} />
                GENERATE DEPLOYMENT KEY
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};
