import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Package, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { verifyToken } from "@/shared/lib/server-auth";

const RUST_BACKEND = process.env.CORE_ENGINE_URL || "http://localhost:4001";

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  amount_paise: number;
  platform_fee_paise: number;
  seller_amount_paise: number;
  status: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  completed_at: string | null;
}

async function fetchOrder(token: string, orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`${RUST_BACKEND}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("codehaat_token")?.value;
  if (!token) redirect("/login");

  const claims = await verifyToken(token);
  if (!claims) redirect("/login");

  const order = await fetchOrder(token, id);
  if (!order) return notFound();

  const isBuyer = order.buyer_id === claims.sub;
  const amount = order.amount_paise / 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href={isBuyer ? "/dashboard/purchases" : "/seller/orders"} className="flex items-center gap-2 text-slate-600 hover:text-slate-950">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to {isBuyer ? "Purchases" : "Orders"}</span>
          </Link>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-slate-200">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              {order.status === "completed" ? (
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-950">
                  {order.status === "completed" ? "Payment Confirmed" : "Payment Pending"}
                </h1>
                <p className="text-sm text-slate-500">Order #{order.id.slice(0, 8)}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Status</span>
                <Badge variant="secondary" className={
                  order.status === "completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }>
                  {order.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Amount</span>
                <span className="font-medium text-slate-950">INR {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Ordered</span>
                <span className="text-slate-950">{new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              {order.completed_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Completed</span>
                  <span className="text-slate-950">{new Date(order.completed_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
              )}
              {order.razorpay_payment_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Payment ID</span>
                  <span className="text-slate-500 font-mono text-xs">{order.razorpay_payment_id}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Link href={isBuyer ? "/browse" : "/seller/products"}>
                <Button className="w-full bg-slate-950 text-white hover:bg-slate-800">
                  {isBuyer ? "Browse More Products" : "Manage Products"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
