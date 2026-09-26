"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, Check } from "lucide-react";

export const DangerZoneSettings: React.FC = () => {
  const [confirmText, setConfirmText] = useState("");
  const [revoking, setRevoking]       = useState(false);
  const [purging, setPurging]         = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [statusMsg, setStatusMsg]     = useState("");
  const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

  const handleRevokeAll = async () => {
    if (!confirm("Are you sure you want to revoke all license keys in PostgreSQL?")) return;
    setRevoking(true);
    try {
      const res = await fetch("/api/portal/danger/revoke-all", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setStatusMsg("All licenses successfully revoked in PostgreSQL.");
        setTimeout(() => setStatusMsg(""), 4000);
      }
    } catch {
      // Error handling
    } finally {
      setRevoking(false);
    }
  };

  const handlePurgeLogs = async () => {
    if (!confirm("Purge all session logs from PostgreSQL?")) return;
    setPurging(true);
    try {
      const res = await fetch("/api/portal/danger/purge-logs", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setStatusMsg("Session logs successfully purged from PostgreSQL.");
        setTimeout(() => setStatusMsg(""), 4000);
      }
    } catch {
      // Error handling
    } finally {
      setPurging(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== CONFIRM_PHRASE) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/portal/danger/delete-account", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setStatusMsg("Account permanently deleted from PostgreSQL database.");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch {
      // Error handling
    } finally {
      setDeleting(false);
    }
  };

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
            Irreversible and destructive account actions executed directly on PostgreSQL database records.
          </div>
        </div>
        <AlertTriangle size={18} color="var(--status-danger)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        {statusMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid var(--accent-cyan)",
              borderRadius: "var(--radius-md)",
              color: "var(--accent-cyan)",
              fontSize: "0.82rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Check size={16} aria-hidden="true" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Revoke all licenses */}
        <div className="toggle-row" style={{ borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
          <div className="toggle-info">
            <div className="toggle-name" style={{ color: "var(--status-danger)" }}>Revoke All Licenses</div>
            <div className="toggle-desc">
              Permanently set license status to 'REVOKED' in PostgreSQL for all acquired items.
            </div>
          </div>
          <button
            type="button"
            disabled={revoking}
            onClick={handleRevokeAll}
            className="btn btn-danger btn-sm"
          >
            <span>{revoking ? "Revoking..." : "Revoke All"}</span>
          </button>
        </div>

        {/* Purge data */}
        <div className="toggle-row" style={{ borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
          <div className="toggle-info">
            <div className="toggle-name" style={{ color: "var(--status-danger)" }}>Purge Active Sessions</div>
            <div className="toggle-desc">
              Delete all active session tokens from PostgreSQL audit log.
            </div>
          </div>
          <button
            type="button"
            disabled={purging}
            onClick={handlePurgeLogs}
            className="btn btn-danger btn-sm"
          >
            <span>{purging ? "Purging..." : "Purge Sessions"}</span>
          </button>
        </div>

        {/* Delete account */}
        <div style={{ paddingTop: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--status-danger)", marginBottom: "0.5rem" }}>
            Permanently Delete Account
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1rem" }}>
            This will permanently delete your KodeDock user record from PostgreSQL, cascading deletion to licenses, orders, and tokens. This action <strong style={{ color: "var(--status-danger)" }}>cannot be undone</strong>.
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
            disabled={confirmText !== CONFIRM_PHRASE || deleting}
            onClick={handleDeleteAccount}
          >
            <Trash2 size={15} aria-hidden="true" />
            <span>{deleting ? "Deleting from DB..." : "Delete My Account Permanently"}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
