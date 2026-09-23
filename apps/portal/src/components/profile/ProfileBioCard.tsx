"use client";

import React, { useState } from "react";
import type { DeveloperProfile } from "../../types/portal";
import { User, Copy, Check, ShieldCheck, Mail, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface ProfileBioCardProps {
  profile: DeveloperProfile;
  onToast: (msg: string) => void;
}

export const ProfileBioCard: React.FC<ProfileBioCardProps> = ({ profile, onToast }) => {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(profile.id);
    setCopiedId(true);
    onToast("Developer ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="double-bezel">
      <div className="double-bezel-inner">
        <div className="section-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-sm)",
                background: "var(--accent-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-primary)",
              }}
            >
              <User size={14} aria-hidden="true" />
            </div>
            <div>
              <div className="card-title" style={{ fontSize: "1.05rem" }}>
                Developer Narrative
              </div>
              <div className="card-desc" style={{ fontSize: "0.78rem" }}>
                Identity statement & verified credentials
              </div>
            </div>
          </div>

          <Link
            href="/settings"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "0.76rem", gap: "0.2rem" }}
            title="Manage security & credentials"
          >
            <span>Settings</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </div>

        <div className="section-card-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Bio text */}
          <p
            style={{
              fontSize: "0.92rem",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {profile.bio || "No developer narrative provided yet. Click 'Edit Credentials' to customize your engineering biography."}
          </p>

          {/* Verification detail list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            {/* Email */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem" }}>
              <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Mail size={13} aria-hidden="true" />
                Primary Email
              </span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {profile.email}
                <ShieldCheck size={13} color="var(--status-success)" aria-hidden="true" />
              </span>
            </div>

            {/* Developer ID */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Developer Hash</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="font-mono text-cyan"
                style={{
                  background: "rgba(56, 189, 248, 0.08)",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  borderRadius: "var(--radius-xs)",
                  padding: "0.2rem 0.5rem",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
                title="Click to copy full developer ID"
              >
                <span>{profile.id.slice(0, 8)}...{profile.id.slice(-6)}</span>
                {copiedId ? (
                  <Check size={12} color="var(--status-success)" aria-hidden="true" />
                ) : (
                  <Copy size={12} color="var(--text-muted)" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
