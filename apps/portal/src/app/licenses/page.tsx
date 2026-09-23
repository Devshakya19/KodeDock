"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { LicenseItem } from "../../types/portal";
import {
  Key,
  ShieldCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  Globe,
  Shield,
} from "lucide-react";

const statVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } as any,
  }),
};

export default function LicensesPage() {
  const [licenses, setLicenses]     = useState<LicenseItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [copiedKey, setCopiedKey]   = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/portal/licenses")
      .then((r) => r.json())
      .then((d) => { if (d.success && Array.isArray(d.data)) setLicenses(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleVisibility = (id: string) =>
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeCount   = licenses.filter((l) => l.status === "ACTIVE").length;
  const revokedCount  = licenses.filter((l) => l.status === "REVOKED").length;

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="page-eyebrow">Cryptographic License Vault</div>
        <h1 className="page-title">
          Software Keys &<br />
          <span style={{ color: "var(--accent-cyan)" }}>Activation Scope</span>
        </h1>
        <p className="page-subtitle">
          Ed25519 signed license keys for every acquisition. Manage domain boundaries, reveal full keys, and verify cryptographic integrity.
        </p>
      </motion.div>

      {/* Stats Bento */}
      {!loading && (
        <div className="stats-bento">
          {[
            {
              icon: Key,
              label: "Active Keys",
              value: activeCount.toString(),
              meta: "Ed25519 Signed — PostgreSQL 16",
              variant: "green",
            },
            {
              icon: Shield,
              label: "Key Format",
              value: "KD-XXXX",
              meta: "Cryptographic Prefix Standard",
              variant: "cyan",
            },
            {
              icon: Globe,
              label: "Activation Scope",
              value: "∞",
              meta: "Unlimited Dev & Production Deploys",
              variant: "purple",
            },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                className={`stat-cell ${s.variant}`}
                custom={i}
                variants={statVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="stat-cell-icon">
                  <Icon size={16} aria-hidden="true" />
                </div>
                <div className="stat-label">{s.label}</div>
                <div className={`stat-value ${s.variant}`}>{s.value}</div>
                <div className="stat-meta">{s.meta}</div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" aria-label="Decrypting license vault" />
          <p>Decrypting License Vault...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && licenses.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Key size={24} aria-hidden="true" />
          </div>
          <h2 className="empty-title">No Licenses Issued Yet</h2>
          <p className="empty-desc">
            License keys are cryptographically generated when you purchase software on the KodeDock marketplace.
          </p>
        </div>
      )}

      {/* License Vault Table */}
      {!loading && licenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="data-table-wrap"
        >
          <table className="data-table" aria-label="License vault">
            <thead>
              <tr>
                <th scope="col">Software Product</th>
                <th scope="col">License Key</th>
                <th scope="col">Tier</th>
                <th scope="col">Status</th>
                <th scope="col">Allowed Domains</th>
                <th scope="col" style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((lic) => {
                const isVisible = visibleKeys[lic.id];
                const isCopied  = copiedKey === lic.licenseKey;
                const masked    = lic.licenseKey.slice(0, 7) + "••••-••••-••••";

                return (
                  <motion.tr
                    key={lic.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Product */}
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.2rem" }}>
                        {lic.productTitle}
                      </div>
                      <div className="font-mono text-muted" style={{ fontSize: "0.68rem" }}>
                        Issued: {new Date(lic.issuedAt).toLocaleDateString("en-IN")}
                      </div>
                    </td>

                    {/* License Key */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className="mono-key" style={{ fontSize: "0.75rem" }}>
                          {isVisible ? lic.licenseKey : masked}
                        </span>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => toggleVisibility(lic.id)}
                          title={isVisible ? "Hide Key" : "Reveal Key"}
                          aria-label={isVisible ? "Hide license key" : "Reveal license key"}
                        >
                          {isVisible
                            ? <EyeOff size={14} aria-hidden="true" />
                            : <Eye size={14} aria-hidden="true" />
                          }
                        </button>
                      </div>
                    </td>

                    {/* Tier */}
                    <td>
                      <span className="pill pill-purple">{lic.licenseType}</span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`pill ${lic.status === "ACTIVE" ? "pill-success" : "pill-danger"}`}>
                        <ShieldCheck size={10} aria-hidden="true" />
                        {lic.status}
                      </span>
                    </td>

                    {/* Domains */}
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                        {lic.allowedDomains.length > 0
                          ? lic.allowedDomains.map((dom) => (
                              <span key={dom} className="chip">
                                <Globe size={10} aria-hidden="true" />
                                {dom}
                              </span>
                            ))
                          : <span className="text-muted" style={{ fontSize: "0.78rem" }}>Unlimited</span>
                        }
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCopy(lic.licenseKey)}
                        aria-label={`Copy license key for ${lic.productTitle}`}
                      >
                        {isCopied
                          ? <><Check size={13} color="var(--status-success)" aria-hidden="true" /><span>Copied</span></>
                          : <><Copy size={13} aria-hidden="true" /><span>Copy Key</span></>
                        }
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
