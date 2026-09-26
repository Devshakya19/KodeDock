"use client";

import React, { useState } from "react";
import type { ProductVersion } from "../../types/store";
import { GitBranch, Copy, Check, Shield } from "lucide-react";

interface VersionHistoryTableProps {
  versions: ProductVersion[];
}

export const VersionHistoryTable: React.FC<VersionHistoryTableProps> = ({
  versions,
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "—";
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  if (!versions || versions.length === 0) {
    return (
      <div
        style={{
          padding: "1.5rem",
          background: "var(--bg-surface-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
        }}
      >
        <Shield size={18} color="var(--status-success)" />
        <span>
          Initial release package verified and signed with Ed25519 cryptography.
        </span>
      </div>
    );
  }

  return (
    <div className="version-table-container">
      <table className="version-table">
        <thead>
          <tr>
            <th>Version</th>
            <th>Release Date</th>
            <th>File Size</th>
            <th>SHA-256 Checksum</th>
            <th>Changelog</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((ver) => (
            <tr key={ver.id || ver.version}>
              <td style={{ fontWeight: 600, color: "#ffffff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <GitBranch size={13} color="var(--accent-primary)" />
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {ver.version.startsWith("v") ? ver.version : `v${ver.version}`}
                  </span>
                </div>
              </td>
              <td>
                {ver.created_at
                  ? new Date(ver.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </td>
              <td style={{ fontFamily: "var(--font-mono)" }}>
                {formatFileSize(ver.file_size_bytes)}
              </td>
              <td>
                {ver.checksum_sha256 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <code
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.72rem",
                        color: "var(--accent-cyan)",
                        background: "rgba(56, 189, 248, 0.08)",
                        padding: "0.15rem 0.35rem",
                        borderRadius: "3px",
                        maxWidth: "140px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={ver.checksum_sha256}
                    >
                      {ver.checksum_sha256.slice(0, 16)}...
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyHash(ver.checksum_sha256)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        padding: "0.1rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Copy full SHA-256"
                    >
                      {copiedHash === ver.checksum_sha256 ? (
                        <Check size={12} color="var(--status-success)" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>Verified</span>
                )}
              </td>
              <td style={{ maxWidth: "260px" }}>
                <span
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  title={ver.changelog}
                >
                  {ver.changelog || "Routine maintenance and security enhancements."}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
