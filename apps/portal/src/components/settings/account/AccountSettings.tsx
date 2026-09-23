"use client";

import React from "react";
import { User } from "lucide-react";

export interface AccountSettingsProps {
  initialEmail?: string;
  initialName?: string;
  initialUsername?: string;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  initialEmail = "developer@kodedock.com",
  initialName = "KodeDock Developer",
  initialUsername = "kodedev",
}) => {
  return (
    <section className="section-card" id="settings-account">
      <div className="section-card-header">
        <div>
          <div className="card-title">Account Information</div>
          <div className="card-desc">Update your developer name, primary contact email, and public handle.</div>
        </div>
        <User size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="account-name" className="form-label">Full Name</label>
            <input id="account-name" type="text" defaultValue={initialName} className="form-input" placeholder="Your Name" />
          </div>

          <div className="form-group">
            <label htmlFor="account-username" className="form-label">Developer Handle</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: "0.85rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.88rem" }}>@</span>
              <input id="account-username" type="text" defaultValue={initialUsername} className="form-input" style={{ paddingLeft: "1.75rem" }} placeholder="username" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="account-email" className="form-label">Email Address</label>
            <input id="account-email" type="email" defaultValue={initialEmail} className="form-input" placeholder="developer@example.com" />
          </div>

          <div className="form-group">
            <label htmlFor="account-timezone" className="form-label">Timezone</label>
            <select id="account-timezone" className="form-select" defaultValue="Asia/Kolkata">
              <option value="Asia/Kolkata">Asia/Kolkata (IST — UTC+05:30)</option>
              <option value="America/New_York">America/New_York (EST — UTC-05:00)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST — UTC-08:00)</option>
              <option value="Europe/London">Europe/London (GMT — UTC+00:00)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="section-card-footer">
        <button type="button" className="btn btn-primary btn-md">Save Changes</button>
      </div>
    </section>
  );
};
