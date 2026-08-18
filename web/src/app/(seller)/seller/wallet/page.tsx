"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  RefreshCw,
  Banknote,
  Landmark,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Search,
  Wifi,
  Activity,
  ArrowLeft,
  Clock,
  TrendingUp,
  CreditCard,
  Pencil,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost } from "@/lib/api/client";
import { auth } from "@/lib/auth/client";
import { SellerHeader } from "../components/seller-header";

export interface PayoutAccountData {
  id: string;
  account_type: string;
  account_holder_name: string | null;
  masked_account_number: string | null;
  ifsc_code: string | null;
  bank_name: string | null;
  upi_id: string | null;
}

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

const POLL_INTERVAL = 15000;

export default function SellerWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payoutAccount, setPayoutAccount] = useState<PayoutAccountData | null>(null);
  const [userName, setUserName] = useState("SELLER");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [txFilter, setTxFilter] = useState("all");
  const [isFlipped, setIsFlipped] = useState(false);

  const fetchData = useCallback(async (isManual = false) => {
    if (!isManual) setLoading(true);
    else setRefreshing(true);

    try {
      const [walletRes, txRes, payoutRes, user] = await Promise.all([
        apiGet<WalletData>("/wallet"),
        apiGet<Transaction[]>("/wallet/transactions"),
        apiGet<PayoutAccountData>("/seller/payout-account"),
        auth.getUser(),
      ]);

      if (walletRes.data) setWallet(walletRes.data);
      if (txRes.data) setTransactions(txRes.data);
      if (user) setUserName(user.full_name || "SELLER");
      setPayoutAccount(payoutRes.success && payoutRes.data ? payoutRes.data : null);
      setLastUpdated(new Date());
    } catch {
      // Silently handle background errors
    } finally {
      if (!isManual) setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => fetchData(true), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  async function handleWithdraw() {
    const amountPaise = Math.round(parseFloat(withdrawAmount) * 100);
    if (isNaN(amountPaise) || amountPaise < 50000) {
      setError("Minimum withdrawal amount is ₹500");
      return;
    }
    if (wallet && amountPaise > wallet.balance_paise) {
      setError("Insufficient available balance in wallet");
      return;
    }

    setWithdrawing(true);
    setError("");
    setSuccess("");

    try {
      const result = await apiPost("/wallet/withdraw", { amount_paise: amountPaise });
      if (result.success) {
        const destination =
          payoutAccount?.account_type === "upi"
            ? `UPI ID (${payoutAccount.upi_id})`
            : `bank account ••••${payoutAccount?.masked_account_number?.slice(-4)}`;
        setSuccess(`Withdrawal requested successfully! Funds will be disbursed to your ${destination}.`);
        setWithdrawAmount("");
        fetchData(true);
      } else {
        setError(result.error || "Withdrawal failed");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setWithdrawing(false);
    }
  }

  const setPresetAmount = (amt: number) => {
    setWithdrawAmount(amt.toString());
  };

  const setMaxAmount = () => {
    if (wallet) {
      setWithdrawAmount((wallet.balance_paise / 100).toString());
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (txFilter === "sales") return tx.type === "sale";
      if (txFilter === "withdrawals") return tx.type === "withdrawal";
      return true;
    });
  }, [transactions, txFilter]);

  if (loading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Loading Wallet & Ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      {/* 1. Header */}
      <SellerHeader
        badge="Financial Engine"
        title="Seller Wallet & Payouts"
        description="View real-time balances, manage escrow holdings, and request direct bank or UPI payouts."
        lastUpdated={lastUpdated}
        onRefresh={() => fetchData(true)}
        refreshing={refreshing}
      />

      {/* 2. Top Hero Deck: 3D Creator Card & Withdrawal Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-12 items-stretch">
        {/* Left (Col 5): 3D Flip Creator Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div
            className="relative w-full aspect-[1.586/1] cursor-pointer group select-none"
            style={{ perspective: "2000px" }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className="relative w-full h-full transition-transform duration-[800ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] rounded-[28px] shadow-2xl"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front Side */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-black rounded-[28px] p-6 sm:p-7 text-white overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between"
                style={{ backfaceVisibility: "hidden" }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Top Row */}
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-white text-base">
                      C
                    </div>
                    <span className="font-black text-sm tracking-widest text-white">
                      CODEHAAT <span className="text-blue-400">CREATOR</span>
                    </span>
                  </div>
                  <Wifi className="w-5 h-5 text-slate-400 rotate-90" />
                </div>

                {/* Chip & Number */}
                <div className="relative z-10 my-auto">
                  <div className="w-11 h-8 bg-gradient-to-br from-amber-200 to-amber-400 rounded-md mb-4 opacity-90 shadow-2xs border border-amber-300/40" />
                  <div className="font-mono text-base sm:text-lg tracking-[0.2em] text-slate-200 font-bold">
                    •••• •••• •••• 9900
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Creator Account
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-100 truncate max-w-[160px]">
                      {userName}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Back Side */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-black rounded-[28px] text-white overflow-hidden border border-slate-800 flex flex-col justify-between"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="w-full h-10 bg-slate-900 mt-6 border-y border-slate-800" />
                <div className="p-6">
                  <div className="w-full h-8 bg-slate-200 rounded-md flex items-center justify-end px-3">
                    <span className="text-slate-900 font-serif italic text-xs font-bold">
                      {userName}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 leading-relaxed opacity-70">
                    Official CodeHaat verified creator balance token. Payout disbursements comply with Indian banking norms.
                  </p>
                </div>
                <div className="p-6 pt-0 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  CodeHaat Payout Engine v2.0
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-[11px] text-slate-400 font-semibold mt-3 flex items-center justify-center gap-1">
            <RefreshCw className="w-3 h-3" /> Click card to flip and verify digital signature
          </p>
        </div>

        {/* Right (Col 7): Balance & Payout Action Hub */}
        <div className="lg:col-span-7 rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs flex flex-col">
          <div className="rounded-[22px] bg-gradient-to-b from-white to-slate-50/40 p-6 sm:p-8 flex-1 flex flex-col justify-between">
            {/* Top Balance Stat */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Available for Payout
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  <CheckCircle2 className="w-3 h-3" /> Instant Settlement
                </span>
              </div>

              <div className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight tabular-nums mb-6">
                ₹
                {((wallet?.balance_paise ?? 0) / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>

              {/* Escrow & All Time Deck */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-amber-500" /> In Escrow
                  </span>
                  <div className="text-xl font-black text-slate-900 tabular-nums">
                    ₹{((wallet?.pending_paise ?? 0) / 100).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Released 7 days post-sale
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" /> All-Time Earned
                  </span>
                  <div className="text-xl font-black text-slate-900 tabular-nums">
                    ₹{((wallet?.total_earned_paise ?? 0) / 100).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Net lifetime sales
                  </p>
                </div>
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              {error && (
                <div className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Amount input & preset chips */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount (min. ₹500)"
                      min="500"
                      disabled={!payoutAccount || withdrawing}
                      className="w-full h-12 pl-9 pr-16 bg-white border border-slate-200/80 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-950 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={setMaxAmount}
                      disabled={!payoutAccount || withdrawing}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      MAX
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={withdrawing || !withdrawAmount || !payoutAccount}
                    className="h-12 px-6 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-slate-950/20 active:scale-[0.98] cursor-pointer"
                  >
                    {withdrawing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Withdraw</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400">Quick:</span>
                  {[500, 1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPresetAmount(amt)}
                      className="px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination info */}
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-slate-500 font-medium">Payout Destination:</span>
                <Link
                  href="/seller/settings/payouts"
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {payoutAccount ? (
                    payoutAccount.account_type === "upi" ? (
                      `UPI: ${payoutAccount.upi_id}`
                    ) : (
                      `Bank: ••••${payoutAccount.masked_account_number?.slice(-4)}`
                    )
                  ) : (
                    "Setup Bank / UPI Account"
                  )}
                  <Pencil className="w-3 h-3 ml-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Transaction History Ledger */}
      <div className="rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs">
        <div className="rounded-[22px] bg-gradient-to-b from-white to-slate-50/40 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Financial Transactions Ledger
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Audit record of sales earnings, platform commissions, and bank disbursements
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {[
                { id: "all", label: "All" },
                { id: "sales", label: "Sales Credits" },
                { id: "withdrawals", label: "Payouts" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTxFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    txFilter === tab.id
                      ? "bg-white text-slate-950 shadow-2xs font-extrabold"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="py-16 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No transactions recorded</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Your earning and withdrawal transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const isCredit = tx.amount_paise > 0;
                return (
                  <div
                    key={tx.id}
                    className="py-4 sm:py-4.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isCredit
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-rose-50 text-rose-600 border-rose-100"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {tx.description || (isCredit ? "Product Sale Credit" : "Withdrawal Payout")}
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
                      <div
                        className={`text-sm font-black tabular-nums ${
                          isCredit ? "text-emerald-600" : "text-slate-950"
                        }`}
                      >
                        {isCredit ? "+" : "-"}₹
                        {(Math.abs(tx.amount_paise) / 100).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Bal: ₹{(tx.balance_after_paise / 100).toLocaleString()}
                      </span>
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
