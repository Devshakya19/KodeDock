"use client";

import React, { useState, useEffect } from "react";

type InspectorTheme = "cyber-violet" | "monochrome" | "matrix-emerald";

export default function SettingsPreferencesPage() {
  const [selectedTheme, setSelectedTheme] = useState<InspectorTheme>("cyber-violet");
  const [billingEmail, setBillingEmail] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem("kd_inspector_theme") as InspectorTheme;
    if (storedTheme) setSelectedTheme(storedTheme);

    const storedEmail = localStorage.getItem("kd_billing_email");
    if (storedEmail) setBillingEmail(storedEmail);
  }, []);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("kd_inspector_theme", selectedTheme);
    localStorage.setItem("kd_billing_email", billingEmail.trim());
    setIsSaved(true);
    showToast("Workspace preferences and inspector theme committed successfully!");
    setTimeout(() => setIsSaved(false), 3000);
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
            <span className="text-base">{notice.type === "success" ? "⚙️" : "⚠️"}</span>
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

      {/* SECTION 1: INVARIANT CURRENCY ENGINE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17171E]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">FINTECH // INVARIANT_LEDGER</div>
            <h3 className="text-lg font-heading font-bold text-white tracking-tight">Zero-Floating Point Currency Standard</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
            NON-MUTABLE
          </span>
        </div>

        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          KodeDock enforces the zero-floating point law. All wallet balances, platform fees, TDS deductions, and escrow releases are strictly calculated and stored as 64-bit integer paise (<code className="text-emerald-400 font-mono">i64</code>).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#121217]/80 border border-white/5 space-y-1">
            <div className="text-[10px] font-mono text-[#71717A]">CURRENCY STANDARD</div>
            <div className="text-sm font-bold text-white font-mono">Indian Rupee (INR ₹)</div>
            <div className="text-[11px] text-[#A1A1AA]">Base arithmetic unit: 1 Paisa = 0.01 INR</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#121217]/80 border border-white/5 space-y-1">
            <div className="text-[10px] font-mono text-[#71717A]">ROUNDING TOLERANCE</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">0.00000% Epsilon</div>
            <div className="text-[11px] text-[#A1A1AA]">Zero precision loss across double-entry debits/credits</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#121217]/80 border border-white/5 space-y-1">
            <div className="text-[10px] font-mono text-[#71717A]">POSTGRES TYPE</div>
            <div className="text-sm font-bold text-violet-300 font-mono">BIGINT (Signed i64)</div>
            <div className="text-[11px] text-[#A1A1AA]">Supports balances up to ₹92 Quintillion</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: BILLING DISPATCH EMAIL */}
      <form onSubmit={handleSavePreferences} className="space-y-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#17171E]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
          <div className="border-b border-white/5 pb-4">
            <div className="text-[10px] font-mono uppercase text-violet-400 tracking-wider">ROUTING // INVOICE_DELIVERY</div>
            <h3 className="text-lg font-heading font-bold text-white tracking-tight">Automated Invoicing & Accounting Dispatch</h3>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Specify a dedicated accounting or finance department email address to automatically receive PDF tax invoices and debit/credit receipts.
          </p>

          <div className="space-y-2 max-w-lg">
            <label className="text-xs font-mono text-[#A1A1AA] flex items-center justify-between">
              <span>[FIELD: BILLING_EMAIL]</span>
              <span className="text-[#71717A] text-[10px]">OPTIONAL FORWARDING</span>
            </label>
            <input
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              placeholder="e.g. finance@yourcompany.com"
              className="w-full px-4 py-3.5 rounded-2xl bg-[#101015]/90 border border-white/10 text-white placeholder-[#52525B] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 transition-all duration-300 font-mono"
            />
          </div>
        </div>

        {/* SECTION 3: CODE INSPECTOR THEME SELECTOR */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#17171E]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">DISPLAY // SYNTAX_HIGHLIGHTER</div>
              <h3 className="text-lg font-heading font-bold text-white tracking-tight">Code Inspector Theme Matrix</h3>
            </div>
            <span className="text-xs font-mono text-[#71717A]">IN-BROWSER AUDIT ENGINE</span>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Choose the visual palette for the in-browser deliverable file explorer and AST syntax scanner.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Theme 1: Cyber Obsidian Violet */}
            <button
              type="button"
              onClick={() => setSelectedTheme("cyber-violet")}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                selectedTheme === "cyber-violet"
                  ? "bg-gradient-to-br from-violet-950/40 via-[#1A1826] to-[#121217] border-violet-500/50 shadow-[0_0_20px_rgba(133,53,252,0.3)] ring-1 ring-violet-400"
                  : "bg-[#121217]/70 border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white font-mono">Cyber Obsidian</span>
                <span className="h-2 w-2 rounded-full bg-violet-400" />
              </div>
              <p className="text-[11px] text-[#A1A1AA] mb-4">
                KodeDock signature deep cosmic space with neon purple & emerald highlights.
              </p>
              <div className="p-3 rounded-xl bg-[#0F0F14] border border-violet-500/20 font-mono text-[10px] space-y-1">
                <p className="text-violet-400">fn verify_escrow() &#123;</p>
                <p className="text-emerald-400 pl-3">Ok(true)</p>
                <p className="text-violet-400">&#125;</p>
              </div>
            </button>

            {/* Theme 2: Monochrome */}
            <button
              type="button"
              onClick={() => setSelectedTheme("monochrome")}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                selectedTheme === "monochrome"
                  ? "bg-gradient-to-br from-zinc-900/60 via-[#18181B] to-[#101012] border-zinc-400/50 shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-1 ring-zinc-300"
                  : "bg-[#121217]/70 border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white font-mono">High-Contrast Noir</span>
                <span className="h-2 w-2 rounded-full bg-white" />
              </div>
              <p className="text-[11px] text-[#A1A1AA] mb-4">
                Stark obsidian black and pure white for maximum legibility in daylight environments.
              </p>
              <div className="p-3 rounded-xl bg-[#08080A] border border-zinc-700 font-mono text-[10px] space-y-1">
                <p className="text-white">fn verify_escrow() &#123;</p>
                <p className="text-zinc-400 pl-3">Ok(true)</p>
                <p className="text-white">&#125;</p>
              </div>
            </button>

            {/* Theme 3: Matrix Emerald */}
            <button
              type="button"
              onClick={() => setSelectedTheme("matrix-emerald")}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                selectedTheme === "matrix-emerald"
                  ? "bg-gradient-to-br from-emerald-950/40 via-[#141C16] to-[#101512] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400"
                  : "bg-[#121217]/70 border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white font-mono">Emerald Terminal</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-[#A1A1AA] mb-4">
                Classic retro phosphor green terminal aesthetic for hardcore system hackers.
              </p>
              <div className="p-3 rounded-xl bg-[#0A120D] border border-emerald-500/20 font-mono text-[10px] space-y-1">
                <p className="text-emerald-400">fn verify_escrow() &#123;</p>
                <p className="text-emerald-300 pl-3">Ok(true)</p>
                <p className="text-emerald-400">&#125;</p>
              </div>
            </button>
          </div>
        </div>

        {/* SUBMIT ACTION */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-heading font-bold text-sm tracking-wide shadow-lg shadow-violet-600/30 border border-violet-400/40 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{isSaved ? "✓" : "⚡"}</span>
            <span>{isSaved ? "PREFERENCES SAVED" : "SAVE WORKSPACE PREFERENCES"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
