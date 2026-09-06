"use client";

import React, { useState, useEffect, useMemo } from "react";
import PlatformHeader from "@/components/nav/header";
import PlatformFooter from "@/components/nav/footer";
import { formatPaiseToInr, formatPaiseDetailed, fintechApi } from "@/lib/api/client";
import { LedgerEntry, UserAccountBalance } from "@/lib/types";

export default function BuyerWalletPage() {
  const [balance, setBalance] = useState<UserAccountBalance | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [topupRupees, setTopupRupees] = useState<number>(2000);
  const [customRupees, setCustomRupees] = useState<string>("");
  const [isProcessingTopup, setIsProcessingTopup] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Wallet Balance from backend
      const walletRes = await fintechApi.getWallet();
      const walletData = (walletRes as any).data || walletRes;
      setBalance(walletData);

      // 2. Fetch Ledger Transactions from backend
      const ledgerRes = await fintechApi.getWalletTransactions();
      if (ledgerRes && ledgerRes.data && Array.isArray(ledgerRes.data)) {
        setLedger(ledgerRes.data);
      } else {
        setLedger([]);
      }
    } catch (err: any) {
      console.warn("Wallet fetch error:", err);
      setBalance({
        user_id: "",
        available_balance_paise: 0,
        pending_escrow_paise: 0,
        lifetime_earned_paise: 0,
        lifetime_withdrawn_paise: 0,
        is_payout_frozen: false,
      });
      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteTopup = async () => {
    const finalRupees = customRupees ? parseFloat(customRupees) : topupRupees;
    if (isNaN(finalRupees) || finalRupees <= 0) {
      alert("Please enter a valid top-up amount");
      return;
    }

    const paise = Math.round(finalRupees * 100);
    setIsProcessingTopup(true);

    try {
      await fintechApi.topupWallet(paise);
      setActionNotice(`Successfully deposited ₹${finalRupees.toLocaleString("en-IN")} into your KodeDock Wallet!`);
      setTopupModalOpen(false);
      setCustomRupees("");
      await fetchWalletData();
    } catch (err: any) {
      setActionNotice(`Topup failed: ${err.message || "Unable to complete deposit transaction"}`);
    } finally {
      setIsProcessingTopup(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const filteredLedger = useMemo(() => {
    return ledger.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchTx = item.transaction_id.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        if (!matchDesc && !matchTx && !matchCat) return false;
      }
      return true;
    });
  }, [ledger, categoryFilter, searchQuery]);

  return (
    <div className="relative min-h-screen bg-[#1D1D21] text-[#EDEDF0] flex flex-col selection:bg-[#8535FC]/30 selection:text-white font-sans overflow-x-hidden">
      {/* Ambient Glow */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#41414612_1px,transparent_1px),linear-gradient(to_bottom,#41414612_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] max-w-[100vw] h-[320px] bg-gradient-to-b from-[#8535FC]/12 via-[#06B6D4]/5 to-transparent blur-3xl pointer-events-none z-0" />

      <PlatformHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-16 sm:pt-24 pb-16 relative z-10">
        {/* NOTIFICATION BANNER */}
        {actionNotice && (
          <div className="mb-6 p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs sm:text-sm font-medium flex items-center justify-between shadow-lg shadow-black/40 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-[#10B981] hover:text-white text-xs px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. WALLET HERO & BALANCES */}
        <div className="relative mb-6 sm:mb-8 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#27272A]/85 via-[#27272A]/50 to-[#141417]/95 border border-[#414146]/60 backdrop-blur-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-[10px] sm:text-xs font-mono font-medium mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>DOUBLE-ENTRY ESCROW WALLET</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                Buyer Financial Wallet & Ledger
              </h1>
              <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1 max-w-xl">
                Every rupee is tracked in immutable double-entry balance journals. Use your wallet balance for instant 1-click marketplace purchases without payment gateway redirect fees.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setTopupModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8535FC] to-[#7822FA] hover:from-[#7822FA] hover:to-[#6010E0] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#8535FC]/30 hover:scale-105 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Funds / Deposit</span>
              </button>
            </div>
          </div>

          {/* Balance Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 pt-6 border-t border-[#414146]/40">
            {/* Available Balance */}
            <div className="p-4 rounded-xl bg-[#141417]/80 border border-[#414146]/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider">Available Balance</span>
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                {balance ? formatPaiseDetailed(balance.available_balance_paise) : "₹0.00"}
              </div>
              <p className="text-[10px] text-[#A1A1AA] mt-1">Ready for 1-click zero-fee checkouts</p>
            </div>

            {/* Pending In Escrow */}
            <div className="p-4 rounded-xl bg-[#141417]/80 border border-[#414146]/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider">Held In Escrow</span>
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-bold text-[#F59E0B] tracking-tight">
                {balance ? formatPaiseDetailed(balance.pending_escrow_paise) : "₹0.00"}
              </div>
              <p className="text-[10px] text-[#A1A1AA] mt-1">Locked safely in 72h code inspections</p>
            </div>

            {/* Total Account Activity */}
            <div className="p-4 rounded-xl bg-[#141417]/80 border border-[#414146]/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider">Ledger Health</span>
                <span className="w-2 h-2 rounded-full bg-[#8535FC]" />
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-bold text-[#C084FC] tracking-tight">
                100% ACID
              </div>
              <p className="text-[10px] text-[#A1A1AA] mt-1">Mathematically balanced debits & credits</p>
            </div>
          </div>
        </div>

        {/* 2. LEDGER JOURNAL CONTROLS & TABLE */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#27272A]/70 border border-[#414146]/60 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#414146]/40">
            <div>
              <h2 className="text-base font-semibold text-white">Double-Entry Ledger History</h2>
              <p className="text-xs text-[#A1A1AA]">Every debit and credit transaction tied to your account</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-[#141417] border border-[#414146] text-xs text-[#EDEDF0] outline-none"
              >
                <option value="all">All Categories</option>
                <option value="WALLET_TOPUP">Deposits (Topup)</option>
                <option value="ESCROW_HOLD">Escrow Holds</option>
                <option value="ESCROW_RELEASE">Escrow Releases</option>
                <option value="REFUND">Refunds</option>
              </select>

              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search transaction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 px-3 rounded-lg bg-[#141417] border border-[#414146] text-xs text-[#EDEDF0] placeholder-[#71717A] outline-none w-44 sm:w-56"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 text-center text-xs text-[#A1A1AA]">Loading cryptographic ledger journal...</div>
          ) : filteredLedger.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#A1A1AA]">
              No transactions match your query. Add funds to see your first entry.
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#414146]/50 text-[#A1A1AA] font-mono text-[11px]">
                    <th className="py-3 px-3">TIMESTAMP</th>
                    <th className="py-3 px-3">TRANSACTION ID</th>
                    <th className="py-3 px-3">CATEGORY</th>
                    <th className="py-3 px-3">DESCRIPTION</th>
                    <th className="py-3 px-3 text-right">AMOUNT (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#414146]/30">
                  {filteredLedger.map((entry) => {
                    const isCredit = entry.entry_type === "credit";
                    return (
                      <tr key={entry.id} className="hover:bg-[#141417]/50 transition-colors">
                        <td className="py-3 px-3 font-mono text-[11px] text-[#A1A1AA] whitespace-nowrap">
                          {new Date(entry.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                          <button
                            onClick={() => handleCopy(entry.transaction_id, entry.id)}
                            className="text-[#C084FC] hover:underline flex items-center gap-1"
                            title="Click to copy transaction ID"
                          >
                            <span>{entry.transaction_id.substring(0, 16)}...</span>
                            {copiedId === entry.id && <span className="text-[10px] text-[#10B981]">✓</span>}
                          </button>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-medium ${
                              entry.category === "WALLET_TOPUP"
                                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                                : entry.category === "ESCROW_HOLD"
                                ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30"
                                : "bg-[#8535FC]/15 text-[#C084FC] border border-[#8535FC]/30"
                            }`}
                          >
                            {entry.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#EDEDF0] max-w-xs sm:max-w-md truncate">
                          {entry.description}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold whitespace-nowrap">
                          <span className={isCredit ? "text-[#10B981]" : "text-[#EF4444]"}>
                            {isCredit ? "+" : "-"}
                            {formatPaiseDetailed(entry.amount_paise)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* TOPUP MODAL */}
      {topupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-[#27272A] border border-[#414146] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#414146]/50">
              <h3 className="text-base font-heading font-semibold text-white">Deposit Funds Into Wallet</h3>
              <button
                onClick={() => setTopupModalOpen(false)}
                className="text-[#A1A1AA] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs text-[#A1A1AA] mb-2">Select Amount</label>
                <div className="grid grid-cols-4 gap-2">
                  {[500, 2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setTopupRupees(amt);
                        setCustomRupees("");
                      }}
                      className={`py-2 rounded-xl text-xs font-semibold font-mono border transition-all ${
                        topupRupees === amt && !customRupees
                          ? "bg-[#8535FC] border-[#8535FC] text-white shadow-md shadow-[#8535FC]/30"
                          : "bg-[#141417] border-[#414146] text-[#A1A1AA] hover:border-[#8535FC]/50 hover:text-white"
                      }`}
                    >
                      ₹{amt.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#A1A1AA] mb-1">Or Enter Custom Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={customRupees}
                  onChange={(e) => {
                    setCustomRupees(e.target.value);
                    setTopupRupees(0);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-[#141417] border border-[#414146] focus:border-[#8535FC] text-sm text-white font-mono outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#141417] border border-[#414146]/50 text-[11px] text-[#A1A1AA] space-y-1">
                <div className="flex justify-between">
                  <span>Payment Gateway:</span>
                  <span className="text-white font-mono">UPI / NetBanking / Cards</span>
                </div>
                <div className="flex justify-between">
                  <span>Settlement:</span>
                  <span className="text-[#10B981] font-mono">Instant & Protected</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#414146]/50">
              <button
                type="button"
                onClick={() => setTopupModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingTopup}
                onClick={handleExecuteTopup}
                className="px-5 py-2 rounded-xl bg-[#8535FC] hover:bg-[#7822FA] text-white text-xs font-semibold shadow-lg shadow-[#8535FC]/30 disabled:opacity-50"
              >
                {isProcessingTopup ? "Crediting Balance..." : "Confirm & Pay"}
              </button>
            </div>
          </div>
        </div>
      )}

      <PlatformFooter />
    </div>
  );
}
