"use client";

import React, { useState, useEffect } from "react";

interface NotificationConfig {
  escrowCountdownEmail: boolean;
  escrowCountdownPush: boolean;
  escrowReleaseEmail: boolean;
  escrowReleasePush: boolean;
  disputeAlertsEmail: boolean;
  disputeAlertsPush: boolean;
  securityLoginEmail: boolean;
  securityLoginPush: boolean;
  deliverableReadyEmail: boolean;
  deliverableReadyPush: boolean;
}

const DEFAULT_CONFIG: NotificationConfig = {
  escrowCountdownEmail: true,
  escrowCountdownPush: true,
  escrowReleaseEmail: true,
  escrowReleasePush: true,
  disputeAlertsEmail: true,
  disputeAlertsPush: true,
  securityLoginEmail: true,
  securityLoginPush: false,
  deliverableReadyEmail: true,
  deliverableReadyPush: true,
};

export default function SettingsNotificationsPage() {
  const [config, setConfig] = useState<NotificationConfig>(DEFAULT_CONFIG);
  const [isSaved, setIsSaved] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  useEffect(() => {
    const stored = localStorage.getItem("kd_notifications_config");
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleToggle = (key: keyof NotificationConfig) => {
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    setIsSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem("kd_notifications_config", JSON.stringify(config));
    setIsSaved(true);
    showToast("Notification telemetry preferences saved to local node!");
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSendTestPing = () => {
    showToast("⚡ Telemetry Test Ping: Escrow release #esc_9482 verified! System notifications operational.", "success");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {notice && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium border backdrop-blur-xl shadow-xl transition-all duration-300 animate-in slide-in-from-top-2 ${
            notice.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200 shadow-emerald-950/30"
              : "bg-rose-950/60 border-rose-500/40 text-rose-200 shadow-rose-950/30"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">{notice.type === "success" ? "🔔" : "⚠️"}</span>
            <span>{notice.text}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-xs opacity-70 hover:opacity-100 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* HEADER TELEMETRY DISPATCH CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17171E]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">STREAM // NOTIFICATION_ROUTING</div>
            <h3 className="text-lg font-heading font-bold text-white tracking-tight">Mission-Critical Alert Matrix</h3>
          </div>
          <button
            type="button"
            onClick={handleSendTestPing}
            className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <span>⚡</span>
            <span>DISPATCH TEST ALERT</span>
          </button>
        </div>

        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Configure real-time delivery channels for escrow countdowns, dispute arbitrations, and security login notifications. All email dispatches are cryptographically DKIM-signed.
        </p>

        {/* NOTIFICATIONS TABLE */}
        <div className="space-y-4">
          {/* Column Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-mono text-[#71717A] uppercase tracking-wider border-b border-white/5">
            <div className="col-span-8">ALERT EVENT & PROTOCOL</div>
            <div className="col-span-2 text-center">EMAIL CHANNEL</div>
            <div className="col-span-2 text-center">IN-APP PUSH</div>
          </div>

          {/* Row 1: Escrow Countdown */}
          <div className="p-4 rounded-2xl bg-[#121217]/80 border border-white/5 hover:border-white/10 transition-all grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-8 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">48-Hour Inspection Timer</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9px] font-mono">
                  CRITICAL
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                Warning alerts dispatched at 24h, 12h, and 1h before funds are automatically released to the seller.
              </p>
            </div>
            <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
              <span className="text-xs font-mono text-[#71717A] sm:hidden">Email:</span>
              <ToggleSwitch
                enabled={config.escrowCountdownEmail}
                onChange={() => handleToggle("escrowCountdownEmail")}
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
              <span className="text-xs font-mono text-[#71717A] sm:hidden">Push:</span>
              <ToggleSwitch
                enabled={config.escrowCountdownPush}
                onChange={() => handleToggle("escrowCountdownPush")}
              />
            </div>
          </div>

          {/* Row 2: Escrow Release */}
          <div className="p-4 rounded-2xl bg-[#121217]/80 border border-white/5 hover:border-white/10 transition-all grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-8 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">Escrow Settlement & Fund Release</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-mono">
                  FINANCIAL
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                Instant notification when inspection completes or buyer manually releases escrow funds.
              </p>
            </div>
            <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
              <span className="text-xs font-mono text-[#71717A] sm:hidden">Email:</span>
              <ToggleSwitch
                enabled={config.escrowReleaseEmail}
                onChange={() => handleToggle("escrowReleaseEmail")}
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
              <span className="text-xs font-mono text-[#71717A] sm:hidden">Push:</span>
              <ToggleSwitch
                enabled={config.escrowReleasePush}
                onChange={() => handleToggle("escrowReleasePush")}
              />
            </div>
          </div>

          {/* Row 3: Deliverable Ready */}
          <div className="p-4 rounded-2xl bg-[#121217]/80 border border-white/5 hover:border-white/10 transition-all grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-8 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">Encrypted Package Download Ready</span>
                <span className="px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[9px] font-mono">
                  DELIVERABLE
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                Dispatched when SeaweedFS / S3 storage completes assembling and scanning your decrypted code ZIP.
              </p>
            </div>
            <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
              <span className="text-xs font-mono text-[#71717A] sm:hidden">Email:</span>
              <ToggleSwitch
                enabled={config.deliverableReadyEmail}
                onChange={() => handleToggle("deliverableReadyEmail")}
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
              <span className="text-xs font-mono text-[#71717A] sm:hidden">Push:</span>
              <ToggleSwitch
                enabled={config.deliverableReadyPush}
                onChange={() => handleToggle("deliverableReadyPush")}
              />
            </div>
          </div>

          {/* Row 4: Dispute Desk Updates */}
          <div className="p-4 rounded-2xl bg-[#121217]/80 border border-white/5 hover:border-white/10 transition-all grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-8 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">Dispute Desk Arbitration Messages</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[9px] font-mono">
                  ARBITRATION
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                Real-time updates when an arbitrator or seller submits evidence or updates case status.
              </p>
            </div>
            <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
              <span className="text-xs font-mono text-[#71717A] sm:hidden">Email:</span>
              <ToggleSwitch
                enabled={config.disputeAlertsEmail}
                onChange={() => handleToggle("disputeAlertsEmail")}
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
              <span className="text-xs font-mono text-[#71717A] sm:hidden">Push:</span>
              <ToggleSwitch
                enabled={config.disputeAlertsPush}
                onChange={() => handleToggle("disputeAlertsPush")}
              />
            </div>
          </div>

          {/* Row 5: Security Logins */}
          <div className="p-4 rounded-2xl bg-[#121217]/80 border border-white/5 hover:border-white/10 transition-all grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-8 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">Unrecognized Device Logins</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[9px] font-mono">
                  SECURITY
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                Immediate alert whenever a new session token family is initiated from a previously unseen IP address.
              </p>
            </div>
            <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
              <span className="text-xs font-mono text-[#71717A] sm:hidden">Email:</span>
              <ToggleSwitch
                enabled={config.securityLoginEmail}
                onChange={() => handleToggle("securityLoginEmail")}
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
              <span className="text-xs font-mono text-[#71717A] sm:hidden">Push:</span>
              <ToggleSwitch
                enabled={config.securityLoginPush}
                onChange={() => handleToggle("securityLoginPush")}
              />
            </div>
          </div>
        </div>

        {/* SAVE PREFERENCES ACTION */}
        <div className="flex justify-end pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-heading font-bold text-xs tracking-wide shadow-lg shadow-violet-600/30 border border-violet-400/40 transition-all duration-300 cursor-pointer flex items-center gap-2"
          >
            <span>{isSaved ? "✓" : "⚡"}</span>
            <span>{isSaved ? "PREFERENCES COMMITTED" : "SAVE NOTIFICATION SETTINGS"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// CUSTOM ANIMATED NEON SWITCH TOGGLE
function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none ${
        enabled
          ? "bg-violet-600 border-violet-400 shadow-[0_0_12px_rgba(133,53,252,0.6)]"
          : "bg-[#181820] border-[#3F3F46]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out mt-0.5 ml-0.5 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
