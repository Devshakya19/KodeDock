"use client";

import React, { useState } from "react";
import type { DeveloperProfile } from "../../types/portal";
import { Check, Edit3, Share2, ShieldCheck } from "lucide-react";

interface ProfileHeaderBannerProps {
  profile: DeveloperProfile;
  onOpenEditModal: () => void;
  onToast: (msg: string) => void;
}

export const ProfileHeaderBanner: React.FC<ProfileHeaderBannerProps> = ({
  profile,
  onOpenEditModal,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://kodedock.dev/u/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    onToast("Public profile link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const memberYear = new Date(profile.joinedAt).getFullYear() || 2024;
  const memberMonthYear = new Date(profile.joinedAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="ref-hero-banner">
      {/* Background ambient lighting and wave streak */}
      <div className="ref-hero-bg-glow" aria-hidden="true" />
      <div className="ref-hero-wave-streak" aria-hidden="true" />

      <div className="ref-hero-inner">
        {/* Left Side: Avatar Box & Info */}
        <div className="ref-hero-left">
          {/* Avatar Box with Neon Glowing Border & Online Dot */}
          <div className="ref-avatar-box">
            <div className="ref-avatar-img-wrap">
              {profile.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.image} alt={profile.name} className="ref-avatar-img" />
              ) : (
                <span className="ref-avatar-letter">{profile.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="ref-avatar-online-dot" title="Active on KodeDock" />
          </div>

          {/* User Meta Information */}
          <div className="ref-user-meta-block">
            {/* Title with verified check badge */}
            <div className="ref-username-row">
              <h1 className="ref-user-title">{profile.name.replace(/\s+/g, "")}</h1>
              <div className="ref-verified-badge" title="Verified Buyer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#8B5CF6" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#fff"/>
                </svg>
              </div>
            </div>

            {/* Subtext: Buyer · Joined Sep 2024 */}
            <div className="ref-subtext-row">
              <span>Buyer</span>
              <span>•</span>
              <span>Joined {memberMonthYear}</span>
            </div>

            {/* Glowing Badges Row */}
            <div className="ref-badges-row">
              <span className="ref-pill-purple">
                <span className="ref-pill-sparkle">⚡</span>
                <span>{profile.accountTier || "ELITE BUYER"}</span>
              </span>

              <span className="ref-pill-green">
                <span className="ref-pill-sparkle">⚡</span>
                <span>ACTIVE SUBSCRIBER</span>
              </span>
            </div>

            {/* Bio summary */}
            <p className="ref-bio-summary">
              {profile.bio || "Exploring innovative digital solutions. Interested in web apps, SaaS products and developer tools. Always looking for the right project."}
            </p>

            {/* Social Links Circle Row */}
            <div className="ref-social-links-row">
              {profile.githubHandle && (
                <a
                  href={`https://github.com/${profile.githubHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ref-social-icon-btn"
                  title="GitHub Profile"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                </a>
              )}

              {profile.twitterHandle && (
                <a
                  href={`https://twitter.com/${profile.twitterHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ref-social-icon-btn"
                  title="Twitter / X Profile"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}

              {profile.linkedinHandle && (
                <a
                  href={`https://linkedin.com/in/${profile.linkedinHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ref-social-icon-btn"
                  title="LinkedIn Profile"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
              )}

              {profile.websiteUrl && (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ref-social-icon-btn"
                  title="Personal Website"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons & Stylized Banner Text */}
        <div className="ref-hero-right">
          <div className="ref-hero-actions">
            <button
              type="button"
              className="ref-btn-primary"
              onClick={handleShare}
            >
              {copied ? <Check size={14} aria-hidden="true" /> : null}
              <span>{copied ? "Link Copied" : "Share Profile"}</span>
            </button>

            <button
              type="button"
              className="ref-btn-secondary"
              onClick={onOpenEditModal}
            >
              <Edit3 size={14} aria-hidden="true" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Stylized Handwritten Banner Slogan */}
          <div className="ref-hero-slogan">
            Better Tools<br />
            <span className="ref-slogan-accent">Bigger Dreams</span>
          </div>
        </div>
      </div>
    </div>
  );
};
