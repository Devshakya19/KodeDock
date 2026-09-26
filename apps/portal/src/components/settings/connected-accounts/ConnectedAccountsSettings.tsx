"use client";

import React, { useState, useEffect } from "react";
import { Link2, GitBranch, MessageSquare, CheckCircle2 } from "lucide-react";

export const ConnectedAccountsSettings: React.FC = () => {
  const [github, setGithub]   = useState<string | null>(null);
  const [twitter, setTwitter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setGithub(d.data.githubHandle || null);
          setTwitter(d.data.twitterHandle || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-card" id="settings-connected-accounts">
      <div className="section-card-header">
        <div>
          <div className="card-title">Connected OAuth &amp; Social Accounts</div>
          <div className="card-desc">
            Link your GitHub and social profiles for developer attribution and single sign-on support.
          </div>
        </div>
        <Link2 size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        {/* GitHub */}
        <div className="toggle-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div style={{ width: 36, height: 36, background: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GitBranch size={18} color="var(--text-primary)" aria-hidden="true" />
            </div>
            <div>
              <div className="toggle-name">GitHub Account</div>
              <div className="toggle-desc font-mono" style={{ fontSize: "0.72rem" }}>
                {github ? `@${github} (Connected via OAuth)` : "Connect for open-source attribution & OAuth login."}
              </div>
            </div>
          </div>
          {github ? (
            <span className="pill pill-success" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <CheckCircle2 size={12} aria-hidden="true" /> Connected
            </span>
          ) : (
            <button type="button" className="btn btn-secondary btn-sm">Connect GitHub</button>
          )}
        </div>

        {/* Twitter / X */}
        <div className="toggle-row">
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div style={{ width: 36, height: 36, background: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageSquare size={18} color="var(--accent-cyan)" aria-hidden="true" />
            </div>
            <div>
              <div className="toggle-name">Twitter / X Handle</div>
              <div className="toggle-desc font-mono" style={{ fontSize: "0.72rem" }}>
                {twitter ? `@${twitter} (Verified Handle)` : "Display your Twitter handle on public profile."}
              </div>
            </div>
          </div>
          {twitter ? (
            <span className="pill pill-success" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <CheckCircle2 size={12} aria-hidden="true" /> Linked
            </span>
          ) : (
            <button type="button" className="btn btn-secondary btn-sm">Link Handle</button>
          )}
        </div>
      </div>
    </section>
  );
};
