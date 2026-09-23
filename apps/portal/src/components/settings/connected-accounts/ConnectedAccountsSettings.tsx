"use client";

import React from "react";
import { Link2, GitBranch, MessageSquare } from "lucide-react";

export const ConnectedAccountsSettings: React.FC = () => {
  return (
    <section className="section-card" id="settings-connected-accounts">
      <div className="section-card-header">
        <div>
          <div className="card-title">Connected Accounts</div>
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
              <div className="toggle-name">GitHub</div>
              <div className="toggle-desc">Connect for open-source attribution and OAuth login.</div>
            </div>
          </div>
          <button type="button" className="btn btn-secondary btn-sm">Connect</button>
        </div>

        {/* Twitter */}
        <div className="toggle-row">
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div style={{ width: 36, height: 36, background: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageSquare size={18} color="var(--accent-cyan)" aria-hidden="true" />
            </div>
            <div>
              <div className="toggle-name">Twitter / X</div>
              <div className="toggle-desc">Display your Twitter handle on your public developer profile.</div>
            </div>
          </div>
          <button type="button" className="btn btn-secondary btn-sm">Connect</button>
        </div>
      </div>
    </section>
  );
};
