import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Package, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { verifyToken } from "@/shared/lib/auth/server";
import { theme } from "@/shared/lib/theme";

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
  const token = cookieStore.get("kodedock_token")?.value;
  if (!token) redirect("/login");

  const claims = await verifyToken(token);
  if (!claims) redirect("/login");

  const order = await fetchOrder(token, id);
  if (!order) return notFound();

  const isBuyer = order.buyer_id === claims.sub;
  const amount = order.amount_paise / 100;

  return (
    <div className="flex-1">

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-border">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              {order.status === "completed" ? (
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {order.status === "completed" ? "Payment Confirmed" : "Payment Pending"}
                </h1>
                <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className={
                  order.status === "completed"
                    ? "bg-success/20 text-success"
                    : "bg-warning/20 text-warning"
                }>
                  {order.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium text-foreground">INR {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ordered</span>
                <span className="text-foreground">{new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              {order.completed_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="text-foreground">{new Date(order.completed_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
              )}
              {order.razorpay_payment_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="text-muted-foreground font-mono text-xs">{order.razorpay_payment_id}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Link href={isBuyer ? "/browse" : "/seller/products"}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-slate-800">
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
