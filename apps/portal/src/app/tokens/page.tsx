"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  Terminal,
  ShieldCheck,
  Copy,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  Code2,
  Clock,
  Lock,
  Layers,
  Activity,
  FileCode,
  X,
  Shield,
  Zap,
  CheckSquare,
  Square,
  Key,
} from "lucide-react";

interface ActiveTokenItem {
  id: string;
  name: string;
  tokenMasked: string;
  fullToken?: string;
  createdAt: string;
  expiresIn: string;
  scopes: string[];
  lastUsed: string;
  status: "ACTIVE" | "EXPIRING_SOON" | "REVOKED";
}

const INITIAL_TOKENS: ActiveTokenItem[] = [
  {
    id: "tok_1",
    name: "Production GitHub Actions Pipeline",
    tokenMasked: "kd_pat_live_8f3a9e••••••••4b12",
    createdAt: "Sep 20, 2026",
    expiresIn: "84 days remaining",
    scopes: ["read:library", "download:archives"],
    lastUsed: "2 mins ago",
    status: "ACTIVE",
  },
  {
    id: "tok_2",
    name: "Local Development CLI Runner",
    tokenMasked: "kd_pat_live_2c11d0••••••••9e77",
    createdAt: "Aug 15, 2026",
    expiresIn: "12 days remaining",
    scopes: ["read:library", "verify:licenses"],
    lastUsed: "Yesterday",
    status: "EXPIRING_SOON",
  },
];

const AVAILABLE_SCOPES = [
  { id: "read:library", label: "Read Library Items", desc: "Access purchased codebase metadata" },
  { id: "download:archives", label: "Download Source Archives", desc: "Generate 60-second signed ZIP links" },
  { id: "verify:licenses", label: "Verify License Keys", desc: "Check cryptographic Ed25519 signatures" },
  { id: "write:webhooks", label: "Webhook Notifications", desc: "Receive automated deployment webhooks" },
];

