"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AccountSettings,
  SecuritySettings,
  NotificationController,
  BillingTaxSettings,
  ApiTokenSettings,
  DomainAllowlistSettings,
  ConnectedAccountsSettings,
  PrivacyDataSettings,
  DangerZoneSettings,
} from "@/components/settings";
import {
  User,
  Shield,
  Bell,
  Receipt,
  Key,
  Globe,
  Link2,
  Lock,
  AlertTriangle,
} from "lucide-react";

type SettingsTab =
  | "account"
  | "security"
  | "notifications"
  | "billing-tax"
  | "api-tokens"
  | "domain-allowlist"
  | "connected-accounts"
  | "privacy-data"
  | "danger-zone";

const TABS: { id: SettingsTab; label: string; icon: any; danger?: boolean }[] = [
  { id: "account",            label: "Account Info",        icon: User },
  { id: "security",           label: "Security & 2FA",      icon: Shield },
  { id: "notifications",      label: "Notification Rules",  icon: Bell },
  { id: "billing-tax",        label: "Billing & GSTIN",     icon: Receipt },
  { id: "api-tokens",         label: "API Tokens",          icon: Key },
  { id: "domain-allowlist",   label: "Domain Allow List",   icon: Globe },
  { id: "connected-accounts", label: "Connected Accounts",  icon: Link2 },
  { id: "privacy-data",       label: "Privacy & Export",    icon: Lock },
  { id: "danger-zone",        label: "Danger Zone",         icon: AlertTriangle, danger: true },
];

const panelVariants = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } as any },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="page-eyebrow">Settings Suite</div>
        <h1 className="page-title">
          Account<br />
          <span style={{ color: "var(--accent-primary)" }}>Preferences</span>
        </h1>
        <p className="page-subtitle">
          Manage developer credentials, notification rules, tax info, API tokens, and cryptographic boundaries.
        </p>
      </motion.div>

      <div className="settings-layout">
        {/* Settings Nav Panel */}
        <motion.nav
          className="settings-nav-panel"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Settings navigation"
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
              >
                <Icon size={15} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </motion.nav>

        {/* Active Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {activeTab === "account"            && <AccountSettings />}
            {activeTab === "security"           && <SecuritySettings />}
            {activeTab === "notifications"      && <NotificationController />}
            {activeTab === "billing-tax"        && <BillingTaxSettings />}
            {activeTab === "api-tokens"         && <ApiTokenSettings />}
            {activeTab === "domain-allowlist"   && <DomainAllowlistSettings />}
            {activeTab === "connected-accounts" && <ConnectedAccountsSettings />}
            {activeTab === "privacy-data"       && <PrivacyDataSettings />}
            {activeTab === "danger-zone"        && <DangerZoneSettings />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
