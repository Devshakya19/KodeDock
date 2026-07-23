"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Package, ArrowRight, Wallet, Star } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { auth, type User } from "@/shared/lib/auth";
import { apiGet } from "@/shared/lib/api";
import { WalletPopup } from "@/features/wallet/components/wallet-popup";

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const totalSpent = orders.reduce((sum: number, o: any) => sum + o.amount_paise, 0);
  const completedOrders = orders.filter((o: any) => o.status === "completed").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-950">
            Hey, {user.full_name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Here&apos;s your account overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="border-slate-200 hover:border-slate-300 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Purchases</div>
                  <div className="text-xl font-bold text-slate-950">{completedOrders}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:border-slate-300 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Star className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Total Spent</div>
                  <div className="text-xl font-bold text-slate-950">₹{(totalSpent / 100).toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button onClick={() => setShowWallet(true)}>
            <Card className="border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-slate-950">Wallet</div>
                      {walletBalance !== null && (
                        <div className="text-xs text-slate-500">₹{(walletBalance / 100).toLocaleString()} available</div>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </button>

          <Link href="/browse">
            <Card className="border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-950">Browse</div>
                      <div className="text-xs text-slate-500">Find new products</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-950">Recent Purchases</h2>
              {orders.length > 0 && (
                <Link href="/dashboard/purchases" className="text-xs text-slate-500 hover:text-slate-700 font-medium">
                  View all
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-3">No purchases yet</p>
                <Link href="/browse" className="text-sm font-medium text-slate-950 hover:underline">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 5).map((order: any) => (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-950 truncate">
                            {order.product?.title || "Product"}
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <div className="text-sm font-semibold text-slate-950">
                          ₹{(order.amount_paise / 100).toLocaleString()}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${
                            order.status === "completed"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-amber-50 text-amber-600 border-amber-200"
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {showWallet && <WalletPopup onClose={() => setShowWallet(false)} />}
    </div>
  );
}
