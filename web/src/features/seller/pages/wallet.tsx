"use client";

import { useState, useEffect, useCallback } from "react";
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
  Plus,
  Pencil,
  ShieldCheck,
  CheckCircle2,
  Search,
  Wifi,
  Activity,
  ArrowLeft,
  Clock,
  TrendingUp,
  CreditCard,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { apiGet, apiPost } from "@/shared/lib/api";
import { auth } from "@/shared/lib/auth";
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
    } catch {
      // Silently handle poll errors
    } finally {
      if (!isManual) setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Auto-refresh every 15s
  useEffect(() => {
    const timer = setInterval(() => fetchData(true), POLL_INTERVAL);
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
        fetchData(true);
      } else {
        setError(result.error || "Withdrawal failed");
      }
    } catch {
      setError("Network error");
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

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === "sales") return tx.type === "sale";
    if (txFilter === "withdrawals") return tx.type === "withdrawal";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium text-sm animate-pulse">Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">


      {/* Page Header */}
      <div className="mb-10">
        <Link href="/seller" className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Seller Wallet</h1>
            <p className="text-slate-500 mt-2 text-base">Manage your store earnings, payouts, and CodeHaat Creator Card.</p>
          </div>
          <Button disabled={refreshing} onClick={() => fetchData(true)} variant="outline" className="h-10 px-4 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin text-blue-600" : ""}`} /> Sync Data
          </Button>
        </div>
      </div>

      {/* Top Hero Section */}
      <div className="grid lg:grid-cols-2 gap-10 mb-12 items-center">
        
        {/* Left: Giant Credit Card */}
        <div className="w-full max-w-[550px] mx-auto lg:mx-0">
          <div 
            className="relative w-full aspect-[1.586/1] cursor-pointer group hover:scale-[1.02] transition-transform duration-500"
            style={{ perspective: "2000px" }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div 
              className="relative w-full h-full transition-transform duration-[800ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] shadow-2xl rounded-[24px]"
              style={{ 
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
              }}
            >
              {/* Front Side */}
              <div 
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-black rounded-[24px] p-6 sm:p-8 text-white overflow-hidden border border-slate-800/80 shadow-inner"
                style={{ backfaceVisibility: "hidden" }}
              >
                {/* Abstract grid/mesh background */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" />
                
                {/* Glossy overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-30 pointer-events-none" />
                
                {/* CODEHAAT CREATOR Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[20deg] pointer-events-none opacity-[0.04] w-full flex justify-center mix-blend-overlay">
                  <span className="text-[75px] sm:text-[100px] font-black tracking-tighter whitespace-nowrap">CODEHAAT CREATOR</span>
                </div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
                        <span className="text-white font-black text-2xl leading-none -mt-0.5">c</span>
                      </div>
                      <span className="font-black tracking-tighter text-xl text-white/90">CODEHAAT <span className="text-blue-400">PRO</span></span>
                    </div>
                    <div className="flex flex-col items-end">
                      <Wifi className="w-7 h-7 text-slate-300 opacity-80 rotate-90" />
                    </div>
                  </div>
                  
                  {/* Middle Row: Chip & Balance */}
                  <div className="mt-6 flex flex-col justify-center flex-1">
                    <div className="w-14 h-10 bg-gradient-to-br from-slate-200 to-slate-400 rounded-md opacity-90 flex items-center justify-center overflow-hidden mb-6 shadow-sm border border-slate-500/30">
                      <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-[0.5px] opacity-40">
                        <div className="border-r border-b border-slate-600"></div>
                        <div className="border-r border-b border-slate-600"></div>
                        <div className="border-b border-slate-600"></div>
                        <div className="border-r border-b border-slate-600"></div>
                        <div className="border-r border-b border-slate-600"></div>
                        <div className="border-b border-slate-600"></div>
                        <div className="border-r border-slate-600"></div>
                        <div className="border-r border-slate-600"></div>
                        <div></div>
                      </div>
                    </div>
                    
                    {/* The card number display */}
                    <div className="font-mono text-xl sm:text-2xl tracking-[0.2em] sm:tracking-[0.25em] text-slate-200 opacity-80 mb-2 font-medium">
                      SELLER ACCT 9900
                    </div>
                  </div>
                  
                  {/* Bottom Row */}
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mb-1">Creator Name</div>
                      <div className="text-sm sm:text-base font-bold tracking-widest uppercase text-slate-100 max-w-[200px] truncate">{userName}</div>
                    </div>
                    
                    <div className="text-right flex flex-col items-center mr-4">
                      <div className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mb-1">Status</div>
                      <div className="text-sm sm:text-base font-bold tracking-widest text-emerald-400">ACTIVE</div>
                    </div>
                    
                    {/* Mastercard style overlapping circles */}
                    <div className="flex -space-x-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/80 backdrop-blur-sm mix-blend-screen" />
                      <div className="w-10 h-10 rounded-full bg-indigo-500/80 backdrop-blur-sm mix-blend-screen" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Side */}
              <div 
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-black rounded-[24px] text-white overflow-hidden border border-slate-800/80 flex flex-col"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {/* Magnetic Stripe */}
                <div className="w-full h-14 sm:h-16 bg-slate-900 mt-8 opacity-90 shadow-inner border-y border-slate-800" />
                
                <div className="px-6 sm:px-8 py-6 flex-1 flex flex-col">
                  {/* Signature Strip */}
                  <div className="w-full h-10 sm:h-12 bg-slate-200/90 rounded flex items-center justify-end px-4 shadow-inner">
                    <span className="text-slate-800 font-bold text-sm sm:text-base italic font-serif tracking-widest">{userName}</span>
                  </div>

                  <div className="mt-4 sm:mt-6 text-[10px] sm:text-xs text-slate-400 leading-tight opacity-70 max-w-[80%]">
                    <p>This Creator Card represents your verified seller account on CodeHaat. Payouts are subject to our terms of service and standard holding periods.</p>
                    <p className="mt-2 text-[9px] uppercase tracking-widest font-bold">Confidential Account Information.</p>
                  </div>
                  
                  {/* Footer on back */}
                  <div className="mt-auto flex justify-between items-end">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                      <div className="w-6 h-6 border border-slate-800 rounded-md flex items-center justify-center">
                         <Search className="w-3 h-3" />
                      </div>
                      sellers@codehaat.com
                    </div>
                    <div className="text-xs font-black text-slate-600 tracking-[0.2em]">CODEHAAT PRO</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4 font-medium flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Click card to flip
          </p>
        </div>

        {/* Right: Wallet Stats & Actions */}
        <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col h-full">
           {/* Decorative background element */}
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Banknote className="w-48 h-48 -rotate-12 translate-x-8 -translate-y-8" />
           </div>

           <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                 <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Ready for payout</span>
                 </div>
                 <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Creator Wallet</span>
              </div>
              
              <p className="text-sm font-semibold text-slate-500 mb-1">Available Balance</p>
              <div className="text-[56px] font-black tracking-tighter text-slate-900 flex items-start leading-none mb-10">
                <span className="text-3xl mt-2 mr-1 text-slate-400">₹</span>
                {((wallet?.balance_paise ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3"/> Escrow</p>
                    <p className="text-xl font-black text-slate-900">₹{((wallet?.pending_paise ?? 0) / 100).toLocaleString()}</p>
                 </div>
                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> All Time</p>
                    <p className="text-xl font-black text-slate-900">₹{((wallet?.total_earned_paise ?? 0) / 100).toLocaleString()}</p>
                 </div>
              </div>

              {/* Withdraw Form */}
              <div className="mt-auto space-y-4">
                 {error && <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/>{error}</div>}
                 {success && <div className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/>{success}</div>}
                 
                 <div className="flex gap-2">
                   <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                      <Input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Min 500"
                        min="500"
                        className="h-14 pl-10 pr-16 text-lg font-bold text-slate-900 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white"
                        disabled={!payoutAccount || withdrawing}
                      />
                      <button
                        type="button"
                        onClick={setMaxAmount}
                        disabled={!payoutAccount || withdrawing}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-black tracking-wider uppercase text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        MAX
                      </button>
                   </div>
                   
                   <Button
                      onClick={handleWithdraw}
                      disabled={withdrawing || !withdrawAmount || !payoutAccount}
                      className="h-14 px-6 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5"
                    >
                      {withdrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Withdraw"}
                    </Button>
                 </div>
                 
                 <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">Payout Method:</span>
                    <Link href="/seller/settings/payouts" className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      {payoutAccount ? (payoutAccount.account_type === 'upi' ? `UPI: ${payoutAccount.upi_id}` : `Bank: ••••${payoutAccount.masked_account_number?.slice(-4)}`) : "Setup Account"} <Pencil className="w-3 h-3" />
                    </Link>
                 </div>
              </div>

           </div>
        </div>
      </div>

      {/* Bottom Section: Transactions History */}
      <div className="mt-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
           <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial History</h2>
           
           <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
              {[
                { id: "all", label: "All" },
                { id: "sales", label: "Sales" },
                { id: "withdrawals", label: "Payouts" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTxFilter(tab.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    txFilter === tab.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
           </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Activity className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Transactions Found</h3>
              <p className="text-slate-500 max-w-sm">Your earning and withdrawal history will appear here once you make sales.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const isCredit = tx.amount_paise > 0;
                return (
                  <div key={tx.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                      <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border ${
                        isCredit ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-rose-50 text-rose-600 border-rose-100/50"
                      }`}>
                        {isCredit ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base mb-1">{tx.description || (isCredit ? "Sale Credit" : "Withdrawal Payout")}</p>
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                          <span className="font-semibold text-slate-400">{new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="uppercase text-[11px] tracking-wider font-bold">{tx.type}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end pl-16 sm:pl-0">
                      <div className={`font-black text-lg ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isCredit ? '+' : '-'}₹{(Math.abs(tx.amount_paise) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <p className="text-[12px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">
                        Bal: ₹{(tx.balance_after_paise / 100).toLocaleString()}
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
