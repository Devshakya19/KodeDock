"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Webhook, Zap, Sparkles } from "lucide-react";

export const NotificationRulesSettings: React.FC = () => {
  const [notifyOnSale, setNotifyOnSale]       = useState(true);
  const [notifyOnPayout, setNotifyOnPayout]   = useState(true);
  const [notifyOnRelease, setNotifyOnRelease] = useState(true);
  const [notifyOnReview, setNotifyOnReview]   = useState(true);
  const [webhookUrl, setWebhookUrl]           = useState("");
  const [loading, setLoading]                 = useState(true);
  const [saving, setSaving]                   = useState(false);
  const [success, setSuccess]                 = useState(false);
  const [errorMsg, setErrorMsg]               = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/studio/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.notifications) {
          const n = d.data.notifications;
          setNotifyOnSale(n.notify_on_sale !== false);
          setNotifyOnPayout(n.notify_on_payout !== false);
          setNotifyOnRelease(n.notify_on_release !== false);
          setNotifyOnReview(n.notify_on_review !== false);
          setWebhookUrl(n.webhook_url || "");
        }
      })
      .catch(() => {
        setErrorMsg("Failed to connect to notification settings");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/studio/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifications: {
            notify_on_sale: notifyOnSale,
            notify_on_payout: notifyOnPayout,
            notify_on_release: notifyOnRelease,
            notify_on_review: notifyOnReview,
            webhook_url: webhookUrl.trim(),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      } else {
        setErrorMsg(data.error?.message || "Failed to update notification rules");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while saving notifications");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-card" id="settings-notification-rules">
      <div className="section-card-header">
        <div>
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Creator Notification &amp; Webhook Rules</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.2rem 0.5rem",
                fontSize: "0.68rem",
                fontFamily: "var(--font-mono)",
                background: "rgba(139, 92, 246, 0.12)",
                color: "var(--accent-primary)",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(139, 92, 246, 0.25)",
              }}
            >
              <Zap size={11} /> REAL-TIME TELEMETRY
            </span>
          </div>
          <div className="card-desc">
            Define automated sale alerts, payout receipts, release notifications, and outgoing webhook triggers.
          </div>
        </div>
        <Bell size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <form onSubmit={handleSave}>
        <div className="section-card-body">
          {loading ? (
            <div
              style={{
                padding: "2rem 0",
                textTransform: "uppercase",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
              }}
            >
              Loading PostgreSQL Notification Rules...
            </div>
          ) : (
            <>
              {errorMsg && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    marginBottom: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    color: "var(--status-danger)",
                    fontSize: "0.82rem",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Toggle Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div className="toggle-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <div className="toggle-info">
                    <span className="toggle-name">Real-Time Instant Sale Notifications</span>
                    <span className="toggle-desc">
                      Receive an instant push notification and email receipt whenever an engineer purchases your software package.
                    </span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={notifyOnSale}
                      onChange={(e) => setNotifyOnSale(e.target.checked)}
                    />
                    <span className="toggle-track" />
                  </label>
                </div>

                <div className="toggle-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <div className="toggle-info">
                    <span className="toggle-name">Payout Settlement Confirmations</span>
                    <span className="toggle-desc">
                      Receive instant confirmation when funds are disbursed to your registered UPI address or Bank Account.
                    </span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={notifyOnPayout}
                      onChange={(e) => setNotifyOnPayout(e.target.checked)}
                    />
                    <span className="toggle-track" />
                  </label>
                </div>

                <div className="toggle-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <div className="toggle-info">
                    <span className="toggle-name">Release Broadcast Advisories</span>
                    <span className="toggle-desc">
                      Notify your active customer base whenever you publish a new version tag or critical patch.
                    </span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={notifyOnRelease}
                      onChange={(e) => setNotifyOnRelease(e.target.checked)}
                    />
                    <span className="toggle-track" />
                  </label>
                </div>

                <div className="toggle-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <div className="toggle-info">
                    <span className="toggle-name">Buyer Reviews &amp; Architecture Feedback</span>
                    <span className="toggle-desc">
                      Alerts when verified purchasers submit reviews, star ratings, or questions.
                    </span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={notifyOnReview}
                      onChange={(e) => setNotifyOnReview(e.target.checked)}
                    />
                    <span className="toggle-track" />
                  </label>
                </div>
              </div>

              {/* Webhook Stream Configuration */}
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1.25rem",
                  background: "var(--bg-surface-elevated)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="form-group" style={{ margin: 0 }}>
                  <label
                    htmlFor="creator-webhook"
                    className="form-label"
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <Webhook size={14} color="var(--accent-cyan)" />
                    <span>Outgoing Developer Webhook (Discord / Slack)</span>
                  </label>
                  <input
                    id="creator-webhook"
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="form-input font-mono"
                    placeholder="https://discord.com/api/webhooks/... or https://hooks.slack.com/services/..."
                    style={{ fontSize: "0.82rem" }}
                  />
                  <div className="form-helper">
                    We will send an HTTP POST payload for every order event with gross amount, package ID, and buyer country.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="section-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {success && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "var(--accent-cyan)",
                  fontSize: "0.82rem",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <Check size={14} /> NOTIFICATION RULES SAVED IN POSTGRESQL
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || saving}
            className="btn btn-primary"
            style={{
              padding: "0.55rem 1.4rem",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                SAVING...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                SAVE NOTIFICATION RULES
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
