"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";

const NOTIF_SETTINGS = [
  { id: "new-release",  label: "New Version Releases",        desc: "Alert when any acquired software publishes a new release." },
  { id: "security-patch", label: "Security Patch Advisories", desc: "Critical CVE and dependency vulnerability notifications." },
  { id: "download-ready", label: "Signed Download Ready",     desc: "Notify when a 60-second signed link is generated." },
  { id: "payment-confirm", label: "Payment Confirmations",    desc: "Receipt notifications after successful purchases." },
  { id: "license-expiry", label: "License Expiry Warnings",   desc: "7-day advance notice before any license expires." },
  { id: "newsletter",   label: "KodeDock Product Newsletter",  desc: "Monthly digest of new tools and platform updates." },
];

export const NotificationController: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_SETTINGS.map((s) => [s.id, true]))
  );

  const toggle = (id: string) =>
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <section className="section-card" id="settings-notifications">
      <div className="section-card-header">
        <div>
          <div className="card-title">Notification Preferences</div>
          <div className="card-desc">Control which alerts and events trigger email and in-app notifications.</div>
        </div>
        <Bell size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        {NOTIF_SETTINGS.map((item, i) => (
          <div
            key={item.id}
            className="toggle-row"
            style={{ borderBottom: i < NOTIF_SETTINGS.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
          >
            <div className="toggle-info">
              <div className="toggle-name">{item.label}</div>
              <div className="toggle-desc">{item.desc}</div>
            </div>
            <label className="toggle" aria-label={`Toggle ${item.label}`}>
              <input
                type="checkbox"
                checked={settings[item.id]}
                onChange={() => toggle(item.id)}
                aria-checked={settings[item.id]}
              />
              <span className="toggle-track" aria-hidden="true" />
            </label>
          </div>
        ))}
      </div>

      <div className="section-card-footer">
        <button type="button" className="btn btn-primary btn-md">Save Preferences</button>
      </div>
    </section>
  );
};
