import { getServerUser } from "@/shared/lib/auth";
import { serverApiGet } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, ExternalLink, Package } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export default async function PurchasesPage() {
  // Auth handled by custom auth client
  const user = await getServerUser();
  if (!user) redirect("/login");

  const res = await serverApiGet<any[]>(`/orders?buyer_id=${user.id}`);
  const orders = res.success ? res.data : [];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-950">My Purchases</h1>
        <p className="text-slate-600 mt-1">View all your purchased products</p>
      </div>

      {!orders || orders.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-950 mb-2">No purchases yet</h3>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              Browse our marketplace and find production-ready code assets.
            </p>
            <Link href="/browse">
              <Button className="bg-slate-950 text-white hover:bg-slate-800">
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        {order.product?.title || "Product"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={order.status === "completed" ? "default" : "secondary"}
                          className={`text-[10px] ${
                            order.status === "completed"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : order.status === "refunded"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {order.status}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          by {order.seller?.full_name || "Seller"}
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-500">
                          {new Date(order.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-950">
                      ₹{(order.amount_paise / 100).toLocaleString()}
                    </div>
                    {order.github_repo_url && (
                      <a
                        href={order.github_repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 justify-end"
                      >
                        View Repo <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
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
