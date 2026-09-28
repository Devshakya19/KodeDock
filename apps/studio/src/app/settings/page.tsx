"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreatorProfileSettings,
  PayoutBankingSettings,
  LicensingEngineSettings,
  StorageVaultSettings,
  NotificationRulesSettings,
  CliApiKeysSettings,
  TaxComplianceSettings,
  DangerZoneSettings,
} from "@/components/settings";
import {
  User,
  Coins,
  Key,
  HardDrive,
  Bell,
  Terminal,
  Receipt,
  AlertTriangle,
  Sliders,
  ShieldCheck,
} from "lucide-react";

type StudioSettingsTab =
  | "profile"
  | "payouts"
  | "licensing"
  | "storage"
  | "notifications"
  | "cli-keys"
  | "tax"
  | "danger-zone";

const TABS: { id: StudioSettingsTab; label: string; icon: any; danger?: boolean; tag?: string }[] = [
  { id: "profile",       label: "Creator Profile",   icon: User },
  { id: "payouts",       label: "Payouts & Banking", icon: Coins, tag: "95%" },
  { id: "licensing",     label: "Licensing Engine",  icon: Key },
  { id: "storage",       label: "R2 Storage Vault",  icon: HardDrive },
  { id: "notifications", label: "Notifications",     icon: Bell },
  { id: "cli-keys",      label: "CLI Deploy Keys",   icon: Terminal },
  { id: "tax",           label: "Tax & Compliance",  icon: Receipt },
  { id: "danger-zone",   label: "Danger Zone",       icon: AlertTriangle, danger: true },
];

const panelVariants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } as any },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

export default function StudioSettingsPage() {
  const [activeTab, setActiveTab] = useState<StudioSettingsTab>("profile");

  return (
    <div className="page-container" style={{ paddingBottom: "6rem" }}>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: "2.25rem" }}
      >
        <div
          className="page-eyebrow"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--accent-primary)",
          }}
        >
          <Sliders size={13} />
          <span>STUDIO PREFERENCES // ARCHITECT CONSOLE</span>
        </div>

        <h1 className="page-title" style={{ marginTop: "0.5rem", marginBottom: "0.6rem" }}>
          Creator Studio<br />
          <span style={{ color: "var(--accent-primary)" }}>Architecture Controls</span>
        </h1>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <p className="page-subtitle" style={{ maxWidth: "620px", margin: 0 }}>
            Configure public architectural identity, UPI/bank payout rails, Ed25519 licensing defaults, Cloudflare R2 storage vaults, and CLI deploy tokens.
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.4rem 0.85rem",
              borderRadius: "var(--radius-full)",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.74rem",
              color: "var(--text-secondary)",
            }}
          >
            <ShieldCheck size={14} color="var(--accent-cyan)" />
            <span>POSTGRESQL SYNCED</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <span style={{ color: "var(--accent-cyan)" }}>95% SETTLEMENTS</span>
          </div>
        </div>
      </motion.div>

      {/* ── Modular Multi-Panel Settings Layout ─────────────────────────── */}
      <div className="settings-layout">
        {/* Navigation Sidebar */}
        <motion.nav
          className="settings-nav-panel"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Studio settings navigation"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`settings-nav-item${isActive ? " active" : ""}${tab.danger ? " danger" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={isActive}
                aria-current={isActive ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <Icon size={15} aria-hidden="true" />
                  <span>{tab.label}</span>
                </div>
                {tab.tag && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-mono)",
                      padding: "0.1rem 0.35rem",
                      borderRadius: "var(--radius-xs)",
                      background: isActive ? "rgba(255,255,255,0.2)" : "rgba(139, 92, 246, 0.15)",
                      color: isActive ? "#fff" : "var(--accent-primary)",
                      fontWeight: 600,
                    }}
                  >
                    {tab.tag}
                  </span>
                )}
              </button>
            );
          })}
        </motion.nav>

        {/* Active Content Module */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {activeTab === "profile"       && <CreatorProfileSettings />}
            {activeTab === "payouts"       && <PayoutBankingSettings />}
            {activeTab === "licensing"     && <LicensingEngineSettings />}
            {activeTab === "storage"       && <StorageVaultSettings />}
            {activeTab === "notifications" && <NotificationRulesSettings />}
            {activeTab === "cli-keys"      && <CliApiKeysSettings />}
            {activeTab === "tax"           && <TaxComplianceSettings />}
            {activeTab === "danger-zone"   && <DangerZoneSettings />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
