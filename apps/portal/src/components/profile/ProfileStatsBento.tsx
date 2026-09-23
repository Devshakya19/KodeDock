"use client";

import React from "react";
import type { DeveloperProfile } from "../../types/portal";
import { Key, Layers, ShieldCheck, Calendar } from "lucide-react";

interface ProfileStatsBentoProps {
  profile: DeveloperProfile;
}

export const ProfileStatsBento: React.FC<ProfileStatsBentoProps> = ({ profile }) => {
  const memberDate = new Date(profile.joinedAt).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="profile-metrics-strip">
      {/* 1. Active Licenses */}
      <div className="profile-metric-cell">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="metric-label">Active Licenses</span>
          <Key size={14} color="var(--accent-primary)" aria-hidden="true" />
        </div>
        <div className="metric-val purple">{profile.totalLicenses ?? 0}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Cryptographically signed keys
        </div>
      </div>

      {/* 2. Acquired Boilerplates / Orders */}
      <div className="profile-metric-cell">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="metric-label">Acquired Assets</span>
          <Layers size={14} color="var(--accent-cyan)" aria-hidden="true" />
        </div>
        <div className="metric-val cyan">{profile.totalOrders ?? 0}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Commercial boilerplates owned
        </div>
      </div>

      {/* 3. Account Trust Level */}
      <div className="profile-metric-cell">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="metric-label">Auth Verification</span>
          <ShieldCheck size={14} color="var(--status-success)" aria-hidden="true" />
        </div>
        <div className="metric-val green">100%</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          PostgreSQL email verified
        </div>
      </div>

      {/* 4. Member Since */}
      <div className="profile-metric-cell">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="metric-label">Member Since</span>
          <Calendar size={14} color="var(--text-muted)" aria-hidden="true" />
        </div>
        <div className="metric-val" style={{ fontSize: "1.3rem", color: "var(--text-primary)", paddingTop: "0.25rem" }}>
          {memberDate}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Verified buyer ledger
        </div>
      </div>
    </div>
  );
};
