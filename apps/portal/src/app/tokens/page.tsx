"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Copy, Check, Key, Plus, Trash2, AlertTriangle } from "lucide-react";

export default function TokensPage() {
  const [tokenName, setTokenName]       = useState("");
  const [tokenExpiry, setTokenExpiry]   = useState("90");
  const [copiedCurl, setCopiedCurl]     = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken]   = useState(false);

  const curlSnippet = `curl -H "Authorization: Bearer kd_pat_live_••••••••" \\
  https://api.kodedock.com/portal/download/{slug} \\
  -o package.zip`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlSnippet);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyToken = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim()) return;
    const hex = Array.from(crypto.getRandomValues(new Uint8Array(18)))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    setGeneratedToken(`kd_pat_live_${hex}`);
    setTokenName("");
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="page-eyebrow">CLI & Automation Access</div>
        <h1 className="page-title">
          API &<br />
          <span style={{ color: "var(--accent-cyan)" }}>Personal Tokens</span>
        </h1>
        <p className="page-subtitle">
          Download purchased source code directly inside GitHub Actions, Docker builds, and automated CI/CD pipelines using signed access tokens.
        </p>
      </motion.div>

      {/* Terminal Usage Guide */}
      <motion.section
        className="section-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="section-card-header">
          <div>
            <div className="card-title">Terminal & CI/CD Download Protocol</div>
            <div className="card-desc">
              Authenticated curl command to pull source archives directly from terminal without browser auth.
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Terminal size={20} color="var(--accent-cyan)" aria-hidden="true" />
          </div>
        </div>
        <div className="section-card-body">
          <div
            style={{
              background: "#04050A",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem 1.5rem",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <pre
              className="font-mono text-secondary"
              style={{ fontSize: "0.78rem", lineHeight: 1.8, whiteSpace: "pre-wrap", flex: 1 }}
            >
              <span style={{ color: "var(--accent-primary)" }}>$ </span>
              {curlSnippet}
            </pre>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopyCurl}
              style={{ flexShrink: 0, marginTop: "0.15rem" }}
              aria-label="Copy curl command"
            >
              {copiedCurl
                ? <><Check size={13} color="var(--status-success)" aria-hidden="true" /><span>Copied</span></>
                : <><Copy size={13} aria-hidden="true" /><span>Copy</span></>
              }
            </button>
          </div>
        </div>
      </motion.section>

      {/* Generate Token */}
      <motion.section
        className="section-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="section-card-header">
          <div>
            <div className="card-title">Create Personal Access Token</div>
            <div className="card-desc">
              Personal tokens authenticate your scripts and command-line tools with full buyer privileges.
            </div>
          </div>
          <Key size={20} color="var(--accent-primary)" aria-hidden="true" />
        </div>

        <div className="section-card-body">
          <form onSubmit={handleGenerate}>
            <div className="form-grid-2" style={{ marginBottom: "1.25rem" }}>
              <div className="form-group">
                <label htmlFor="token-name" className="form-label">Token Identifier</label>
                <input
                  id="token-name"
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="e.g. Production CI Dockerfile"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="token-expiry" className="form-label">Expiration</label>
                <select
                  id="token-expiry"
                  className="form-select"
                  value={tokenExpiry}
                  onChange={(e) => setTokenExpiry(e.target.value)}
                >
                  <option value="30">30 days</option>
                  <option value="90">90 days (Recommended)</option>
                  <option value="365">1 year</option>
                  <option value="never">No Expiration</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary btn-md">
                <Plus size={15} aria-hidden="true" />
                <span>Generate Access Token</span>
              </button>
            </div>
          </form>

          {/* Generated Token Banner */}
          <AnimatePresence>
            {generatedToken && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  marginTop: "1.5rem",
                  padding: "1.25rem",
                  background: "var(--success-subtle)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <Check size={16} color="var(--status-success)" aria-hidden="true" />
                  <span style={{ fontWeight: 700, color: "var(--status-success)", fontSize: "0.875rem" }}>
                    Token Generated — Copy it now, you won't see it again.
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    background: "#04050A",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem 1rem",
                    marginTop: "0.75rem",
                  }}
                >
                  <code className="font-mono" style={{ color: "var(--accent-cyan)", fontSize: "0.82rem", flex: 1, wordBreak: "break-all" }}>
                    {generatedToken}
                  </code>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={handleCopyToken}
                    aria-label="Copy generated access token"
                  >
                    {copiedToken
                      ? <Check size={15} color="var(--status-success)" aria-hidden="true" />
                      : <Copy size={15} aria-hidden="true" />
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        style={{
          display: "flex",
          gap: "0.75rem",
          padding: "1rem 1.25rem",
          background: "var(--warning-subtle)",
          border: "1px solid rgba(245, 158, 11, 0.25)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <AlertTriangle size={18} color="var(--status-warning)" style={{ flexShrink: 0, marginTop: "1px" }} aria-hidden="true" />
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--status-warning)" }}>Security notice:</strong>{" "}
          Personal access tokens grant full buyer-level access to your KodeDock account. Store them in CI environment secrets, never in version-controlled code or public repositories.
        </p>
      </motion.div>
    </div>
  );
}
