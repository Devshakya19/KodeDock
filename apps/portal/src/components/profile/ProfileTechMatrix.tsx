"use client";

import React from "react";
import type { DeveloperProfile } from "../../types/portal";
import { Code2, Terminal, Cpu } from "lucide-react";

interface ProfileTechMatrixProps {
  profile: DeveloperProfile;
}

export const ProfileTechMatrix: React.FC<ProfileTechMatrixProps> = ({ profile }) => {
  const stack = profile.primaryTech || [];

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
                background: "var(--accent-cyan-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-cyan)",
              }}
            >
              <Cpu size={14} aria-hidden="true" />
            </div>
            <div>
              <div className="card-title" style={{ fontSize: "1.05rem" }}>
                Engineering Stack & Architecture
              </div>
              <div className="card-desc" style={{ fontSize: "0.78rem" }}>
                Primary technologies across purchased source repositories
              </div>
            </div>
          </div>

          <span
            className="font-mono"
            style={{
              fontSize: "0.68rem",
              color: "var(--accent-cyan)",
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "var(--radius-full)",
              padding: "0.2rem 0.55rem",
              fontWeight: 600,
            }}
          >
            {stack.length} Core Technologies
          </span>
        </div>

        <div className="section-card-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Interactive Technology Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            {stack.map((tech) => (
              <div key={tech} className="tech-pill-interactive">
                <Code2 size={13} aria-hidden="true" />
                <span>{tech}</span>
              </div>
            ))}
            {stack.length === 0 && (
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                No technology tags configured yet.
              </p>
            )}
          </div>

          {/* Architectural Capability Callout */}
          <div
            style={{
              padding: "0.85rem 1rem",
              background: "var(--bg-canvas-alt)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <Terminal size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} aria-hidden="true" />
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              All acquired templates run native containerization, parameterized SQL pools, and zero-mock PostgreSQL schema migrations.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
