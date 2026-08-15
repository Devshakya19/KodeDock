"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Package, ArrowRight, Wallet, Star, ChevronRight, CheckCircle2, Search, ExternalLink } from "lucide-react";
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
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const totalSpent = orders.reduce((sum: number, o: any) => sum + o.amount_paise, 0);
  const completedOrders = orders.filter((o: any) => o.status === "completed").length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Welcome back, {user.full_name?.split(" ")[0] || "Buyer"}! 👋
        </h1>
        <p className="text-slate-500 mt-2 text-base font-medium">Here&apos;s what&apos;s happening with your account today.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm shadow-slate-100 transition-all hover:shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-[14px] bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Purchases</p>
                  <p className="text-2xl font-black text-slate-900">{completedOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm shadow-slate-100 transition-all hover:shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-[14px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Amount Spent</p>
                  <p className="text-2xl font-black text-slate-900">₹{(totalSpent / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm shadow-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-400" /> Recent Activity
              </h2>
              {orders.length > 0 && (
                <Link href="/dashboard/purchases" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                  View all <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No purchases yet</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">You haven&apos;t bought anything yet. Explore the marketplace to find awesome digital products.</p>
                <Link href="/browse" className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-colors hover:bg-slate-800">
                  Explore Products
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.slice(0, 4).map((order: any) => (
                  <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-5 sm:p-6 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[14px] bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:border-slate-200 transition-colors shrink-0">
                        <Package className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{order.product?.title || "Digital Product"}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${order.status === 'completed' ? 'text-emerald-500' : 'text-slate-400'}`} />
                          <span className="text-[13px] font-medium text-slate-500">
                            {new Date(order.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden sm:block">
                        <div className="font-black text-slate-900">₹{(order.amount_paise / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${order.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {order.status}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
            Quick Links
          </h3>

          <Link href="/dashboard/wallet" className="block">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden group shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-all">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Wallet className="w-32 h-32 -rotate-12 translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm mb-6 border border-white/10">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-300 mb-1">CodeHaat Wallet</p>
                {walletBalance !== null ? (
                  <div className="text-3xl font-black tracking-tight mb-6">
                    <span className="text-xl text-slate-400 mr-1">₹</span>
                    {(walletBalance / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                ) : (
                  <div className="h-10 mb-6 flex items-center">
                    <div className="w-24 h-6 bg-white/10 rounded animate-pulse" />
                  </div>
                )}
                <div className="flex items-center text-sm font-bold text-white gap-2 group-hover:gap-3 transition-all">
                  Manage Wallet <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/browse" className="block">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1">Discover Products</h4>
              <p className="text-sm text-slate-500 font-medium mb-4">Browse our marketplace for new and trending software assets.</p>
              <div className="flex items-center text-sm font-bold text-blue-600 gap-1 group-hover:gap-2 transition-all">
                Start Exploring <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
          
          <div className="bg-slate-100 rounded-3xl p-6 border border-slate-200 text-center">
             <h4 className="font-bold text-slate-900 mb-2">Want to sell your code?</h4>
             <p className="text-sm text-slate-500 font-medium mb-4">Become a seller and start earning by selling your digital products.</p>
             <Link href="/seller" className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900">
               Go to Seller Dashboard
             </Link>
          </div>

        </div>
      </div>

      {showWallet && <WalletPopup onClose={() => setShowWallet(false)} />}
    </div>
  );
}
