"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GitBranch,
  Sparkles,
  Package,
  CheckCircle2,
  Clock,
  Terminal,
  FileCode,
  ArrowRight,
  ShieldCheck,
  Plus,
} from "lucide-react";
import type { CreatorRelease, CreatorProduct } from "@/types/studio";

function ReleasesContent() {
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get("productId") || "";

  const [releases, setReleases] = useState<CreatorRelease[]>([]);
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>(preselectedProductId);
  const [newVersion, setNewVersion] = useState("v1.1.0");
  const [storageKey, setStorageKey] = useState("");
  const [checksumSha256, setChecksumSha256] = useState("");
  const [changelog, setChangelog] = useState("");

  useEffect(() => {
    fetch("/api/studio/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setProducts(d.data);
          if (!selectedProductId && d.data.length > 0) {
            setSelectedProductId(d.data[0].id);
          }
        }
      })
      .catch(() => {});

    fetch("/api/studio/releases")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setReleases(d.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !newVersion.trim() || !storageKey.trim() || !checksumSha256.trim()) {
      setErrorMessage("Please fill all required release parameters.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      productId: selectedProductId,
      version: newVersion.trim(),
      storage_key: storageKey.trim(),
      checksum_sha256: checksumSha256.trim(),
      changelog: changelog.trim(),
    };

    try {
      const res = await fetch("/api/studio/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setShowNewModal(false);
        // Refresh list
        const refreshed = await fetch("/api/studio/releases").then((r) => r.json());
        if (refreshed.success) setReleases(refreshed.data);
      } else {
        setErrorMessage(json.error?.message || "Failed to create release.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="page-eyebrow">
              <GitBranch size={12} color="var(--accent-primary)" />
              <span>Version Control &amp; Changelogs</span>
            </div>
            <h1 className="page-title">
              Software <span style={{ color: "var(--accent-primary)" }}>Releases</span>
            </h1>
            <p className="page-subtitle">
              Push updates to your codebases. Verified buyers automatically receive update notifications and new download links in their portal.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="btn btn-primary"
            style={{ padding: "0.6rem 1.25rem", fontSize: "0.82rem" }}
          >
            <Plus size={15} />
            <span>New Version Release</span>
          </button>
        </div>
      </div>

      {/* ── Releases Timeline List ────────────────────────────────────────── */}
      {releases.length === 0 ? (
        <div className="portal-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <GitBranch size={36} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontFamily: "var(--font-display)", color: "#ffffff", fontSize: "1.35rem", marginBottom: "0.5rem" }}>
            No Releases Registered Yet
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", maxWidth: "460px", margin: "0 auto 1.5rem" }}>
            When you publish a new template or push an update version, your version changelog and SHA-256 hashes will be archived here.
          </p>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="btn btn-primary"
            style={{ display: "inline-flex", padding: "0.6rem 1.25rem" }}
          >
            <Plus size={15} />
            <span>Draft First Release</span>
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {releases.map((rel) => (
            <div key={rel.id} className="portal-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "#ffffff" }}>
                      {rel.productTitle}
                    </h3>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--accent-cyan)",
                        background: "rgba(56, 189, 248, 0.12)",
                        border: "1px solid rgba(56, 189, 248, 0.25)",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                      }}
                    >
                      {rel.version}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    Released on {new Date(rel.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: "var(--status-success)", background: "rgba(16, 185, 129, 0.08)", padding: "0.25rem 0.6rem", borderRadius: "4px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <ShieldCheck size={14} />
                  <span>Verified Cryptographic Release</span>
                </div>
              </div>

              {/* Changelog Box */}
              <div style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "0.35rem" }}>
                  Release Changelog
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {rel.changelog || "No changelog provided for this release."}
                </p>
              </div>

              {/* Checksum SHA-256 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                <Terminal size={13} color="var(--accent-primary)" />
                <span>SHA-256: {rel.checksumSha256}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal: Create New Release ─────────────────────────────────────── */}
      {showNewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(5, 5, 8, 0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div className="double-bezel-card" style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="double-bezel-inner" style={{ padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "#ffffff" }}>
                  Create Version Release
                </h2>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="btn btn-ghost"
                  style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                >
                  ✕
                </button>
              </div>

              {errorMessage && (
                <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "var(--status-danger)", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", marginBottom: "1rem" }}>
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleCreateRelease}>
                <div className="form-group-custom">
                  <label className="form-label-custom">Target Boilerplate Package</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="form-input-custom"
                    style={{ cursor: "pointer" }}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.active_version || "v1.0.0"})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                  <div className="form-group-custom">
                    <label className="form-label-custom">New Version Tag</label>
                    <input
                      type="text"
                      required
                      value={newVersion}
                      onChange={(e) => setNewVersion(e.target.value)}
                      placeholder="e.g. v1.1.0"
                      className="form-input-custom"
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">R2 Storage Key</label>
                    <input
                      type="text"
                      required
                      value={storageKey}
                      onChange={(e) => setStorageKey(e.target.value)}
                      placeholder="releases/package-v1.1.0.zip"
                      className="form-input-custom"
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">SHA-256 Checksum Hash</label>
                  <input
                    type="text"
                    required
                    value={checksumSha256}
                    onChange={(e) => setChecksumSha256(e.target.value)}
                    placeholder="64-character hex checksum (sha256sum codebase.zip)"
                    className="form-input-custom"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}
                  />
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Changelog &amp; Migration Notes</label>
                  <textarea
                    rows={4}
                    required
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                    placeholder="- Upgraded Next.js 16.3 to React 19&#10;- Added PostgreSQL connection pooling&#10;- Fixed session refresh timing"
                    className="form-input-custom"
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="btn btn-secondary"
                    style={{ padding: "0.55rem 1rem", fontSize: "0.82rem" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ padding: "0.55rem 1.25rem", fontSize: "0.82rem" }}
                  >
                    {isSubmitting ? "Publishing..." : "Publish Release"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReleasesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "4rem 1.5rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Loading releases...
        </div>
      }
    >
      <ReleasesContent />
    </Suspense>
  );
}
