import { getServerUser } from "@/shared/lib/auth";
import { serverApiGet } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

export default async function SellerOrdersPage() {
  // Auth handled by custom auth client
  const user = await getServerUser();
  if (!user) redirect("/login");

  const res = await serverApiGet<any[]>(`/orders?seller_id=${user.id}`);
  const orders = res.data ?? [];

  const completedOrders = orders.filter((o: any) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + o.seller_amount_paise, 0);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Orders</h1>
          <p className="text-slate-600 mt-1">Track your sales and revenue</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Total Revenue</div>
          <div className="text-2xl font-bold text-emerald-600">₹{(totalRevenue / 100).toLocaleString()}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-sm text-slate-500">Total Orders</div>
            <div className="text-xl font-bold text-slate-950">{orders.length}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-sm text-slate-500">Completed</div>
            <div className="text-xl font-bold text-emerald-600">{completedOrders.length}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-sm text-slate-500">Pending</div>
            <div className="text-xl font-bold text-amber-600">{orders.length - completedOrders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <Card key={order.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-950">
                        {order.product?.title || "Product"}
                      </div>
                      <div className="text-xs text-slate-500">
                        Order #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-950">
                      ₹{(order.seller_amount_paise / 100).toLocaleString()}
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        order.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "refunded"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
