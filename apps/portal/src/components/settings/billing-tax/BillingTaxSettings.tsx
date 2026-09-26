"use client";

import React, { useState, useEffect } from "react";
import { Receipt, Check } from "lucide-react";

export const BillingTaxSettings: React.FC = () => {
  const [gstin, setGstin]                   = useState("");
  const [pan, setPan]                       = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [city, setCity]                     = useState("");
  const [state, setState]                   = useState("");
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [success, setSuccess]               = useState(false);

  useEffect(() => {
    fetch("/api/portal/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setGstin(d.data.gstin || "");
          setPan(d.data.pan || "");
          setBillingAddress(d.data.billingAddress || "");
          setCity(d.data.city || "");
          setState(d.data.state || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/portal/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gstin: gstin.trim(),
          pan: pan.trim(),
          billingAddress: billingAddress.trim(),
          city: city.trim(),
          state: state.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      // Error handling
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-card" id="settings-billing-tax">
      <div className="section-card-header">
        <div>
          <div className="card-title">Billing &amp; Tax Information</div>
          <div className="card-desc">
            GST number for business invoicing, billing address, and PAN details stored securely in PostgreSQL.
          </div>
        </div>
        <Receipt size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <form onSubmit={handleSave}>
        <div className="section-card-body">
          {loading ? (
            <div className="font-mono text-muted" style={{ padding: "1.5rem 0", fontSize: "0.78rem" }}>
              Syncing PostgreSQL Tax &amp; Billing Data...
            </div>
          ) : (
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="gstin" className="form-label">GSTIN (GST Number)</label>
                <input
                  id="gstin"
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="form-input font-mono"
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                />
                <div className="form-helper">Optional — enter for B2B GST invoices on purchases.</div>
              </div>

              <div className="form-group">
                <label htmlFor="pan" className="form-label">PAN Number</label>
                <input
                  id="pan"
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="form-input font-mono"
                  placeholder="AAAAA0000A"
                  maxLength={10}
                />
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="billing-address" className="form-label">Billing Address</label>
                <textarea
                  id="billing-address"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="form-textarea"
                  placeholder="Enter full address for official tax receipts..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="billing-city" className="form-label">City</label>
                <input
                  id="billing-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div className="form-group">
                <label htmlFor="billing-state" className="form-label">State</label>
                <input
                  id="billing-state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Maharashtra"
                />
              </div>
            </div>
          )}
        </div>

        <div className="section-card-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {success ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--status-success)", fontSize: "0.82rem", fontWeight: 600 }}>
              <Check size={16} aria-hidden="true" />
              <span>Tax &amp; Billing Info Saved in PostgreSQL!</span>
            </div>
          ) : <div />}

          <button type="submit" disabled={saving || loading} className="btn btn-primary btn-md">
            {saving ? "Saving to DB..." : "Save Tax Info"}
          </button>
        </div>
      </form>
    </section>
  );
};
