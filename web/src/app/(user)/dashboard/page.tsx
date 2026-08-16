"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, Package, ArrowRight, Wallet, 
  CreditCard, Search, ArrowUpRight, Clock, 
  Sparkles, CheckCircle2, ChevronRight, HelpCircle
} from "lucide-react";
import { auth, type User } from "@/lib/auth/client";
import { apiGet } from "@/lib/api/client";
import { WalletPopup } from "@/components/wallet/wallet-popup";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showWallet, setShowWallet] = useState(false);

  useEffect(() => {
    async function loadData() {
      const userData = await auth.getUser();
      if (!userData) {
        window.location.href = "/login";
        return;
      }
      setUser(userData);

      try {
        const [ordersRes, walletRes] = await Promise.all([
          apiGet<any[]>("/orders"),
          apiGet<{ balance_paise: number }>("/wallet"),
        ]);
        if (ordersRes.success && ordersRes.data) setOrders(ordersRes.data);
        if (walletRes.success && walletRes.data) setWalletBalance(walletRes.data.balance_paise);
      } catch {}

      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const totalSpent = orders.reduce((sum: number, o: any) => sum + o.amount_paise, 0);
  const completedOrders = orders.filter((o: any) => o.status === "completed").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Welcome back, {user.full_name?.split(" ")[0] || "Buyer"}.
          </h1>
          <p className="text-slate-500 font-medium text-lg">Here's your activity overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/browse" className="h-12 px-7 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center gap-2.5 hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-900/20 active:scale-95">
            <Search className="w-4.5 h-4.5" /> Explore Marketplace
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Purchases */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-colors group flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-100 group-hover:bg-slate-100 transition-colors">
              <ShoppingBag className="w-5.5 h-5.5" />
            </div>
            <Link href="/dashboard/purchases" className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Purchases</p>
            <p className="text-3xl font-black text-slate-900">{completedOrders}</p>
          </div>
        </div>

        {/* Amount Spent */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-colors group flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50 group-hover:bg-emerald-100 transition-colors">
              <CreditCard className="w-5.5 h-5.5" />
            </div>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount Spent</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">₹{(totalSpent / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Wallet Balance */}
        <div onClick={() => setShowWallet(true)} className="bg-slate-900 text-white rounded-[24px] p-6 shadow-xl shadow-slate-900/10 relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-slate-900/20 transition-all hover:-translate-y-0.5 flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/10 backdrop-blur-md">
                <Wallet className="w-5.5 h-5.5" />
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/10 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">Wallet Balance</p>
              {walletBalance !== null ? (
                <p className="text-3xl font-black text-white tracking-tight">₹{(walletBalance / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              ) : (
                <div className="h-9 flex items-center"><div className="w-24 h-6 bg-white/10 rounded-lg animate-pulse" /></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100/80 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-slate-400" /> Recent Purchases
            </h2>
            {orders.length > 0 && (
              <Link href="/dashboard/purchases" className="text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
                View all
              </Link>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <Package className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No purchases yet</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">You haven't bought anything yet. Explore the marketplace to find awesome digital products.</p>
              <Link href="/browse" className="h-12 px-7 rounded-full bg-slate-100 text-slate-900 font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-colors">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100/80 flex-1">
              {orders.slice(0, 5).map((order: any) => (
                <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-5 hover:bg-slate-50/80 transition-colors group">
                  <div className="flex items-center gap-4.5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-slate-300 transition-colors shrink-0">
                      <Package className="w-5.5 h-5.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-[15px] group-hover:text-blue-600 transition-colors">{order.product?.title || "Digital Product"}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle2 className={`w-4 h-4 ${order.status === 'completed' ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span className="text-[13px] font-semibold text-slate-500">
                          {new Date(order.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="hidden sm:block">
                      <div className="font-black text-slate-900 text-[15px]">₹{(order.amount_paise / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      <div className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${order.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {order.status}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          
          {/* Seller Banner */}
          <Link href="/seller" className="block group h-full">
            <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-blue-100/50 rounded-[24px] p-7 border border-blue-100/60 relative overflow-hidden transition-all hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 h-full">
              <div className="absolute top-0 right-0 p-4 opacity-40 mix-blend-multiply">
                <Sparkles className="w-24 h-24 text-blue-200 -rotate-12 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-5.5 h-5.5" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Become a Seller</h3>
                <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed">
                  Turn your code into cash. Start selling templates, plugins, and UI kits to our global community.
                </p>
                <div className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white transition-colors group-hover:bg-blue-700 shadow-sm shadow-blue-600/20">
                  Setup Store <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>
          </Link>

          {/* Help Center */}
          <Link href="/contact" className="block group">
            <div className="bg-white rounded-[24px] p-6 border border-slate-200/60 flex items-center gap-5 hover:border-slate-300 transition-all hover:shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-slate-100 transition-colors">
                <HelpCircle className="w-5.5 h-5.5 text-slate-500 group-hover:text-slate-700 transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-0.5">Need help?</h4>
                <p className="text-[13px] font-medium text-slate-500">Contact our support team</p>
              </div>
            </div>
          </Link>
          
        </div>
      </div>

      {showWallet && <WalletPopup onClose={() => setShowWallet(false)} />}
    </div>
  );
}
