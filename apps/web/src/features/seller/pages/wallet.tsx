"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  RefreshCw,
  Banknote,
  Landmark,
  Smartphone,
  Plus,
  Pencil,
  ShieldCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { apiGet, apiPost } from "@/shared/lib/api";
import AddPayoutMethod, { type PayoutAccountData } from "@/features/wallet/components/add-payout-method";

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [payoutSheetOpen, setPayoutSheetOpen] = useState(false);
  const [txFilter, setTxFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [walletRes, txRes, payoutRes] = await Promise.all([
        apiGet<WalletData>("/wallet"),
        apiGet<Transaction[]>("/wallet/transactions"),
        apiGet<PayoutAccountData>("/seller/payout-account"),
      ]);

      if (walletRes.data) setWallet(walletRes.data);
      if (txRes.data) setTransactions(txRes.data);
      setPayoutAccount(payoutRes.success && payoutRes.data ? payoutRes.data : null);
      setLastUpdated(new Date());
    } catch {
      // Silently handle poll errors
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 15s
  useEffect(() => {
    const timer = setInterval(() => fetchData(), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  async function handleWithdraw() {
    const amountPaise = Math.round(parseFloat(withdrawAmount) * 100);
    if (isNaN(amountPaise) || amountPaise < 50000) {
      setError("Minimum withdrawal is ₹500");
      return;
    }
    if (wallet && amountPaise > wallet.balance_paise) {
      setError("Insufficient balance");
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
            ? `UPI (${payoutAccount.upi_id})`
            : `bank account ••••${payoutAccount?.masked_account_number?.slice(-4)}`;
        setSuccess(`Withdrawal requested! Funds will be sent to your ${destination}.`);
        setWithdrawAmount("");
        fetchData();
      } else {
        setError(result.error || "Withdrawal failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setWithdrawing(false);
    }
  }

  function handlePayoutSaved(account: PayoutAccountData) {
    setPayoutAccount(account);
    setSuccess("Payout method saved successfully");
    setTimeout(() => setSuccess(""), 3000);
  }

  const setPresetAmount = (amt: number) => {
    setWithdrawAmount(amt.toString());
  };

  const setMaxAmount = () => {
    if (wallet) {
      setWithdrawAmount((wallet.balance_paise / 100).toString());
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === "sales") return tx.type === "sale";
    if (txFilter === "withdrawals") return tx.type === "withdrawal";
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Payout Sheet */}
      <AddPayoutMethod
        open={payoutSheetOpen}
        onOpenChange={setPayoutSheetOpen}
        existing={payoutAccount}
        onSaved={handlePayoutSaved}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
            <WalletIcon className="w-3.5 h-3.5" />
            Payout & Balances
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Seller Wallet
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your store earnings, escrow holds, and withdrawal methods
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] text-slate-400">
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl px-3 py-2 shadow-sm transition-all hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live
          </span>
        </div>
      </div>

      {/* 3 Metric Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-[24px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-[170px]">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                <WalletIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-slate-300">Available Balance</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Ready to withdraw
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold tracking-tight">
              ₹{((wallet?.balance_paise ?? 0) / 100).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Available for instant payout transfer
            </p>
          </div>
        </div>

        {/* Pending Escrow Balance */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[170px]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Pending (Escrow)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              7-Day Hold
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ₹{((wallet?.pending_paise ?? 0) / 100).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Auto-releases to available balance after 7 days
            </p>
          </div>
        </div>

        {/* Total Earned */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[170px]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Lifetime Revenue</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Gross Earned
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ₹{((wallet?.total_earned_paise ?? 0) / 100).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Total earned across all sold products
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        
        {/* Payout Method Card (1 Col) */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-slate-500" />
                Payout Account
              </h3>
              {payoutAccount && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              )}
            </div>

            {payoutAccount ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 mb-4">
                {payoutAccount.account_type === "upi" ? (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">UPI ID</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{payoutAccount.upi_id}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                        {payoutAccount.bank_name}
                      </p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {payoutAccount.account_holder_name}
                      </p>
                      <p className="text-xs font-medium text-slate-500 mt-1 font-mono">
                        •••• {payoutAccount.masked_account_number?.slice(-4)} • {payoutAccount.ifsc_code}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 mb-4 text-center">
                <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-900">No payout method added</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Add your bank account or UPI ID to enable earnings withdrawal.
                </p>
              </div>
            )}
          </div>

          <Button
            variant={payoutAccount ? "outline" : "default"}
            onClick={() => setPayoutSheetOpen(true)}
            className={`w-full h-11 rounded-xl font-bold transition-all ${
              payoutAccount
                ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
            }`}
          >
            {payoutAccount ? (
              <>
                <Pencil className="w-4 h-4 mr-2" /> Update Payout Details
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" /> Add Bank Account / UPI
              </>
            )}
          </Button>
        </div>

        {/* Withdraw Request Section (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-slate-500" />
              Request Withdrawal
            </h3>
            <span className="text-xs text-slate-400 font-medium">Min: ₹500</span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Withdrawal Amount (₹)
              </label>
              
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="500"
                  min="500"
                  className="h-12 pl-9 pr-20 text-base font-bold text-slate-900 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                  disabled={!payoutAccount}
                />
                <button
                  type="button"
                  onClick={setMaxAmount}
                  disabled={!payoutAccount || !wallet || wallet.balance_paise <= 0}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-1">Quick:</span>
              {[500, 1000, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPresetAmount(amt)}
                  disabled={!payoutAccount}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <Button
              onClick={handleWithdraw}
              disabled={withdrawing || !withdrawAmount || !payoutAccount}
              className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 mt-2"
            >
              {withdrawing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Banknote className="w-4 h-4 mr-2 text-emerald-400" />
              )}
              Confirm Withdrawal
            </Button>

            {!payoutAccount && (
              <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Withdrawals disabled until payout method is configured.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Transaction History Table Redesign */}
      <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-slate-900">Wallet Transactions</h3>
          
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
            {[
              { id: "all", label: "All" },
              { id: "sales", label: "Sales" },
              { id: "withdrawals", label: "Payouts" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTxFilter(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  txFilter === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <WalletIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">No transactions recorded</p>
            <p className="text-xs text-slate-400 mt-1">Your wallet activity will show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.amount_paise > 0;
              const formattedDate = new Date(tx.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50/60 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {tx.description || (isPositive ? "Sale Credit" : "Withdrawal Payout")}
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {formattedDate}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-sm font-extrabold ${isPositive ? "text-emerald-600" : "text-slate-900"}`}>
                      {isPositive ? "+" : "-"}₹{(Math.abs(tx.amount_paise) / 100).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
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
  );
}
