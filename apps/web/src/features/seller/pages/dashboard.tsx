import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, TrendingUp, DollarSign, Plus, BarChart3, Settings, ShoppingCart } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { getUserRole, ROLES } from "@/shared/lib/roles";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

async function fetchSellerStats(token: string) {
  try {
    const res = await fetch(`${API_URL}/api/seller/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.success ? data.data : { total_products: 0, active_products: 0, total_sales: 0, total_revenue_paise: 0, total_earned_paise: 0 };
  } catch {
    return { total_products: 0, active_products: 0, total_sales: 0, total_revenue_paise: 0, total_earned_paise: 0 };
  }
}

export default async function DashboardPage() {
  // Auth handled by custom auth client
  const user = await auth.getUser();
  if (!user) redirect("/login");

  const role = getUserRole(user);
  if (role !== ROLES.DEVELOPER) redirect("/browse");

  const session = await auth.getSession();
  const token = session?.token || "";

  const stats = await fetchSellerStats(token);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Seller Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Welcome back, {user.full_name || user.email}
          </p>
        </div>
        <Link href="/seller/products/new">
          <Button className="bg-slate-950 text-white hover:bg-slate-800">
            <Plus className="w-4 h-4 mr-2" />
            List Product
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-950/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Total Products</div>
                <div className="text-2xl font-bold text-slate-950">{stats.total_products}</div>
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
                <div className="text-sm text-slate-500">Total Sales</div>
                <div className="text-2xl font-bold text-slate-950">{stats.total_sales}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-950/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Revenue</div>
                <div className="text-2xl font-bold text-slate-950">₹{(stats.total_revenue_paise / 100).toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">You Keep (97.5%)</div>
                <div className="text-2xl font-bold text-emerald-600">₹{(stats.total_earned_paise / 100).toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/seller/products">
          <Card className="border-slate-200 hover:border-slate-950 hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <Package className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-semibold text-slate-950 text-sm">My Products</div>
                <div className="text-xs text-slate-500">{stats.active_products} active</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/seller/orders">
          <Card className="border-slate-200 hover:border-slate-950 hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <ShoppingCart className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-semibold text-slate-950 text-sm">Orders</div>
                <div className="text-xs text-slate-500">Track sales</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/seller/earnings">
          <Card className="border-slate-200 hover:border-slate-950 hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-semibold text-slate-950 text-sm">Earnings</div>
                <div className="text-xs text-slate-500">View analytics</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/seller/settings">
          <Card className="border-slate-200 hover:border-slate-950 hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <Settings className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-semibold text-slate-950 text-sm">Settings</div>
                <div className="text-xs text-slate-500">Manage account</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </>
  );
}
