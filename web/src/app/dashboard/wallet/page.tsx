"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw, CreditCard, Activity, CheckCircle2, Search, Wifi } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { apiGet } from "@/shared/lib/api";
import { auth } from "@/shared/lib/auth";
import { AddMoneyModal } from "@/features/wallet/components/add-money-modal";

interface Wallet {
  balance_paise: number;
  pending_paise: number;
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

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [userName, setUserName] = useState("MEMBER");
  const [isFlipped, setIsFlipped] = useState(false);

  const fetchData = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const [w, tx, user] = await Promise.all([
        apiGet<Wallet>("/wallet"),
        apiGet<Transaction[]>("/wallet/transactions"),
        auth.getUser(),
      ]);
      if (w.data) setWallet(w.data);
      if (tx.data) setTransactions(tx.data);
      if (user) setUserName(user.full_name || "MEMBER");
    } catch {}
    
    if (!isSilentRefresh) setLoading(false);
    else setIsRefreshing(false);
  }, []);

  useEffect(() => { fetchData(false); }, [fetchData]);

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
        <Link href="/browse" className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Browse
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Wallet</h1>
            <p className="text-slate-500 mt-2 text-base">Manage your CodeHaat Black Card and billing history.</p>
          </div>
          <Button disabled={isRefreshing} onClick={() => fetchData(true)} variant="outline" className="h-10 px-4 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} /> Sync Data
          </Button>
        </div>
      </div>

      {/* Top Hero Section */}
      <div className="grid lg:grid-cols-2 gap-10 mb-12 items-center">
        
        {/* Left: Giant Credit Card */}
        <div className="w-full max-w-[550px] mx-auto lg:mx-0">
          {/* Interactive 3D Credit Card */}
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
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-[24px] p-6 sm:p-8 text-white overflow-hidden border border-slate-700/50 shadow-inner"
                style={{ backfaceVisibility: "hidden" }}
              >
                {/* Abstract map/wave background */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-transparent to-transparent blur-3xl pointer-events-none group-hover:opacity-20 transition-opacity duration-700" />
                
                {/* Glossy overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-40 pointer-events-none" />
                
                {/* CODEHAAT BLACK Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[20deg] pointer-events-none opacity-[0.03] w-full flex justify-center mix-blend-overlay">
                  <span className="text-[80px] sm:text-[110px] font-black tracking-tighter whitespace-nowrap">CODEHAAT BLACK</span>
                </div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-slate-200 to-white flex items-center justify-center shadow-lg border border-white/20">
                        <span className="text-slate-900 font-black text-2xl leading-none -mt-0.5">c</span>
                      </div>
                      <span className="font-black tracking-tighter text-xl text-white/90">CODEHAAT</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <Wifi className="w-7 h-7 text-slate-300 opacity-80 rotate-90" />
                    </div>
                  </div>
                  
                  {/* Middle Row: Chip & Balance */}
                  <div className="mt-6 flex flex-col justify-center flex-1">
                    <div className="w-14 h-10 bg-gradient-to-br from-amber-200 to-amber-500 rounded-md opacity-90 flex items-center justify-center overflow-hidden mb-6 shadow-sm border border-amber-600/30">
                      <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-[0.5px] opacity-40">
                        <div className="border-r border-b border-amber-900"></div>
                        <div className="border-r border-b border-amber-900"></div>
                        <div className="border-b border-amber-900"></div>
                        <div className="border-r border-b border-amber-900"></div>
                        <div className="border-r border-b border-amber-900"></div>
                        <div className="border-b border-amber-900"></div>
                        <div className="border-r border-amber-900"></div>
                        <div className="border-r border-amber-900"></div>
                        <div></div>
                      </div>
                    </div>
                    
                    {/* The card number display */}
                    <div className="font-mono text-xl sm:text-2xl tracking-[0.2em] sm:tracking-[0.25em] text-slate-200 opacity-80 mb-2 font-medium">
                      BUYER ACCT 8080
                    </div>
                  </div>
                  
                  {/* Bottom Row */}
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mb-1">Card Holder</div>
                      <div className="text-sm sm:text-base font-bold tracking-widest uppercase text-slate-100 max-w-[200px] truncate">{userName}</div>
                    </div>
                    
                    <div className="text-right flex flex-col items-center mr-4">
                      <div className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mb-1">Status</div>
                      <div className="text-sm sm:text-base font-bold tracking-widest text-emerald-400">ACTIVE</div>
                    </div>
                    
                    {/* Mastercard style overlapping circles */}
                    <div className="flex -space-x-4">
                      <div className="w-10 h-10 rounded-full bg-red-500/80 backdrop-blur-sm mix-blend-screen" />
                      <div className="w-10 h-10 rounded-full bg-amber-500/80 backdrop-blur-sm mix-blend-screen" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Side */}
              <div 
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-[24px] text-white overflow-hidden border border-slate-700/50 flex flex-col"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {/* Magnetic Stripe */}
                <div className="w-full h-14 sm:h-16 bg-black mt-8 opacity-90 shadow-inner" />
                
                <div className="px-6 sm:px-8 py-6 flex-1 flex flex-col">
                  {/* Signature Strip */}
                  <div className="w-full h-10 sm:h-12 bg-slate-200/90 rounded flex items-center justify-end px-4 shadow-inner">
                    <span className="text-slate-800 font-bold text-sm sm:text-base italic font-serif tracking-widest">{userName}</span>
                  </div>

                  <div className="mt-4 sm:mt-6 text-[10px] sm:text-xs text-slate-400 leading-tight opacity-70 max-w-[80%]">
                    <p>This card is issued by CodeHaat for digital marketplace transactions and is non-transferable. Use of this card is governed by the terms and conditions.</p>
                    <p className="mt-2 text-[9px] uppercase tracking-widest font-bold">Authorized signature required.</p>
                  </div>
                  
                  {/* Footer on back */}
                  <div className="mt-auto flex justify-between items-end">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                      <div className="w-6 h-6 border border-slate-600 rounded-md flex items-center justify-center">
                         <Search className="w-3 h-3" />
                      </div>
                      support@codehaat.com
                    </div>
                    <div className="text-xs font-black text-slate-600 tracking-[0.2em]">CODEHAAT BLACK</div>
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
        <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden">
           {/* Decorative background element */}
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <CreditCard className="w-48 h-48 -rotate-12 translate-x-8 -translate-y-8" />
           </div>

           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                 <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Active</span>
                 </div>
                 <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Digital Wallet</span>
              </div>
              
              <p className="text-sm font-semibold text-slate-500 mb-1">Available Balance</p>
              <div className="text-[56px] font-black tracking-tighter text-slate-900 flex items-start leading-none mb-10">
                <span className="text-3xl mt-2 mr-1 text-slate-400">₹</span>
                {((wallet?.balance_paise ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Total Spent</p>
                    <p className="text-xl font-black text-slate-900">₹{((wallet?.total_spent_paise ?? 0) / 100).toLocaleString()}</p>
                 </div>
                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Pending</p>
                    <p className="text-xl font-black text-slate-900">₹{((wallet?.pending_paise ?? 0) / 100).toLocaleString()}</p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <Button onClick={() => setShowAddMoney(true)} className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-base font-bold shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5">
                    + Add Money
                 </Button>
                 <Button disabled={isRefreshing} onClick={() => fetchData(true)} variant="outline" className="w-14 h-14 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
                 </Button>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Section: Transactions History */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recent Transactions</h2>
           <div className="relative group">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                 type="text" 
                 placeholder="Search history..." 
                 className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all w-64 group-hover:border-slate-300"
              />
           </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Activity className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Transactions Yet</h3>
              <p className="text-slate-500 max-w-sm">Your transaction history will appear here once you start using your wallet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((tx) => {
                const isCredit = tx.type === "CREDIT";
                return (
                  <div key={tx.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                      <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border ${
                        isCredit ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-slate-50 text-slate-600 border-slate-100"
                      }`}>
                        {isCredit ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base mb-1">{tx.description || "Wallet Transaction"}</p>
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                          <span className="font-semibold text-slate-400">{new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="uppercase text-[11px] tracking-wider font-bold">{tx.type}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end pl-16 sm:pl-0">
                      <div className={`font-black text-lg ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isCredit ? '+' : '-'}₹{(tx.amount_paise / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      {showAddMoney && (
        <AddMoneyModal 
          onClose={() => setShowAddMoney(false)}
          onSuccess={() => {
            setShowAddMoney(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
