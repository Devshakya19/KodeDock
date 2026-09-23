"use client";

import React from "react";
import { Shield, Monitor, LogOut } from "lucide-react";

export const SecuritySettings: React.FC = () => {
  return (
    <section className="section-card" id="settings-security">
      <div className="section-card-header">
        <div>
          <div className="card-title">Security & Authentication</div>
          <div className="card-desc">Manage your password, multi-factor authentication, and inspect active sessions.</div>
        </div>
        <Shield size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        {/* Change Password */}
        <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
          Change Password
        </h3>
        <div className="form-grid-2" style={{ marginBottom: "0" }}>
          <div className="form-group">
            <label htmlFor="current-password" className="form-label">Current Password</label>
            <input id="current-password" type="password" className="form-input" placeholder="••••••••••••" />
          </div>
          <div className="form-group">
            <label htmlFor="new-password" className="form-label">New Password</label>
            <input id="new-password" type="password" className="form-input" placeholder="At least 12 characters" />
          </div>
        </div>

        <div className="divider" />

        {/* 2FA */}
        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-name">Two-Factor Authentication (2FA)</div>
            <div className="toggle-desc">Protect your software licenses and downloads with an authenticator app (TOTP).</div>
          </div>
          <button type="button" className="btn btn-secondary btn-sm">Enable 2FA</button>
        </div>

        <div className="divider" />

        {/* Active Sessions */}
        <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
          Active Devices & Sessions
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Devices currently authenticated with your KodeDock developer credentials.
        </p>

        <div className="session-item" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="session-info">
            <Monitor size={16} className="session-icon" aria-hidden="true" />
            <div>
              <div className="session-name">Linux / Chrome 129</div>
              <div className="session-meta">Current session · 127.0.0.1</div>
            </div>
          </div>
          <span className="pill pill-success">Active Now</span>
        </div>
      </div>

      <div className="section-card-footer" style={{ justifyContent: "space-between" }}>
        <button type="button" className="btn btn-danger btn-sm">
          <LogOut size={13} aria-hidden="true" />
          <span>Log Out Other Devices</span>
        </button>
        <button type="button" className="btn btn-primary btn-md">Update Password</button>
      </div>
    </section>
  );
};