export default function TokensPage() {
  const [tokens, setTokens]             = useState<ActiveTokenItem[]>(INITIAL_TOKENS);
  const [tokenName, setTokenName]       = useState("");
  const [tokenExpiry, setTokenExpiry]   = useState("90");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["read:library", "download:archives"]);
  const [activeProtocolTab, setActiveProtocolTab] = useState<"curl" | "github" | "node">("curl");
  const [copiedCode, setCopiedCode]     = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken]   = useState(false);
  const [revokeModalToken, setRevokeModalToken] = useState<ActiveTokenItem | null>(null);

  const snippets = {
    curl: `curl -H "Authorization: Bearer kd_pat_live_••••••••" \\
  https://api.kodedock.com/portal/download/saas-boilerplate \\
  -o package.zip`,
    github: `name: Pull Licensed Source Code
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Download KodeDock Package
        env:
          KODEDOCK_PAT: \${{ secrets.KODEDOCK_PAT }}
        run: |
          curl -H "Authorization: Bearer $KODEDOCK_PAT" \\
            https://api.kodedock.com/portal/download/saas-boilerplate \\
            -o source.zip && unzip source.zip`,
    node: `import { KodeDockClient } from "@kodedock/sdk";

const client = new KodeDockClient({
  token: process.env.KODEDOCK_PAT_LIVE,
});

// Download signed package archive buffer
const zipBuffer = await client.downloads.getArchive("saas-boilerplate");
console.log("Package downloaded successfully", zipBuffer.byteLength);`,
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(snippets[activeProtocolTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleToggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    );
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim()) return;

    const hex = Array.from(crypto.getRandomValues(new Uint8Array(18)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const newTokenString = `kd_pat_live_${hex}`;

    const newEntry: ActiveTokenItem = {
      id: `tok_${Date.now()}`,
      name: tokenName.trim(),
      tokenMasked: `kd_pat_live_${hex.slice(0, 6)}••••••••${hex.slice(-4)}`,
      fullToken: newTokenString,
      createdAt: "Just now",
      expiresIn: tokenExpiry === "never" ? "Never" : `${tokenExpiry} days`,
      scopes: selectedScopes.length > 0 ? selectedScopes : ["read:library"],
      lastUsed: "Never",
      status: "ACTIVE",
    };

    setTokens([newEntry, ...tokens]);
    setGeneratedToken(newTokenString);
    setTokenName("");
  };

  const handleCopyGenerated = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleConfirmRevoke = () => {
    if (!revokeModalToken) return;
    setTokens((prev) =>
      prev.map((t) => (t.id === revokeModalToken.id ? { ...t, status: "REVOKED" } : t))
    );
    setRevokeModalToken(null);
  };

  const activeCount = tokens.filter((t) => t.status === "ACTIVE" || t.status === "EXPIRING_SOON").length;

  return (
    <div className="page-container">
      {/* ── Page Header ────────────────────────────────────────── */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="page-eyebrow">Programmatic Identity &amp; Automation Vault</div>
        <h1 className="page-title">
          API Keys &amp;<br />
          <span style={{ color: "var(--accent-cyan)" }}>Personal Access Tokens</span>
        </h1>
        <p className="page-subtitle">
          Authenticate CLI scripts, Docker build steps, and GitHub Actions pipelines to pull signed codebase archives automatically without browser interaction.
        </p>
      </motion.div>

      {/* ── Stats Bento Strip ────────────────────────────────────── */}
      <motion.div
        className="stats-bento"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="stat-cell purple">
          <div className="stat-cell-icon">
            <KeyRound size={16} aria-hidden="true" />
          </div>
          <div className="stat-label">Active Credentials</div>
          <div className="stat-value purple">{activeCount}</div>
          <div className="stat-meta">Scoped Personal Access Tokens</div>
        </div>

        <div className="stat-cell cyan">
          <div className="stat-cell-icon">
            <Activity size={16} aria-hidden="true" />
          </div>
          <div className="stat-label">API Rate Limit</div>
          <div className="stat-value cyan">10k/hr</div>
          <div className="stat-meta">High-throughput Gateway Rate</div>
        </div>

        <div className="stat-cell success">
          <div className="stat-cell-icon">
            <ShieldCheck size={16} aria-hidden="true" />
          </div>
          <div className="stat-label">Auth Protocol</div>
          <div className="stat-value green">Bearer</div>
          <div className="stat-meta">Cryptographically Hashed (SHA-256)</div>
        </div>

        <div className="stat-cell">
          <div className="stat-cell-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#F59E0B" }}>
            <Clock size={16} aria-hidden="true" />
          </div>
          <div className="stat-label">Default Rotation</div>
          <div className="stat-value" style={{ color: "#F59E0B" }}>90 Days</div>
          <div className="stat-meta">Automated Security Expiration</div>
        </div>
      </motion.div>

      {/* ── Multi-Protocol Code Terminal Guide ──────────────────── */}
      <motion.section
        className="section-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="section-card-header">
          <div>
            <div className="card-title">Terminal &amp; CI/CD Download Protocol</div>
            <div className="card-desc">
              Select your integration environment to view ready-to-copy automated download snippets.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Terminal size={18} color="var(--accent-cyan)" aria-hidden="true" />
          </div>
        </div>

        <div className="section-card-body">
          {/* Protocol Switcher Tabs */}
          <div className="token-tabs-bar">
            <button
              type="button"
              className={`token-tab-btn${activeProtocolTab === "curl" ? " active" : ""}`}
              onClick={() => setActiveProtocolTab("curl")}
            >
              <Terminal size={13} aria-hidden="true" />
              <span>cURL / Bash</span>
            </button>

            <button
              type="button"
              className={`token-tab-btn${activeProtocolTab === "github" ? " active" : ""}`}
              onClick={() => setActiveProtocolTab("github")}
            >
              <FileCode size={13} aria-hidden="true" />
              <span>GitHub Actions YML</span>
            </button>

            <button
              type="button"
              className={`token-tab-btn${activeProtocolTab === "node" ? " active" : ""}`}
              onClick={() => setActiveProtocolTab("node")}
            >
              <Code2 size={13} aria-hidden="true" />
              <span>Node.js / TS SDK</span>
            </button>
          </div>

          {/* Terminal Box */}
          <div className="token-terminal-box">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
              <pre
                className="font-mono text-secondary"
                style={{ fontSize: "0.8rem", lineHeight: 1.8, whiteSpace: "pre-wrap", flex: 1, margin: 0 }}
              >
                {activeProtocolTab === "curl" && <span style={{ color: "var(--accent-primary)" }}>$ </span>}
                {snippets[activeProtocolTab]}
              </pre>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopySnippet}
                style={{ flexShrink: 0 }}
                aria-label="Copy snippet to clipboard"
              >
                {copiedCode ? (
                  <>
                    <Check size={13} color="var(--status-success)" aria-hidden="true" />
                    <span style={{ color: "var(--status-success)" }}>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} aria-hidden="true" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Create Token Section ─────────────────────────────────── */}
      <motion.section
        className="section-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="section-card-header">
          <div>
            <div className="card-title">Generate New Access Token</div>
            <div className="card-desc">
              Create a unique personal access token for your automated build scripts or team members.
            </div>
          </div>
          <KeyRound size={20} color="var(--accent-primary)" aria-hidden="true" />
        </div>

        <div className="section-card-body">
          <form onSubmit={handleGenerate}>
            <div className="form-grid-2" style={{ marginBottom: "1.25rem" }}>
              {/* Token Name */}
              <div className="form-group">
                <label htmlFor="token-name" className="form-label">
                  Token Identifier / Description
                </label>
                <input
                  id="token-name"
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="e.g. Production Docker Builder"
                  className="form-input"
                  required
                />
              </div>

              {/* Expiration Selector */}
              <div className="form-group">
                <label htmlFor="token-expiry" className="form-label">
                  Expiration Policy
                </label>
                <select
                  id="token-expiry"
                  className="form-select"
                  value={tokenExpiry}
                  onChange={(e) => setTokenExpiry(e.target.value)}
                >
                  <option value="30">30 Days (Short-lived)</option>
                  <option value="90">90 Days (Recommended)</option>
                  <option value="365">1 Year</option>
                  <option value="never">No Expiration</option>
                </select>
              </div>
            </div>

            {/* Scopes Selection */}
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label" style={{ marginBottom: "0.6rem" }}>
                Access Scopes &amp; Privileges
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                {AVAILABLE_SCOPES.map((scope) => {
                  const isChecked = selectedScopes.includes(scope.id);
                  return (
                    <div
                      key={scope.id}
                      className={`scope-checkbox-label${isChecked ? " selected" : ""}`}
                      onClick={() => handleToggleScope(scope.id)}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                    >
                      {isChecked ? (
                        <CheckSquare size={16} color="var(--accent-primary)" aria-hidden="true" />
                      ) : (
                        <Square size={16} color="var(--text-muted)" aria-hidden="true" />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{scope.label}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{scope.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <motion.button
                type="submit"
                className="btn btn-primary btn-md"
                whileTap={{ scale: 0.97 }}
              >
                <Plus size={15} aria-hidden="true" />
                <span>Generate Secret Key</span>
              </motion.button>
            </div>
          </form>

          {/* Generated Secret Reveal Card */}
          <AnimatePresence>
            {generatedToken && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  marginTop: "1.75rem",
                  padding: "1.5rem",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.04) 100%)",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  borderRadius: "var(--radius-xl)",
                  boxShadow: "0 8px 32px rgba(16, 185, 129, 0.12)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Check size={18} color="var(--status-success)" aria-hidden="true" />
                    <span style={{ fontWeight: 700, color: "var(--status-success)", fontSize: "0.95rem" }}>
                      Access Token Generated Successfully!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneratedToken(null)}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                    aria-label="Close generated token notification"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>

                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  Make sure to copy your personal access token now. You will not be able to view it again!
                </p>

                <div className="mono-box" style={{ background: "#04050A", padding: "0.85rem 1.1rem" }}>
                  <code className="font-mono" style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", wordBreak: "break-all" }}>
                    {generatedToken}
                  </code>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={handleCopyGenerated}
                    title="Copy secret token"
                    aria-label="Copy generated token string"
                  >
                    {copiedToken ? (
                      <Check size={16} color="var(--status-success)" aria-hidden="true" />
                    ) : (
                      <Copy size={16} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ── Active Tokens Vault Inventory ───────────────────────── */}
      <motion.section
        className="section-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="section-card-header">
          <div>
            <div className="card-title">Active Access Tokens Vault</div>
            <div className="card-desc">
              Manage existing tokens authorized to access your KodeDock purchases.
            </div>
          </div>
          <Lock size={18} color="var(--accent-cyan)" aria-hidden="true" />
        </div>

        <div className="section-card-body">
          {tokens.length === 0 && (
            <div className="empty-state" style={{ padding: "2rem 1rem" }}>
              <div className="empty-icon">
                <KeyRound size={22} aria-hidden="true" />
              </div>
              <h2 className="empty-title">No Active Access Tokens</h2>
              <p className="empty-desc">Generate your first token above for CLI or CI/CD pipelines.</p>
            </div>
          )}

          {tokens.map((item) => {
            const isExpiring = item.status === "EXPIRING_SOON";
            const isRevoked  = item.status === "REVOKED";

            return (
              <div key={item.id} className="token-row-item">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.92rem", color: isRevoked ? "var(--text-muted)" : "var(--text-primary)" }}>
                      {item.name}
                    </span>

                    {/* Status Pill */}
                    {isRevoked ? (
                      <span className="pill" style={{ background: "var(--danger-subtle)", color: "var(--status-danger)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                        REVOKED
                      </span>
                    ) : isExpiring ? (
                      <span className="pill" style={{ background: "var(--warning-subtle)", color: "var(--status-warning)", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                        EXPIRING SOON
                      </span>
                    ) : (
                      <span className="pill pill-success">ACTIVE</span>
                    )}
                  </div>

                  {/* Masked Key & Scopes */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                    <code className="font-mono text-muted" style={{ fontSize: "0.78rem" }}>
                      {item.tokenMasked}
                    </code>
                    {item.scopes.map((sc) => (
                      <span key={sc} className="scope-chip">{sc}</span>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="font-mono text-muted" style={{ fontSize: "0.68rem" }}>
                    Created: {item.createdAt} • {item.expiresIn} • Last used: {item.lastUsed}
                  </div>
                </div>

                {/* Revoke Action */}
                {!isRevoked && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setRevokeModalToken(item)}
                    aria-label={`Revoke token ${item.name}`}
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    <span>Revoke</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ── Security Advice Banner ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.34 }}
        style={{
          display: "flex",
          gap: "0.85rem",
          padding: "1.25rem 1.5rem",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <Shield size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text-primary)" }}>Token Security Guidance:</strong>{" "}
          Personal access tokens grant full buyer-level access to your KodeDock account. Store them securely in secret environment variables (e.g. <code className="font-mono" style={{ color: "var(--accent-cyan)" }}>KODEDOCK_PAT_TOKEN</code>), never commit them to public Git repositories.
        </div>
      </motion.div>

      {/* ── Revoke Confirmation Modal ───────────────────────────── */}
      <AnimatePresence>
        {revokeModalToken && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRevokeModalToken(null)}
          >
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="revoke-modal-title"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <AlertTriangle size={20} color="var(--status-danger)" aria-hidden="true" />
                <h2 id="revoke-modal-title" className="card-title" style={{ margin: 0, color: "var(--status-danger)" }}>
                  Revoke Access Token?
                </h2>
              </div>

              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                Are you sure you want to revoke <strong style={{ color: "var(--text-primary)" }}>"{revokeModalToken.name}"</strong>? Any script or CI/CD pipeline using this token will immediately lose access.
              </p>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-md"
                  onClick={() => setRevokeModalToken(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger-solid btn-md"
                  onClick={handleConfirmRevoke}
                >
                  Confirm Revoke
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

