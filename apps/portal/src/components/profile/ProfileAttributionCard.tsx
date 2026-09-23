"use client";

import React from "react";
import type { DeveloperProfile } from "../../types/portal";
import { Globe, Share2, ExternalLink } from "lucide-react";

interface ProfileAttributionCardProps {
  profile: DeveloperProfile;
}

export const ProfileAttributionCard: React.FC<ProfileAttributionCardProps> = ({ profile }) => {
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
              <Share2 size={14} aria-hidden="true" />
            </div>
            <div>
              <div className="card-title" style={{ fontSize: "1.05rem" }}>
                Connected Dev Channels
              </div>
              <div className="card-desc" style={{ fontSize: "0.78rem" }}>
                Public attribution for open-source contributions and software licenses
              </div>
            </div>
          </div>
        </div>

        <div className="section-card-body" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* GitHub */}
          {profile.githubHandle ? (
            <a
              href={`https://github.com/${profile.githubHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dev-attribution-card"
              title={`View ${profile.name}'s GitHub Profile`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div className="dev-attribution-icon">
                  {/* High-definition GitHub vector mark */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    GitHub
                  </div>
                  <div className="font-mono text-muted" style={{ fontSize: "0.72rem" }}>
                    @{profile.githubHandle}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="pill pill-success" style={{ fontSize: "0.6rem" }}>LINKED</span>
                <ExternalLink size={14} color="var(--text-muted)" aria-hidden="true" />
              </div>
            </a>
          ) : null}

          {/* Twitter / X */}
          {profile.twitterHandle ? (
            <a
              href={`https://twitter.com/${profile.twitterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dev-attribution-card"
              title={`View ${profile.name}'s Twitter / X Profile`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div className="dev-attribution-icon">
                  {/* High-definition X / Twitter vector mark */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    Twitter / X
                  </div>
                  <div className="font-mono text-muted" style={{ fontSize: "0.72rem" }}>
                    @{profile.twitterHandle}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="pill pill-cyan" style={{ fontSize: "0.6rem" }}>COMMUNITY</span>
                <ExternalLink size={14} color="var(--text-muted)" aria-hidden="true" />
              </div>
            </a>
          ) : null}

          {/* Personal Website */}
          {profile.websiteUrl ? (
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dev-attribution-card"
              title={`Visit ${profile.name}'s Personal Portfolio`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div className="dev-attribution-icon">
                  <Globe size={18} color="var(--accent-cyan)" aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    Personal Portfolio
                  </div>
                  <div className="font-mono text-muted" style={{ fontSize: "0.72rem" }}>
                    {profile.websiteUrl.replace(/^https?:\/\//, "")}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="pill pill-purple" style={{ fontSize: "0.6rem" }}>VERIFIED DOMAIN</span>
                <ExternalLink size={14} color="var(--text-muted)" aria-hidden="true" />
              </div>
            </a>
          ) : null}

          {!profile.githubHandle && !profile.twitterHandle && !profile.websiteUrl && (
            <div className="text-muted" style={{ fontSize: "0.85rem", padding: "0.5rem 0" }}>
              No connected social profiles. Link them using the Edit Credentials modal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
