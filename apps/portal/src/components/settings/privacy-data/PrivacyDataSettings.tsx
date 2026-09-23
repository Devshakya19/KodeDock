"use client";

import React from "react";
import { Lock, Download, Eye } from "lucide-react";

export const PrivacyDataSettings: React.FC = () => {
  return (
    <section className="section-card" id="settings-privacy-data">
      <div className="section-card-header">
        <div>
          <div className="card-title">Privacy & Data Export</div>
          <div className="card-desc">Control your data visibility, download a full export, and manage third-party data sharing.</div>
        </div>
        <Lock size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        {/* Profile visibility */}
        <div className="toggle-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="toggle-info">
            <div className="toggle-name">Public Developer Profile</div>
            <div className="toggle-desc">Allow other KodeDock users to view your profile and tech stack.</div>
          </div>
          <label className="toggle" aria-label="Toggle public profile visibility">
            <input type="checkbox" defaultChecked aria-checked="true" />
            <span className="toggle-track" aria-hidden="true" />
          </label>
        </div>

        {/* Purchase history */}
        <div className="toggle-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="toggle-info">
            <div className="toggle-name">Purchase History Visibility</div>
            <div className="toggle-desc">Show which software products you have acquired on your public profile.</div>
          </div>
          <label className="toggle" aria-label="Toggle purchase history visibility">
            <input type="checkbox" aria-checked="false" />
            <span className="toggle-track" aria-hidden="true" />
          </label>
        </div>

        {/* Analytics */}
        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-name">Analytics Data Sharing</div>
            <div className="toggle-desc">Help improve KodeDock by sharing anonymized usage analytics.</div>
          </div>
          <label className="toggle" aria-label="Toggle analytics data sharing">
            <input type="checkbox" defaultChecked aria-checked="true" />
            <span className="toggle-track" aria-hidden="true" />
          </label>
        </div>

        <div className="divider" />

        {/* Data Export */}
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
          Export Your Data
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
          Download a complete archive of your account data including orders, licenses, and profile information in JSON format.
        </p>
        <button type="button" className="btn btn-secondary btn-md">
          <Download size={15} aria-hidden="true" />
          <span>Request Data Export</span>
        </button>
      </div>
    </section>
  );
};
