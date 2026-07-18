import { getServerUser } from "@/shared/lib/auth";
import { serverApiGet } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Package, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";

export default async function DashboardHomePage() {
  // Auth handled by custom auth client
  const user = await getServerUser();
  if (!user) redirect("/login");

  const [profileRes, ordersRes] = await Promise.all([
    serverApiGet<any>(`/profile/${user.id}`),
    serverApiGet<any[]>(`/orders?buyer_id=${user.id}`),
  ]);
  const profile = profileRes.success ? profileRes.data : null;
  const orders = ordersRes.success ? ordersRes.data : [];

  const fullName = profile?.full_name || user.full_name || "";
  const shortName = fullName ? fullName.split(" ")[0] : "there";
  const totalOrders = orders?.length || 0;
  const totalSpent = orders?.reduce((sum: number, o: any) => sum + o.amount_paise, 0) || 0;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-950">Welcome back, {shortName}!</h1>
        <p className="text-slate-600 mt-1">Here&apos;s what&apos;s happening with your account</p>
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
                <div className="text-2xl font-bold text-slate-950">{totalOrders}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-950/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-950" />
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
                <div className="text-sm text-slate-500">Member Since</div>
                <div className="text-lg font-bold text-slate-950">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "N/A"}
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
            <Link href="/dashboard/purchases">
              <Button variant="ghost" size="sm" className="text-slate-600">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {!orders || orders.length === 0 ? (
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
              {orders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div>
                    <div className="text-sm font-medium text-slate-950">
                      {order.product?.title || "Product"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-950">₹{(order.amount_paise / 100).toLocaleString()}</div>
                    <div className={`text-xs font-medium ${order.status === "completed" ? "text-emerald-600" : "text-amber-600"}`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
