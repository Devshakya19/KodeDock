"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

export const DangerZoneSettings: React.FC = () => {
  const [confirmText, setConfirmText] = useState("");
  const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

  return (
    <section
      className="section-card"
      id="settings-danger-zone"
      style={{ borderColor: "rgba(239, 68, 68, 0.25)", background: "rgba(239, 68, 68, 0.015)" }}
    >
      <div className="section-card-header">
        <div>
          <div className="card-title" style={{ color: "var(--status-danger)" }}>Danger Zone</div>
          <div className="card-desc">
            Irreversible and destructive account actions. These cannot be undone.
          </div>
        </div>
        <AlertTriangle size={18} color="var(--status-danger)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        {/* Revoke all licenses */}
        <div className="toggle-row" style={{ borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
          <div className="toggle-info">
            <div className="toggle-name" style={{ color: "var(--status-danger)" }}>Revoke All Licenses</div>
            <div className="toggle-desc">
              Permanently deactivate all Ed25519 license keys. Software on activated domains will stop verifying.
            </div>
          </div>
          <button type="button" className="btn btn-danger btn-sm">
            <span>Revoke All</span>
          </button>
        </div>

        {/* Purge data */}
        <div className="toggle-row" style={{ borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
          <div className="toggle-info">
            <div className="toggle-name" style={{ color: "var(--status-danger)" }}>Purge Download History</div>
            <div className="toggle-desc">
              Delete all signed download link logs and checksums from the PostgreSQL audit trail.
            </div>
          </div>
          <button type="button" className="btn btn-danger btn-sm">
            <span>Purge Logs</span>
          </button>
        </div>

        {/* Delete account */}
        <div style={{ paddingTop: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--status-danger)", marginBottom: "0.5rem" }}>
            Permanently Delete Account
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1rem" }}>
            This will permanently delete your KodeDock account, revoke all licenses, cancel all pending orders, and remove your data from our servers. This action <strong style={{ color: "var(--status-danger)" }}>cannot be undone</strong>.
          </p>

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label htmlFor="delete-confirm" className="form-label" style={{ color: "var(--status-danger)" }}>
              Type <code className="font-mono" style={{ background: "var(--danger-subtle)", padding: "0.1rem 0.3rem", borderRadius: "3px" }}>{CONFIRM_PHRASE}</code> to confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              className="form-input"
              style={{ borderColor: confirmText === CONFIRM_PHRASE ? "var(--status-danger)" : undefined }}
              autoComplete="off"
            />
          </div>

          <button
            type="button"
            className="btn btn-danger-solid btn-md"
            disabled={confirmText !== CONFIRM_PHRASE}
            onClick={() => alert("Account deletion requires backend confirmation flow.")}
          >
            <Trash2 size={15} aria-hidden="true" />
            <span>Delete My Account Permanently</span>
          </button>
        </div>
      </div>
    </section>
  );
};
