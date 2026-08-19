"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  RefreshCw,
  Clock,
  Banknote,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Percent,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api/client";
import { SellerHeader } from "../components/seller-header";

interface WalletData {
  user_id: string;
  balance_paise: number;
  pending_paise: number;
  total_earned_paise: number;
  total_spent_paise: number;
}

interface Transaction {
  id: string;
  type: string;
  amount_paise: number;
  balance_after_paise: number;
  description: string | null;
  created_at: string;
}

export default function SellerEarningsPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [walletRes, txRes] = await Promise.all([
        apiGet<WalletData>("/wallet"),
        apiGet<Transaction[]>("/wallet/transactions?limit=50"),
      ]);
      if (walletRes.data) setWallet(walletRes.data);
      if (txRes.data) setTransactions(txRes.data);
      setLastUpdated(new Date());
    } catch {
      // Silently catch background errors
    } finally {
      if (isManual) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Filter only earning-related transactions (sales, withdrawals)
  const earningTxs = useMemo(
    () =>
      transactions.filter(
        (tx) => tx.type === "sale" || tx.type === "withdrawal" || tx.type === "commission"
      ),
    [transactions]
  );

  // Compute total withdrawn
  const totalWithdrawn = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === "withdrawal")
        .reduce((sum, tx) => sum + Math.abs(tx.amount_paise), 0),
    [transactions]
  );

  if (loading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Loading Earnings Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      {/* 1. Header */}
      <SellerHeader
        badge="Revenue Analytics"
        title="Creator Earnings"
        description="Track your net revenue velocity, withdrawal history, and platform commission breakdown."
        lastUpdated={lastUpdated}
        onRefresh={() => fetchData(true)}
        refreshing={refreshing}
        actions={
          <Link href="/seller/wallet">
            <button
              type="button"
              className="h-11 px-5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-md shadow-slate-950/20 active:scale-[0.98] cursor-pointer"
            >
              <Banknote className="w-4 h-4 text-emerald-400" />
              <span>Withdraw Funds</span>
            </button>
          </Link>
        }
      />

      {/* 2. Metrics Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        <div className="rounded-[26px] bg-white p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-white to-slate-50/60 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Net Earned
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-950 tabular-nums">
              ₹
              {((wallet?.total_earned_paise ?? 0) / 100).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Net profit after 2.5% fee
            </p>
          </div>
        </div>

        <div className="rounded-[26px] bg-white p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-white to-slate-50/60 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Available Balance
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <WalletIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-950 tabular-nums">
              ₹
              {((wallet?.balance_paise ?? 0) / 100).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Ready for instant bank payout
            </p>
          </div>
        </div>

        <div className="rounded-[26px] bg-white p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-white to-slate-50/60 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pending in Escrow
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-950 tabular-nums">
              ₹{((wallet?.pending_paise ?? 0) / 100).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Released 7 days post-purchase
            </p>
          </div>
        </div>

        <div className="rounded-[26px] bg-white p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-white to-slate-50/60 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Disbursed
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-950 tabular-nums">
              ₹{(totalWithdrawn / 100).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Transferred to verified bank/UPI
            </p>
          </div>
        </div>
      </div>

      {/* 3. Transparent Fee Structure Card */}
      <div className="rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs mb-8">
        <div className="rounded-[22px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-7 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-wider mb-3 border border-white/10">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transparent Creator Pricing</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
              You keep 97.5% of every sale.
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              KodeDock charges a minimal 2.5% platform fee to cover automated payment gateway processing, instant repository invitations, and fraud protection. No hidden subscription fees.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xs">
            <div className="text-center px-4 border-r border-white/10">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">97.5%</div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Your Payout</div>
            </div>
            <div className="text-center px-4">
              <div className="text-2xl sm:text-3xl font-black text-slate-300 tabular-nums">2.5%</div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Platform Fee</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Earnings Ledger */}
      <div className="rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs">
        <div className="rounded-[22px] bg-gradient-to-b from-white to-slate-50/40 p-5 sm:p-6">
          <h3 className="text-lg font-black text-slate-900 tracking-tight mb-4">
            Earnings History Ledger
          </h3>

          {earningTxs.length === 0 ? (
            <div className="py-16 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No earnings recorded</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Completed purchases and payouts will be audited here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {earningTxs.map((tx) => {
                const isCredit = tx.amount_paise > 0;
                return (
                  <div
                    key={tx.id}
                    className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          tx.type === "sale"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-rose-50 text-rose-600 border-rose-100"
                        }`}
                      >
                        {tx.type === "sale" ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {tx.description || (tx.type === "sale" ? "Product Sale Payout" : "Bank Payout Withdrawal")}
                        </p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-black tabular-nums ${
                          isCredit ? "text-emerald-600" : "text-slate-950"
                        }`}
                      >
                        {isCredit ? "+" : "-"}₹
                        {(Math.abs(tx.amount_paise) / 100).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        Balance: ₹{(tx.balance_after_paise / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
