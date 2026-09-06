"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PlatformHeader from "@/components/nav/header";
import PlatformFooter from "@/components/nav/footer";

interface SettingsNavItem {
  href: string;
  label: string;
  sublabel: string;
  tag: string;
  icon: (active: boolean) => React.ReactNode;
}

const settingsNavItems: SettingsNavItem[] = [
  {
    href: "/settings/profile",
    label: "Identity & Profile",
    sublabel: "Cryptographic Avatar & Tax Compliance",
    tag: "ID-VAULT",
    icon: (active) => (
      <svg className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110 text-white" : "text-violet-400 group-hover:text-violet-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: "/settings/security",
    label: "Security & Vault",
    sublabel: "Argon2id Hash, 2FA & Active Sessions",
    tag: "CRYPTO-VAULT",
    icon: (active) => (
      <svg className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110 text-white" : "text-emerald-400 group-hover:text-emerald-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    href: "/settings/connect",
    label: "Connect & Terminal",
    sublabel: "Git CLI PAT, GitHub & Container Registries",
    tag: "CLI-SYNC",
    icon: (active) => (
      <svg className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110 text-white" : "text-cyan-400 group-hover:text-cyan-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/settings/notifications",
    label: "Alert Telemetry",
    sublabel: "48h Escrow Countdown & Dispute Alerts",
    tag: "REALTIME",
    icon: (active) => (
      <svg className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110 text-white" : "text-amber-400 group-hover:text-amber-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    href: "/settings/preferences",
    label: "Preferences & Billing",
    sublabel: "Integer Paise Standard & Theme Inspector",
    tag: "CONFIG",
    icon: (active) => (
      <svg className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110 text-white" : "text-pink-400 group-hover:text-pink-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen bg-[#0E0E12] text-[#EDEDF0] flex flex-col selection:bg-[#8535FC]/40 selection:text-white font-sans overflow-x-hidden">
      {/* Dynamic Cybernetic Mesh Lights */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(133,53,252,0.18),transparent)] pointer-events-none z-0" />
      <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[160px] pointer-events-none z-0" />
      
      {/* Precision Micro Grid Texture */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none z-0" />

      <PlatformHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-24 relative z-10">
        {/* TOP COMMAND DECK HERO BANNER */}
        <div className="relative mb-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#17171C]/90 via-[#1C1C24]/80 to-[#121216]/95 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden group">
          {/* Subtle Cyber scanline highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-80" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              {/* Telemetry Monospace Breadcrumb */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[11px] font-mono tracking-wider">
                <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                <span>KODEDOCK://PROTOCOL_SETTINGS</span>
                <span className="text-white/30">•</span>
                <span className="text-violet-200">v2.1.0 ENTERPRISE</span>
              </div>

              {/* Headline with futuristic gradient */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3E8FF] to-[#C084FC]">
                Settings & Command Matrix
              </h1>
              
              <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl font-normal leading-relaxed">
                Fine-tune your verified developer identity, cryptographic session security, personal access tokens, and bank-grade escrow notifications.
              </p>
            </div>

            {/* Live System Invariant Telemetry Widget */}
            <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#141418]/90 border border-white/10 text-xs font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-radar" />
                <span className="text-[#A1A1AA]">Ledger Standard:</span>
                <span className="text-emerald-400 font-semibold tracking-wide">i64 INTEGER PAISE</span>
              </div>

              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#141418]/90 border border-white/10 text-xs font-mono">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[#A1A1AA]">Auth Protocol:</span>
                <span className="text-cyan-300 font-semibold">ARGON2id + TOTP</span>
              </div>
            </div>
          </div>
        </div>

        {/* SETTINGS ARCHITECTURE (SIDEBAR DOCK + PAGE CONTENT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* NAVIGATION COMMAND DOCK */}
          <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-4">
            {/* Mobile Horizontal Fluid Glass Pill Scroll */}
            <div className="flex lg:hidden overflow-x-auto gap-2.5 pb-2 scrollbar-none">
              {settingsNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href === "/settings/profile" && pathname === "/settings");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-[0_0_20px_rgba(133,53,252,0.4)] border border-violet-400/50"
                        : "bg-[#18181F]/80 text-[#A1A1AA] border border-white/5 hover:text-white hover:border-white/15"
                    }`}
                  >
                    <span>{item.icon(isActive)}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Vertical Glass Command Dock */}
            <div className="hidden lg:flex flex-col gap-2 p-2.5 rounded-3xl bg-gradient-to-b from-[#18181F]/90 to-[#121216]/95 border border-white/10 backdrop-blur-2xl shadow-xl">
              <div className="px-3 pt-2 pb-1 flex items-center justify-between text-[11px] font-mono text-[#71717A] tracking-wider uppercase">
                <span>Navigation Nodes</span>
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              </div>

              {settingsNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href === "/settings/profile" && pathname === "/settings");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-violet-600/20 via-purple-600/15 to-transparent border border-violet-500/40 text-white shadow-[0_4px_25px_-5px_rgba(133,53,252,0.3)]"
                        : "hover:bg-white/[0.04] text-[#A1A1AA] hover:text-white border border-transparent hover:border-white/10"
                    }`}
                  >
                    {/* Active Accent Bar Indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-gradient-to-b from-violet-400 to-purple-600 shadow-[0_0_10px_#8535FC]" />
                    )}

                    {/* Icon Container with glowing ring */}
                    <div
                      className={`p-2.5 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-[0_0_15px_rgba(133,53,252,0.5)]"
                          : "bg-[#14141A] text-[#A1A1AA] border border-white/5 group-hover:border-violet-500/30 group-hover:bg-[#1A1A24]"
                      }`}
                    >
                      {item.icon(isActive)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-heading font-bold tracking-tight truncate ${isActive ? "text-white" : "text-[#EDEDF0] group-hover:text-white"}`}>
                          {item.label}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                          isActive
                            ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                            : "bg-white/[0.03] text-[#71717A] border-white/5 group-hover:text-white/60"
                        }`}>
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] truncate mt-0.5 font-normal leading-tight">
                        {item.sublabel}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* SYSTEM PROTOCOL DISCLOSURE CARD */}
            <div className="hidden lg:block p-4 rounded-3xl bg-gradient-to-br from-violet-950/20 via-[#14141A]/80 to-[#101014] border border-violet-500/20 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2.5 text-xs font-heading font-bold text-white mb-2">
                <span className="p-1 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                <span>Zero-Mock Engine Sync</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                All changes made within this command matrix are cryptographically signed, committed to PostgreSQL with ACID locks, and synced to Redis.
              </p>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                <span>UPTIME: 99.99%</span>
                <span className="text-emerald-400">LATENCY &lt; 8MS</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC CONTENT ROUTE INJECTION */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {children}
          </div>
        </div>
      </main>

      <PlatformFooter />
    </div>
  );
}
