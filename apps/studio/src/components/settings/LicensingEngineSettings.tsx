"use client";

import React, { useState, useEffect } from "react";
import { Key, Check, ShieldCheck, Cpu, Terminal, Sparkles } from "lucide-react";

export const LicensingEngineSettings: React.FC = () => {
  const [standardPriceInr, setStandardPriceInr] = useState<number>(4999);
  const [extendedPriceInr, setExtendedPriceInr] = useState<number>(14999);
  const [allowedDomains, setAllowedDomains]     = useState<number>(1);
  const [machineSeats, setMachineSeats]         = useState<number>(3);
  const [loading, setLoading]                   = useState(true);
  const [saving, setSaving]                     = useState(false);
  const [success, setSuccess]                   = useState(false);
  const [errorMsg, setErrorMsg]                 = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/studio/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.licensing) {
          const lic = d.data.licensing;
          if (lic.default_standard_price_paise) {
            setStandardPriceInr(Math.round(lic.default_standard_price_paise / 100));
          }
          if (lic.default_extended_price_paise) {
            setExtendedPriceInr(Math.round(lic.default_extended_price_paise / 100));
          }
          if (lic.default_allowed_domains) {
            setAllowedDomains(Number(lic.default_allowed_domains));
          }
          if (lic.default_machine_seats) {
            setMachineSeats(Number(lic.default_machine_seats));
          }
        }
      })
      .catch(() => {
        setErrorMsg("Failed to connect to licensing settings service");
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
          licensing: {
            default_standard_price_paise: Math.round(standardPriceInr * 100),
            default_extended_price_paise: Math.round(extendedPriceInr * 100),
            default_allowed_domains: Number(allowedDomains),
            default_machine_seats: Number(machineSeats),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      } else {
        setErrorMsg(data.error?.message || "Failed to update licensing configuration");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while saving licensing preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-card" id="settings-licensing-engine">
      <div className="section-card-header">
        <div>
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Licensing Engine &amp; Cryptography</span>
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
              <Cpu size={11} /> ED25519 ACTIVE
            </span>
          </div>
          <div className="card-desc">
            Define default cryptographic bounds, domain activation limits, and baseline retail pricing for your published architectures.
          </div>
        </div>
        <Key size={18} color="var(--accent-primary)" aria-hidden="true" />
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
              Loading Cryptographic Engine Defaults...
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

              {/* Cryptographic Architecture Badge Card */}
              <div
                style={{
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                  <ShieldCheck size={18} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    Automated Ed25519 Curve25519 Signature Generation
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  Every license key emitted upon buyer checkout is signed using an Ed25519 asymmetric cryptographic pair. The payload embeds buyer identity, machine seat allocations, domain bindings, and checksum verification hashes to prevent piracy or unauthorized redistribution.
                </p>
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.5rem 0.75rem",
                    background: "rgba(0,0,0,0.4)",
                    borderRadius: "var(--radius-sm)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Terminal size={12} color="var(--accent-primary)" />
                  <span>KEY FORMAT: KD_ED25519_&lt;ORDER_HASH&gt;_&lt;SIGNATURE_DIGEST&gt;</span>
                </div>
              </div>

              {/* Default Pricing Defaults Grid */}
              <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                <div className="form-group">
                  <label htmlFor="standard-price" className="form-label">
                    Default Standard License Price (₹ INR)
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                      }}
                    >
                      ₹
                    </span>
                    <input
                      id="standard-price"
                      type="number"
                      min={100}
                      step={50}
                      required
                      value={standardPriceInr}
                      onChange={(e) => setStandardPriceInr(Number(e.target.value))}
                      className="form-input font-mono"
                      style={{ paddingLeft: "1.8rem" }}
                      placeholder="4999"
                    />
                  </div>
                  <div className="form-helper">
                    Suggested retail price pre-filled when creating new architecture deployments.
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="extended-price" className="form-label">
                    Default Extended Commercial Price (₹ INR)
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                      }}
                    >
                      ₹
                    </span>
                    <input
                      id="extended-price"
                      type="number"
                      min={500}
                      step={100}
                      required
                      value={extendedPriceInr}
                      onChange={(e) => setExtendedPriceInr(Number(e.target.value))}
                      className="form-input font-mono"
                      style={{ paddingLeft: "1.8rem" }}
                      placeholder="14999"
                    />
                  </div>
                  <div className="form-helper">
                    Enterprise tier permitting multi-client distribution and unlimited developer seats.
                  </div>
                </div>
              </div>

              {/* Default Domain & Machine Seat Limits */}
              <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "0.5rem" }}>
                <div className="form-group">
                  <label htmlFor="allowed-domains" className="form-label">
                    Default Domain Activations (Standard Tier)
                  </label>
                  <select
                    id="allowed-domains"
                    value={allowedDomains}
                    onChange={(e) => setAllowedDomains(Number(e.target.value))}
                    className="form-input font-mono"
                  >
                    <option value={1}>1 Production Domain (Standard Single-Site)</option>
                    <option value={2}>2 Domains (Production + Staging Subdomain)</option>
                    <option value={3}>3 Domains (Multi-Environment)</option>
                    <option value={5}>5 Domains (Agency Multi-Project)</option>
                  </select>
                  <div className="form-helper">
                    Number of unique domain hostnames allowed to report telemetry per license.
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="machine-seats" className="form-label">
                    Default Developer Machine Seats
                  </label>
                  <select
                    id="machine-seats"
                    value={machineSeats}
                    onChange={(e) => setMachineSeats(Number(e.target.value))}
                    className="form-input font-mono"
                  >
                    <option value={1}>1 Developer Workstation</option>
                    <option value={3}>3 Developer Seats (Small Engineering Pod)</option>
                    <option value={5}>5 Developer Seats (Core Product Team)</option>
                    <option value={10}>10 Developer Seats (Mid-Size Engineering Guild)</option>
                  </select>
                  <div className="form-helper">
                    Maximum concurrent CLI developer workstations authorized to build against the binary.
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
                <Check size={14} /> LICENSING DEFAULTS UPDATED IN POSTGRESQL
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
                SAVE LICENSING DEFAULTS
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
