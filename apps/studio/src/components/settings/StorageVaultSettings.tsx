"use client";

import React, { useState, useEffect } from "react";
import { HardDrive, Check, ShieldCheck, Lock, Clock, FileCheck, Sparkles } from "lucide-react";

export const StorageVaultSettings: React.FC = () => {
  const [bucketName, setBucketName]       = useState("kodedock-private-vault");
  const [maxArchiveMb, setMaxArchiveMb]   = useState(250);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [success, setSuccess]             = useState(false);
  const [errorMsg, setErrorMsg]           = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/studio/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.storage) {
          const s = d.data.storage;
          if (s.bucket_name) setBucketName(s.bucket_name);
          if (s.max_archive_mb) setMaxArchiveMb(Number(s.max_archive_mb));
        }
      })
      .catch(() => {
        setErrorMsg("Failed to connect to storage vault settings");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/studio/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storage: {
            bucket_name: bucketName.trim(),
            max_archive_mb: Number(maxArchiveMb),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      } else {
        setErrorMsg(data.error?.message || "Failed to update storage parameters");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while saving storage parameters");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-card" id="settings-storage-vault">
      <div className="section-card-header">
        <div>
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Cloudflare R2 Storage Vault</span>
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
              <Lock size={11} /> ZERO-EGRESS ENCRYPTED
            </span>
          </div>
          <div className="card-desc">
            Configure isolated private binary vaults, SHA-256 checksum verification, and 60-second HMAC signed download link policies.
          </div>
        </div>
        <HardDrive size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <form onSubmit={handleSave}>
        <div className="section-card-body">
          {loading ? (
            <div
              style={{
                padding: "2rem 0",
                textTransform: "uppercase",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
              }}
            >
              Verifying R2 Storage Vault Policies...
            </div>
          ) : (
            <>
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

              {/* Security Policy Highlights */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    background: "var(--bg-surface-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <Clock size={16} color="var(--accent-cyan)" />
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                      60-Second HMAC Signed Expiration
                    </span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                    Software release zips are never publicly exposed. Buyers receive an ephemeral signed URL that auto-invalidates within exactly 60 seconds.
                  </p>
                </div>

                <div
                  style={{
                    background: "var(--bg-surface-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <FileCheck size={16} color="var(--accent-primary)" />
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                      Mandatory SHA-256 Digest
                    </span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                    Every uploaded package zip is cryptographically hashed with SHA-256 upon ingestion. Tampered or corrupted archives are rejected at the edge.
                  </p>
                </div>
              </div>

              {/* Vault Settings Form */}
              <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "0.5rem" }}>
                <div className="form-group">
                  <label htmlFor="storage-bucket" className="form-label">
                    R2 Isolated Vault Bucket Identifier
                  </label>
                  <input
                    id="storage-bucket"
                    type="text"
                    required
                    value={bucketName}
                    onChange={(e) => setBucketName(e.target.value)}
                    className="form-input font-mono"
                    placeholder="kodedock-private-vault"
                  />
                  <div className="form-helper">
                    Private S3-compatible bucket name partitioned for your studio's release packages.
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="max-archive-size" className="form-label">
                    Maximum Release Archive Quota (MB)
                  </label>
                  <select
                    id="max-archive-size"
                    value={maxArchiveMb}
                    onChange={(e) => setMaxArchiveMb(Number(e.target.value))}
                    className="form-input font-mono"
                  >
                    <option value={50}>50 MB (Lightweight Libraries &amp; Boilerplates)</option>
                    <option value={100}>100 MB (Full-Stack Next.js / Go Stacks)</option>
                    <option value={250}>250 MB (Full Microservice Mono-Repos &amp; Datasets)</option>
                  </select>
                  <div className="form-helper">
                    Maximum allowed zip payload size per release published through Studio or CLI.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="section-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {success && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "var(--accent-cyan)",
                  fontSize: "0.82rem",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <Check size={14} /> STORAGE POLICIES PERSISTED IN POSTGRESQL
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || saving}
            className="btn btn-primary"
            style={{
              padding: "0.55rem 1.4rem",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                SAVING...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                UPDATE STORAGE POLICIES
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
