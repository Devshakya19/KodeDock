"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Package, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { auth, type User } from "@/shared/lib/auth";
import { apiGet } from "@/shared/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const userData = await auth.getUser();
      if (!userData) {
        window.location.href = "/login";
        return;
      }
      setUser(userData);

      // Fetch orders through proxy
      try {
        const result = await apiGet<any[]>("/orders");
        if (result.success && result.data) {
          setOrders(result.data);
        }
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
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/browse" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-950">
              My Dashboard
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/browse">
              <Button variant="ghost" size="sm" className="text-slate-600">
                Browse Products
              </Button>
            </Link>
            <form action="/api/auth/logout" method="post">
              <Button variant="ghost" size="sm" className="text-slate-500">
                Logout
              </Button>
            </form>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-950">
            Welcome back, {user.full_name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-slate-600 mt-1">Here&apos;s your account overview</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-950/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Total Purchases</div>
                  <div className="text-2xl font-bold text-slate-950">{completedOrders}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-950/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Total Spent</div>
                  <div className="text-2xl font-bold text-slate-950">₹{(totalSpent / 100).toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-950/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Role</div>
                  <div className="text-lg font-bold text-slate-950 capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-950">Recent Purchases</h2>
              {orders.length > 0 && (
                <Link href="/browse">
                  <Button variant="ghost" size="sm" className="text-slate-600">
                    Browse More <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No purchases yet</p>
                <Link href="/browse">
                  <Button className="mt-4 bg-slate-950 text-white hover:bg-slate-800">
                    Browse Products
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order: any) => (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-950">
                            {order.product?.title || "Product"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(order.created_at).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-950">
                          ₹{(order.amount_paise / 100).toLocaleString()}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${
                            order.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
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
    </div>
  );
}
