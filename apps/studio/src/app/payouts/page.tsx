"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  QrCode,
  Check,
  Plus,
} from "lucide-react";
import type { CreatorPayout } from "@/types/studio";

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<CreatorPayout[]>([]);
  const [pendingBalancePaise, setPendingBalancePaise] = useState<number>(0);
  const [totalWithdrawnPaise, setTotalWithdrawnPaise] = useState<number>(0);
  const [upiId, setUpiId] = useState<string>("creator@okhdfcbank");
  const [isEditingUpi, setIsEditingUpi] = useState<boolean>(false);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [requestAmountINR, setRequestAmountINR] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/studio/payouts")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setPayouts(d.data.payouts || []);
          setPendingBalancePaise(d.data.pendingBalancePaise || 0);
          setTotalWithdrawnPaise(d.data.totalWithdrawnPaise || 0);
          if (d.data.upiId) setUpiId(d.data.upiId);
        }
      })
      .catch(() => {});
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountINR = parseInt(requestAmountINR, 10);
    if (isNaN(amountINR) || amountINR <= 0) {
      setStatusMessage({ text: "Please enter a valid payout amount.", success: false });
      return;
    }

    const amountPaise = amountINR * 100;
    if (amountPaise > pendingBalancePaise && pendingBalancePaise > 0) {
      setStatusMessage({ text: "Amount exceeds your available withdrawable balance.", success: false });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/studio/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaise, payoutAccount: `UPI: ${upiId}` }),
      });

      const json = await res.json();
      if (json.success) {
        setShowRequestModal(false);
        setStatusMessage({ text: "Payout request submitted successfully. Processing via IMPS/UPI.", success: true });
        // Refresh payouts list
        const refreshed = await fetch("/api/studio/payouts").then((r) => r.json());
        if (refreshed.success && refreshed.data) {
          setPayouts(refreshed.data.payouts || []);
          setPendingBalancePaise(refreshed.data.pendingBalancePaise || 0);
          setTotalWithdrawnPaise(refreshed.data.totalWithdrawnPaise || 0);
        }
      } else {
        setStatusMessage({ text: json.error?.message || "Failed to process payout request.", success: false });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Network error.", success: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "5rem" }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "0.25rem 0.65rem", borderRadius: "9999px", fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--status-success)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
            <Wallet size={13} />
            <span>Monetization &amp; Banking</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>
            Creator Payouts
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            You keep 95% of every codebase sale. Fast disbursement to your UPI ID or Bank Account.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setRequestAmountINR(Math.floor(pendingBalancePaise / 100).toString());
            setShowRequestModal(true);
          }}
          className="btn btn-primary"
          style={{ padding: "0.6rem 1.25rem", fontSize: "0.82rem" }}
        >
          <Wallet size={15} />
          <span>Request Payout</span>
        </button>
      </div>

      {statusMessage && (
        <div style={{ background: statusMessage.success ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", border: `1px solid ${statusMessage.success ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`, color: statusMessage.success ? "var(--status-success)" : "var(--status-danger)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          {statusMessage.text}
        </div>
      )}

      {/* ── Financial Cards (Bento Grid) ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        {/* Available Balance */}
        <div className="portal-stat-card">
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Available Withdrawable Balance
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: 800, color: "var(--status-success)", marginBottom: "0.35rem" }}>
            ₹{(pendingBalancePaise / 100).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Accumulated 95% creator share ready for transfer
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="portal-stat-card">
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Total Disbursed to Date
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: 800, color: "var(--accent-cyan)", marginBottom: "0.35rem" }}>
            ₹{(totalWithdrawnPaise / 100).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Successfully paid to your bank / UPI accounts
          </div>
        </div>

        {/* Split Breakdown */}
        <div className="portal-stat-card">
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Revenue Share Structure
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.35rem" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: 800, color: "var(--accent-primary)" }}>
              95%
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              / 5% Platform Fee
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Zero hidden fees, zero payment processor markups
          </div>
        </div>
      </div>

      {/* ── Payout Destination (UPI / Bank Account) ───────────────────────── */}
      <div className="portal-card" style={{ padding: "1.75rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.25rem" }}>
              Active Payout Destination
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Funds will be transferred directly to this account when you request a payout.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingUpi(!isEditingUpi)}
            className="btn btn-secondary"
            style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem" }}
          >
            {isEditingUpi ? "Done" : "Update Account"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "rgba(139, 92, 246, 0.12)", border: "1px solid rgba(139, 92, 246, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)", flexShrink: 0 }}>
            <QrCode size={20} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
              Primary UPI ID (Instant IMPS Settlement)
            </div>
            {isEditingUpi ? (
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="form-input-custom"
                style={{ marginTop: "0.35rem", maxWidth: "320px", fontSize: "0.85rem" }}
              />
            ) : (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem", fontWeight: 700, color: "#ffffff", marginTop: "0.25rem" }}>
                {upiId}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "var(--status-success)" }}>
            <CheckCircle2 size={15} />
            <span>Verified</span>
          </div>
        </div>
      </div>

      {/* ── Payouts History Ledger ────────────────────────────────────────── */}
      <div className="portal-card" style={{ padding: "1.75rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.25rem" }}>
          Payout History Ledger
        </h2>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
          Immutable records of all withdrawal requests and settlements recorded in PostgreSQL `seller_payouts`.
        </p>

        {payouts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1.5rem", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
            <Clock size={28} color="var(--text-muted)" style={{ margin: "0 auto 0.75rem" }} />
            <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.25rem" }}>
              No Payout Requests Yet
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "420px", margin: "0 auto" }}>
              As you accumulate sales from your published boilerplates, you can request instant disbursements anytime.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "uppercase" }}>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Payout Reference</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Destination</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Net Amount</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Platform Fee (5%)</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Status</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((pay) => (
                  <tr key={pay.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "0.85rem 0.5rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", fontWeight: 600 }}>
                      KD-PAY-{pay.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem", color: "#ffffff", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
                      {pay.payoutAccount}
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem", fontFamily: "var(--font-mono)", color: "var(--status-success)", fontWeight: 700 }}>
                      {pay.formattedAmount || `₹${(pay.amountPaise / 100).toLocaleString("en-IN")}`}
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      ₹{(pay.platformFeePaise / 100).toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontFamily: "var(--font-mono)",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: 700,
                          background:
                            pay.status === "COMPLETED"
                              ? "rgba(16, 185, 129, 0.12)"
                              : pay.status === "PROCESSING"
                              ? "rgba(56, 189, 248, 0.12)"
                              : "rgba(245, 158, 11, 0.12)",
                          color:
                            pay.status === "COMPLETED"
                              ? "var(--status-success)"
                              : pay.status === "PROCESSING"
                              ? "var(--accent-cyan)"
                              : "var(--status-warning)",
                        }}
                      >
                        {pay.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem", textAlign: "right", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {new Date(pay.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Request Payout Modal ──────────────────────────────────────────── */}
      {showRequestModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(5, 5, 8, 0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div className="double-bezel-card" style={{ width: "100%", maxWidth: "480px" }}>
            <div className="double-bezel-inner" style={{ padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "#ffffff" }}>
                  Request Payout
                </h2>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn btn-ghost"
                  style={{ padding: "0.3rem 0.6rem" }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRequestPayout}>
                <div className="form-group-custom">
                  <label className="form-label-custom">Withdrawal Amount (INR)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", color: "var(--accent-cyan)", fontWeight: 700 }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      value={requestAmountINR}
                      onChange={(e) => setRequestAmountINR(e.target.value)}
                      placeholder="Amount to withdraw"
                      className="form-input-custom"
                      style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 700 }}
                    />
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
                    Max available: ₹{(pendingBalancePaise / 100).toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Destination UPI Address</label>
                  <input
                    type="text"
                    disabled
                    value={upiId}
                    className="form-input-custom"
                    style={{ fontFamily: "var(--font-mono)", opacity: 0.8 }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="btn btn-secondary"
                    style={{ padding: "0.55rem 1rem", fontSize: "0.82rem" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ padding: "0.55rem 1.25rem", fontSize: "0.82rem" }}
                  >
                    {isSubmitting ? "Submitting Request..." : "Confirm & Transfer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
