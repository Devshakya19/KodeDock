"use client";

import React, { useState } from "react";
import type { DeveloperProfile } from "../../types/portal";
import { ShieldCheck, Copy, Check, Edit3, Sparkles } from "lucide-react";
import { getAutoAvatar } from "@/lib/avatars";

interface ProfileHeroProps {
  profile: DeveloperProfile;
  onOpenEditModal: () => void;
  onToast: (msg: string) => void;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  profile,
  onOpenEditModal,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://kodedock.dev/u/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    onToast("Public profile link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <div className="double-bezel">
      <div className="double-bezel-inner">
        {/* Panoramic Cyber Mesh Cover */}
        <div className="profile-banner">
          <div className="profile-banner-mesh" aria-hidden="true" />
          <div className="profile-banner-grid" aria-hidden="true" />
        </div>

        {/* Hero Content Area */}
        <div className="profile-hero-content">
          <div className="profile-avatar-row">
            {/* Avatar with glowing halo */}
            <div className="profile-avatar-halo">
              <div className="profile-avatar-core" style={{ borderRadius: "50%", overflow: "hidden" }}>
                <img
                  src={profile.image || getAutoAvatar(profile.id || profile.email || profile.name)}
                  alt={profile.name}
                  className="profile-avatar-img"
                  style={{ borderRadius: "50%", objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
              <div className="profile-avatar-badge" title="Verified KodeDock Buyer">
                <ShieldCheck size={14} aria-hidden="true" />
              </div>
            </div>

            {/* Quick Actions with Nested Button-in-Button */}
            <div className="profile-cta-group">
              <button
                type="button"
                className="btn-nested btn-nested-secondary"
                onClick={handleCopyLink}
                title="Copy public profile URL"
              >
                <span>{copied ? "Link Copied" : "Share Profile"}</span>
                <span className="btn-icon-bubble">
                  {copied ? (
                    <Check size={14} color="var(--status-success)" aria-hidden="true" />
                  ) : (
                    <Copy size={14} color="var(--text-secondary)" aria-hidden="true" />
                  )}
                </span>
              </button>

              <button
                type="button"
                className="btn-nested btn-nested-primary"
                onClick={onOpenEditModal}
                title="Edit profile credentials"
              >
                <span>Edit Credentials</span>
                <span className="btn-icon-bubble">
                  <Edit3 size={14} color="#fff" aria-hidden="true" />
                </span>
              </button>
            </div>
          </div>

          {/* Name & Tier Bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.35rem)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.15,
                }}
              >
                {profile.name}
              </h1>

              {/* Dynamic Tier Pill from Real PostgreSQL DB */}
              <span className="pill pill-purple" style={{ padding: "0.25rem 0.65rem", fontSize: "0.68rem" }}>
                <Sparkles size={11} aria-hidden="true" />
                {profile.accountTier || "VERIFIED BUYER"}
              </span>

              <span className="pill pill-success" style={{ padding: "0.25rem 0.65rem", fontSize: "0.68rem" }}>
                <ShieldCheck size={11} aria-hidden="true" />
                ACTIVE SUBSCRIBER
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span className="font-mono text-cyan" style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                @{profile.username}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>•</span>
              <span className="font-mono text-muted" style={{ fontSize: "0.8rem" }}>
                Buyer ID: {profile.id.slice(0, 10)}...{profile.id.slice(-6)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
