"use client";

import React, { useState, useEffect } from "react";
import { Receipt, Check, FileText, ShieldCheck, Sparkles } from "lucide-react";

export const TaxComplianceSettings: React.FC = () => {
  const [legalEntityType, setLegalEntityType] = useState<"INDIVIDUAL" | "LLP" | "PVT_LTD">("INDIVIDUAL");
  const [gstin, setGstin]                     = useState("");
  const [pan, setPan]                         = useState("");
  const [billingAddress, setBillingAddress]   = useState("");
  const [city, setCity]                       = useState("");
  const [state, setState]                     = useState("");
  const [loading, setLoading]                 = useState(true);
  const [saving, setSaving]                   = useState(false);
  const [success, setSuccess]                 = useState(false);
  const [errorMsg, setErrorMsg]               = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/studio/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.tax) {
          const t = d.data.tax;
          setLegalEntityType(t.legal_entity_type || "INDIVIDUAL");
          setGstin(t.gstin || "");
          setPan(t.pan || "");
          setBillingAddress(t.billing_address || "");
          setCity(t.city || "");
          setState(t.state || "");
        }
      })
      .catch(() => {
        setErrorMsg("Failed to connect to tax compliance service");
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
          tax: {
            legal_entity_type: legalEntityType,
            gstin: gstin.trim().toUpperCase(),
            pan: pan.trim().toUpperCase(),
            billing_address: billingAddress.trim(),
            city: city.trim(),
            state: state.trim(),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      } else {
        setErrorMsg(data.error?.message || "Failed to update tax compliance details");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while saving tax details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-card" id="settings-tax-compliance">
      <div className="section-card-header">
        <div>
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Tax Compliance &amp; GST Invoicing</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.2rem 0.5rem",
                fontSize: "0.68rem",
                fontFamily: "var(--font-mono)",
                background: "rgba(56, 189, 248, 0.12)",
                color: "var(--accent-cyan)",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}
            >
              <ShieldCheck size={11} /> 1% TDS (SEC 194-O) READY
            </span>
          </div>
          <div className="card-desc">
            Legal entity details, GSTIN, PAN, and registered billing address stored in PostgreSQL for automated commission and payout tax invoices.
          </div>
        </div>
        <Receipt size={18} color="var(--accent-primary)" aria-hidden="true" />
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
              Loading PostgreSQL Tax Compliance Records...
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

              {/* Legal Entity Type Picker */}
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Creator Legal Entity Structure</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginTop: "0.4rem" }}>
                  {[
                    { id: "INDIVIDUAL", label: "Individual / Freelancer", desc: "Proprietor or Solo Developer" },
                    { id: "LLP", label: "LLP (Partnership)", desc: "Limited Liability Partnership" },
                    { id: "PVT_LTD", label: "Pvt Ltd Company", desc: "Incorporated Software Entity" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLegalEntityType(item.id as any)}
                      style={{
                        padding: "0.85rem",
                        borderRadius: "var(--radius-md)",
                        border: legalEntityType === item.id ? "1.5px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                        background: legalEntityType === item.id ? "rgba(56, 189, 248, 0.08)" : "var(--bg-surface-elevated)",
                        color: legalEntityType === item.id ? "var(--text-primary)" : "var(--text-secondary)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{item.label}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* GSTIN & PAN Grid */}
              <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                <div className="form-group">
                  <label htmlFor="tax-gstin" className="form-label">
                    GSTIN (Goods and Services Tax ID)
                  </label>
                  <input
                    id="tax-gstin"
                    type="text"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="form-input font-mono"
                    placeholder="27AABCU9603R1ZM"
                  />
                  <div className="form-helper">
                    Optional for creators below turnover threshold. Mandatory for registered business entities.
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="tax-pan" className="form-label">
                    PAN (Permanent Account Number)
                  </label>
                  <input
                    id="tax-pan"
                    type="text"
                    maxLength={10}
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    className="form-input font-mono"
                    placeholder="ABCDE1234F"
                  />
                  <div className="form-helper">
                    Required for 1% TDS deduction and Form 16A generation under Income Tax Section 194-O.
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label htmlFor="billing-address" className="form-label">
                  Registered Registered Billing / Office Address
                </label>
                <input
                  id="billing-address"
                  type="text"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="form-input"
                  placeholder="Suite 404, Cyber Towers, Hitec City"
                />
              </div>

              <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "0.5rem" }}>
                <div className="form-group">
                  <label htmlFor="billing-city" className="form-label">City</label>
                  <input
                    id="billing-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-input"
                    placeholder="Bengaluru"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="billing-state" className="form-label">State / Province</label>
                  <input
                    id="billing-state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="form-input"
                    placeholder="Karnataka"
                  />
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
                <Check size={14} /> TAX COMPLIANCE RECORD UPDATED
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
                UPDATE TAX PROFILE
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
