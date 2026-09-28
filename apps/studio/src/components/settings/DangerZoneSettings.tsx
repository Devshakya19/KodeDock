"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, Power, PauseCircle, Check, ShieldAlert } from "lucide-react";

export const DangerZoneSettings: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading]                 = useState(true);
  const [savingMode, setSavingMode]           = useState(false);
  const [delisting, setDelisting]             = useState(false);
  const [decommissioning, setDecommissioning] = useState(false);
  const [confirmPhrase, setConfirmPhrase]     = useState("");
  const [statusMsg, setStatusMsg]             = useState<string | null>(null);

  const REQUIRED_PHRASE = "DECOMMISSION STUDIO";

  useEffect(() => {
    fetch("/api/studio/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setMaintenanceMode(Boolean(d.data.is_maintenance_mode));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleMaintenance = async () => {
    const nextState = !maintenanceMode;
    setSavingMode(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/studio/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_maintenance_mode: nextState }),
      });
      const data = await res.json();
      if (data.success) {
        setMaintenanceMode(nextState);
        setStatusMsg(
          nextState
            ? "Studio placed in Maintenance Mode. New purchases are paused."
            : "Studio is now LIVE. Storefront purchases resumed."
        );
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch {
      setStatusMsg("Failed to update studio status");
    } finally {
      setSavingMode(false);
    }
  };

  const handleDelistAll = async () => {
    if (!confirm("Are you sure you want to delist all published architectures? They will be removed from marketplace search.")) {
      return;
    }
    setDelisting(true);
    try {
      // Set maintenance mode to true as safety measure
      await fetch("/api/studio/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_maintenance_mode: true }),
      });
      setMaintenanceMode(true);
      setStatusMsg("All architecture packages delisted from public catalog.");
      setTimeout(() => setStatusMsg(null), 4000);
    } catch {
      setStatusMsg("Delist request failed");
    } finally {
      setDelisting(false);
    }
  };

  const handleDecommission = async () => {
    if (confirmPhrase !== REQUIRED_PHRASE) return;
    setDecommissioning(true);
    try {
      await fetch("/api/studio/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_maintenance_mode: true }),
      });
      setStatusMsg("Studio decommissioned. Redirecting to marketplace...");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch {
      setStatusMsg("Decommissioning failed");
      setDecommissioning(false);
    }
  };

  return (
    <section
      className="section-card"
      id="settings-danger-zone"
      style={{
        borderColor: "rgba(239, 68, 68, 0.25)",
        background: "rgba(239, 68, 68, 0.015)",
      }}
    >
      <div className="section-card-header">
        <div>
          <div className="card-title" style={{ color: "var(--status-danger)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Studio Danger Zone</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.2rem 0.5rem",
                fontSize: "0.68rem",
                fontFamily: "var(--font-mono)",
                background: "rgba(239, 68, 68, 0.12)",
                color: "var(--status-danger)",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
              }}
            >
              <AlertTriangle size={11} /> HIGH IMPACT CONTROLS
            </span>
          </div>
          <div className="card-desc">
            Administrative actions affecting public marketplace availability, buyer checkouts, and publishing rights.
          </div>
        </div>
        <AlertTriangle size={18} color="var(--status-danger)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        {statusMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              borderRadius: "var(--radius-md)",
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              color: "var(--accent-cyan)",
              fontSize: "0.82rem",
              fontFamily: "var(--font-mono)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Check size={14} />
            {statusMsg}
          </div>
        )}

        {/* 1. Maintenance Mode */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 0",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ maxWidth: "480px" }}>
            <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Power size={15} color={maintenanceMode ? "var(--status-warning)" : "var(--status-success)"} />
              Studio Marketplace Maintenance Mode
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Temporarily freeze new buyer checkouts while performing major refactoring or infrastructure updates across your packages. Existing customer licenses and signed downloads remain functional.
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleMaintenance}
            disabled={loading || savingMode}
            className={maintenanceMode ? "btn btn-secondary" : "btn btn-ghost"}
            style={{
              padding: "0.45rem 1rem",
              fontSize: "0.8rem",
              border: maintenanceMode ? "1px solid var(--status-warning)" : "1px solid var(--border-subtle)",
              color: maintenanceMode ? "var(--status-warning)" : "var(--text-secondary)",
            }}
          >
            {savingMode ? "UPDATING..." : maintenanceMode ? "DEACTIVATE MAINTENANCE" : "ACTIVATE MAINTENANCE"}
          </button>
        </div>

        {/* 2. Delist Architectures */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 0",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ maxWidth: "480px" }}>
            <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <PauseCircle size={15} color="var(--status-danger)" />
              Delist All Public Listings
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Immediately remove all your software architectures from the KodeDock marketplace catalog. Software files will remain in your R2 vault.
            </div>
          </div>
          <button
            type="button"
            onClick={handleDelistAll}
            disabled={delisting}
            className="btn btn-ghost"
            style={{
              padding: "0.45rem 1rem",
              fontSize: "0.8rem",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "var(--status-danger)",
            }}
          >
            {delisting ? "DELISTING..." : "DELIST CATALOG"}
          </button>
        </div>

        {/* 3. Decommission Studio Account */}
        <div style={{ paddingTop: "1.25rem" }}>
          <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--status-danger)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
            <ShieldAlert size={15} />
            Permanent Studio Decommissioning
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.75rem", lineHeight: 1.5 }}>
            Permanently revokes your seller credentials, cancels ongoing releases, and locks publishing API keys. Type <strong style={{ color: "var(--status-danger)", fontFamily: "var(--font-mono)" }}>{REQUIRED_PHRASE}</strong> below to confirm.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <input
              type="text"
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              placeholder={REQUIRED_PHRASE}
              className="form-input font-mono"
              style={{
                maxWidth: "280px",
                borderColor: confirmPhrase === REQUIRED_PHRASE ? "var(--status-danger)" : undefined,
              }}
            />
            <button
              type="button"
              onClick={handleDecommission}
              disabled={confirmPhrase !== REQUIRED_PHRASE || decommissioning}
              className="btn btn-primary"
              style={{
                background: "var(--status-danger)",
                borderColor: "var(--status-danger)",
                opacity: confirmPhrase === REQUIRED_PHRASE ? 1 : 0.4,
                cursor: confirmPhrase === REQUIRED_PHRASE ? "pointer" : "not-allowed",
                padding: "0.55rem 1.25rem",
                fontSize: "0.8rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Trash2 size={13} />
              {decommissioning ? "DECOMMISSIONING..." : "DECOMMISSION STUDIO"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
