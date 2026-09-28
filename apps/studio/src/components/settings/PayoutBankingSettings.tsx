"use client";

import React, { useState, useEffect } from "react";
import { Coins, Check, Building2, Smartphone, ArrowRight, ShieldCheck } from "lucide-react";

export const PayoutBankingSettings: React.FC = () => {
  const [payoutChannel, setPayoutChannel] = useState<"UPI" | "BANK_TRANSFER">("UPI");
  const [upiId, setUpiId]                 = useState("");
  const [bankName, setBankName]           = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc]           = useState("");
  const [bankHolderName, setBankHolderName] = useState("");
  const [thresholdInr, setThresholdInr]   = useState(5000);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [success, setSuccess]             = useState(false);
  const [errorMsg, setErrorMsg]           = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/studio/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.payouts) {
          const p = d.data.payouts;
          setPayoutChannel(p.payout_channel === "BANK_TRANSFER" ? "BANK_TRANSFER" : "UPI");
          setUpiId(p.upi_id || "");
          setBankName(p.bank_name || "");
          setBankAccountNumber(p.bank_account_number || "");
          setBankIfsc(p.bank_ifsc || "");
          setBankHolderName(p.bank_holder_name || "");
          setThresholdInr(Number(p.payout_threshold_inr) || 5000);
        }
      })
      .catch(() => {
        setErrorMsg("Failed to load payout settings from PostgreSQL");
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
          payouts: {
            payout_channel: payoutChannel,
            upi_id: upiId.trim(),
            bank_name: bankName.trim(),
            bank_account_number: bankAccountNumber.trim(),
            bank_ifsc: bankIfsc.trim().toUpperCase(),
            bank_holder_name: bankHolderName.trim(),
            payout_threshold_inr: Number(thresholdInr),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      } else {
        setErrorMsg(data.error?.message || "Failed to update payout preferences");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while saving payout settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-card" id="settings-payout-banking">
      <div className="section-card-header">
        <div>
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Payout &amp; Banking Rails</span>
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
              95% CREATOR SPLIT
            </span>
          </div>
          <div className="card-desc">
            Direct INR settlements to your bank account or UPI VPA with automated protocol thresholds.
          </div>
        </div>
        <Coins size={18} color="var(--accent-primary)" aria-hidden="true" />
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
              Syncing PostgreSQL Payout Ledger Data...
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

              {/* Protocol Split Info Card */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(56, 189, 248, 0.04) 100%)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1.5rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <ShieldCheck size={16} color="var(--accent-primary)" />
                    Zero-Intermediary Software Revenue
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem", lineHeight: 1.5 }}>
                    You receive <strong style={{ color: "#fff" }}>95%</strong> of gross sales credited immediately upon order fulfillment. KodeDock retains a 5% protocol infrastructure fee.
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontFamily: "var(--font-mono)",
                    background: "rgba(0,0,0,0.3)",
                    padding: "0.6rem 1rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>YOUR TAKE-HOME</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-cyan)" }}>95.0%</div>
                </div>
              </div>

              {/* Settlement Channel Switcher */}
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Primary Payout Disbursement Channel</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setPayoutChannel("UPI")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "1rem",
                      borderRadius: "var(--radius-md)",
                      border: payoutChannel === "UPI" ? "1.5px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                      background: payoutChannel === "UPI" ? "rgba(56, 189, 248, 0.08)" : "var(--bg-surface-elevated)",
                      color: payoutChannel === "UPI" ? "var(--text-primary)" : "var(--text-secondary)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Smartphone size={22} color={payoutChannel === "UPI" ? "var(--accent-cyan)" : "var(--text-muted)"} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>Instant UPI (VPA)</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Zero-delay instant settlements 24/7</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutChannel("BANK_TRANSFER")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "1rem",
                      borderRadius: "var(--radius-md)",
                      border: payoutChannel === "BANK_TRANSFER" ? "1.5px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                      background: payoutChannel === "BANK_TRANSFER" ? "rgba(139, 92, 246, 0.08)" : "var(--bg-surface-elevated)",
                      color: payoutChannel === "BANK_TRANSFER" ? "var(--text-primary)" : "var(--text-secondary)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Building2 size={22} color={payoutChannel === "BANK_TRANSFER" ? "var(--accent-primary)" : "var(--text-muted)"} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>Direct Bank Transfer (NEFT/RTGS)</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Direct routing to registered business account</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* UPI Form */}
              {payoutChannel === "UPI" && (
                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label htmlFor="payout-upi" className="form-label">
                    UPI Virtual Payment Address (VPA)
                  </label>
                  <input
                    id="payout-upi"
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="form-input font-mono"
                    placeholder="architect@okhdfcbank or founder@upi"
                  />
                  <div className="form-helper">
                    Real-time automated settlements trigger directly to this UPI address.
                  </div>
                </div>
              )}

              {/* Bank Transfer Form */}
              {payoutChannel === "BANK_TRANSFER" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group">
                      <label htmlFor="bank-holder" className="form-label">Account Holder Legal Name</label>
                      <input
                        id="bank-holder"
                        type="text"
                        required
                        value={bankHolderName}
                        onChange={(e) => setBankHolderName(e.target.value)}
                        className="form-input"
                        placeholder="Nexus Architecture Technologies LLP"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="bank-name" className="form-label">Bank Institution Name</label>
                      <input
                        id="bank-name"
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="form-input"
                        placeholder="HDFC Bank Ltd."
                      />
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group">
                      <label htmlFor="bank-account" className="form-label">Account Number</label>
                      <input
                        id="bank-account"
                        type="password"
                        required
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="form-input font-mono"
                        placeholder="50200001234567"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="bank-ifsc" className="form-label">IFSC Code</label>
                      <input
                        id="bank-ifsc"
                        type="text"
                        required
                        maxLength={11}
                        value={bankIfsc}
                        onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                        className="form-input font-mono"
                        placeholder="HDFC0000123"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Automatic Payout Threshold */}
              <div className="form-group" style={{ marginBottom: "0.5rem" }}>
                <label htmlFor="payout-threshold" className="form-label">
                  Automatic Settlement Threshold (INR)
                </label>
                <select
                  id="payout-threshold"
                  value={thresholdInr}
                  onChange={(e) => setThresholdInr(Number(e.target.value))}
                  className="form-input"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <option value={1000}>₹1,000 (Rapid Daily Payout)</option>
                  <option value={5000}>₹5,000 (Standard Recommended)</option>
                  <option value={10000}>₹10,000 (Bi-Weekly Batch)</option>
                  <option value={25000}>₹25,000 (Monthly Enterprise Settlement)</option>
                  <option value={50000}>₹50,000 (High Volume Threshold)</option>
                </select>
                <div className="form-helper">
                  Once your uncollected sales balance crosses this amount, an automatic payout transaction is submitted to the ledger.
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
                <Check size={14} /> PAYOUT RAILS UPDATED IN POSTGRESQL
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
                <ArrowRight size={14} />
                UPDATE PAYOUT RAILS
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
