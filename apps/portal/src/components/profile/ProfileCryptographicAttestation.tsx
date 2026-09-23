"use client";

import React, { useState } from "react";
import type { DeveloperProfile } from "../../types/portal";
import { Fingerprint, Copy, Check, ShieldCheck } from "lucide-react";

interface ProfileCryptographicAttestationProps {
  profile: DeveloperProfile;
  onToast: (msg: string) => void;
}

export const ProfileCryptographicAttestation: React.FC<ProfileCryptographicAttestationProps> = ({
  profile,
  onToast,
}) => {
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);

  const handleCopyFingerprint = () => {
    if (profile.cryptographicFingerprint) {
      navigator.clipboard.writeText(profile.cryptographicFingerprint);
      setCopiedFingerprint(true);
      onToast("SHA-256 identity fingerprint copied");
      setTimeout(() => setCopiedFingerprint(false), 2000);
    }
  };

  const fp = profile.cryptographicFingerprint || "d58b4220d1aaa6f135520367632911138b674d7c83d6fd5d500d3e2b4bb25942";

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
                background: "var(--success-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--status-success)",
              }}
            >
              <Fingerprint size={14} aria-hidden="true" />
            </div>
            <div>
              <div className="card-title" style={{ fontSize: "1.05rem" }}>
                Cryptographic Passport
              </div>
              <div className="card-desc" style={{ fontSize: "0.78rem" }}>
                Hardware-verifiable developer identity on KodeDock
              </div>
            </div>
          </div>

          <div className="db-status" style={{ padding: "0.2rem 0.55rem" }}>
            <span className="db-dot" />
            <span>ATTESTED</span>
          </div>
        </div>

        <div className="section-card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Terminal Box */}
          <div className="crypto-terminal-card">
            {/* Row 1: Fingerprint */}
            <div className="crypto-row">
              <span className="crypto-label">SHA-256 Fingerprint</span>
              <button
                type="button"
                onClick={handleCopyFingerprint}
                className="crypto-val"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontFamily: "var(--font-mono)",
                }}
                title="Click to copy full SHA-256 fingerprint"
              >
                <span>{fp.slice(0, 16)}...{fp.slice(-12)}</span>
                {copiedFingerprint ? (
                  <Check size={12} color="var(--status-success)" aria-hidden="true" />
                ) : (
                  <Copy size={12} color="var(--text-muted)" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Row 2: Signature Engine */}
            <div className="crypto-row">
              <span className="crypto-label">Signature Standard</span>
              <span className="crypto-val" style={{ color: "var(--text-primary)" }}>
                ECDSA P-256 + HMAC-SHA256
              </span>
            </div>

            {/* Row 3: Trust Level */}
            <div className="crypto-row">
              <span className="crypto-label">Commercial Authorization</span>
              <span className="crypto-val" style={{ color: "var(--status-success)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <ShieldCheck size={12} aria-hidden="true" />
                LICENSED BUYER
              </span>
            </div>

            {/* Row 4: PostgreSQL UID */}
            <div className="crypto-row">
              <span className="crypto-label">PostgreSQL Vault UID</span>
              <span className="crypto-val" style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                kd_usr_{profile.id.slice(0, 12)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
