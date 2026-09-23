"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PurchasedProduct } from "../types/portal";
import {
  Download,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  X,
  ExternalLink,
  Package,
  Key,
  Zap,
} from "lucide-react";

// Framer Motion stagger variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } as any,
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } as any,
  }),
};

export default function LibraryPage() {
  const [products, setProducts] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<{
    slug: string; title: string; downloadUrl: string;
    sha256: string; version: string; expiresIn: number;
  } | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portal/library")
      .then((r) => r.json())
      .then((d) => { if (d.success && Array.isArray(d.data)) setProducts(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copySnippet = (slug: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(slug);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const requestDownload = async (product: PurchasedProduct) => {
    setDownloadLoading(product.slug);
    try {
      const res = await fetch(`/api/portal/download/${product.slug}`, { method: "POST" });
      const data = await res.json();
      if (data.success && data.data) {
        setActiveModal({
          slug: product.slug,
          title: product.title,
          downloadUrl: data.data.downloadUrl,
          sha256: data.data.checksumSha256,
          version: data.data.version,
          expiresIn: data.data.expiresInSeconds,
        });
      } else {
        alert(data.error?.message || "Failed to generate signed download URL");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setDownloadLoading(null);
    }
  };

  const activeCount = products.filter((p) => p.licenseStatus === "ACTIVE").length;

  return (
    <div className="page-container">
      {/* Page Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="page-eyebrow">My Software Library</div>
        <h1 className="page-title">
          Acquired<br />
          <span style={{ color: "var(--accent-primary)" }}>Codebase Vault</span>
        </h1>
        <p className="page-subtitle">
          Production boilerplates, SaaS kits, and AI agents — all your KodeDock acquisitions with signed 60‑second download links and Ed25519 license keys.
        </p>
      </motion.div>

      {/* Stats Bento */}
      {!loading && (
        <div className="stats-bento">
          {[
            {
              icon: Package,
              label: "Software Acquired",
              value: products.length.toString(),
              meta: "Commercial & Extended Licenses",
              variant: "purple",
            },
            {
              icon: Key,
              label: "Active Licenses",
              value: activeCount.toString(),
              meta: "100% Cryptographically Verified",
              variant: "green",
            },
            {
              icon: Zap,
              label: "Delivery Protocol",
              value: "60s",
              meta: "SHA-256 Tamper-Proof Signed Links",
              variant: "cyan",
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
          <div className="spinner" aria-label="Loading library" />
          <p>Querying PostgreSQL 16 Order Vault...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Package size={24} aria-hidden="true" />
          </div>
          <h2 className="empty-title">No Software Acquired Yet</h2>
          <p className="empty-desc">
            You haven't purchased any developer templates yet. Explore our verified marketplace to acquire SaaS boilerplates and AI agents.
          </p>
          <a
            href="http://localhost:3003"
            className="btn btn-primary btn-md"
            style={{ marginTop: "0.5rem" }}
          >
            <span>Explore Marketplace</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      )}

      {/* Library Grid */}
      {!loading && products.length > 0 && (
        <motion.div
          className="library-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {products.map((item) => {
            const keyCopied     = copiedKey === item.licenseKey;
            const snippetCopied = copiedSnippet === item.slug;
            const quickSnippet  = `pnpm install && cp .env.example .env.local`;

            return (
              <motion.article
                key={item.orderId}
                className="library-card"
                variants={cardVariants}
                whileHover={{ y: -2 }}
              >
                {/* Card Header */}
                <div className="library-card-head">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="lib-thumb"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="lib-card-meta">
                    <div className="lib-tag-row">
                      <span className="pill pill-success">{item.licenseType}</span>
                      <span className="font-mono text-muted" style={{ fontSize: "0.65rem" }}>
                        v{item.latestVersion}
                      </span>
                    </div>
                    <div className="lib-card-title">{item.title}</div>
                    <div className="lib-card-tagline">{item.tagline}</div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="library-card-body">
                  {/* License Key */}
                  <div>
                    <div className="key-box-label">License Key</div>
                    <div className="mono-box">
                      <span className="mono-key">{item.licenseKey}</span>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => copyKey(item.licenseKey)}
                        title="Copy License Key"
                        aria-label="Copy license key"
                      >
                        {keyCopied
                          ? <Check size={15} color="var(--status-success)" aria-hidden="true" />
                          : <Copy size={15} aria-hidden="true" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Quickstart Command */}
                  <div>
                    <div className="key-box-label">Quickstart</div>
                    <div className="mono-box">
                      <div>
                        <span style={{ color: "var(--accent-primary)" }}>$ </span>
                        <span>{quickSnippet}</span>
                      </div>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => copySnippet(item.slug, quickSnippet)}
                        title="Copy command"
                        aria-label="Copy quickstart command"
                      >
                        {snippetCopied
                          ? <Check size={14} color="var(--status-success)" aria-hidden="true" />
                          : <Copy size={14} aria-hidden="true" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="tech-stack-row">
                    {item.techStack.map((tech) => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="library-card-footer">
                  <motion.button
                    type="button"
                    className="btn btn-primary btn-md w-full"
                    disabled={downloadLoading === item.slug}
                    onClick={() => requestDownload(item)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download size={15} aria-hidden="true" />
                    <span>
                      {downloadLoading === item.slug ? "Signing Link…" : "Download (.ZIP)"}
                    </span>
                  </motion.button>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}

      {/* 60s Signed Download Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dl-modal-title"
            >
              {/* Modal Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <ShieldCheck size={20} color="var(--status-success)" aria-hidden="true" />
                  <h2 id="dl-modal-title" className="card-title" style={{ margin: 0 }}>Signed Download Ready</h2>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setActiveModal(null)}
                  aria-label="Close download modal"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                A temporary cryptographic URL has been signed by the KodeDock API Gateway for{" "}
                <strong style={{ color: "var(--text-primary)" }}>{activeModal.title}</strong> (v{activeModal.version}).
              </p>

              {/* Expiry info */}
              <div style={{
                padding: "1rem 1.25rem",
                background: "var(--bg-canvas-alt)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                marginBottom: "1.25rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--status-warning)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.6rem" }}>
                  <Clock size={14} aria-hidden="true" />
                  <span>Expires in {activeModal.expiresIn} seconds</span>
                </div>
                <div className="font-mono text-muted" style={{ fontSize: "0.68rem", wordBreak: "break-all" }}>
                  SHA-256: {activeModal.sha256}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <motion.a
                  href={activeModal.downloadUrl}
                  download
                  className="btn btn-primary btn-md"
                  style={{ flex: 1, textDecoration: "none" }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Download size={15} aria-hidden="true" />
                  <span>Start Direct Download</span>
                </motion.a>
                <button
                  type="button"
                  className="btn btn-secondary btn-md"
                  onClick={() => setActiveModal(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
