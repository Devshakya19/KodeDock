"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, CreditCard, Loader2, CheckCircle, Package } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { auth } from "@/shared/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product_id");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState<any>(null);

  // Auth handled by custom auth client

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      try {
        const res = await fetch(`${API_URL}/api/products/${productId}`);
        const data = await res.json();
        if (data.success) setProduct(data.data);
      } catch {}
    }
    loadProduct();
  }, [productId]);

  async function handlePurchase() {
    setLoading(true);
    setError("");
    try {
      const session = await auth.getSession();
      if (!session) { router.push("/login"); return; }
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.token}` },
        body: JSON.stringify({ product_id: productId }),
      });
      const result = await res.json();
      if (result.success) { setSuccess(true); setTimeout(() => router.push("/dashboard/purchases"), 3000); }
      else { setError(result.error || "Failed to process purchase"); }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="border-slate-200 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-950 mb-2">Purchase Successful!</h1>
            <p className="text-slate-600 mb-6">Your code has been delivered to your GitHub account.</p>
            <Link href="/browse"><Button className="bg-slate-950 text-white hover:bg-slate-800">Browse More Products</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/browse" className="flex items-center gap-2 text-slate-600 hover:text-slate-950">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Back to Browse</span>
          </Link>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-950 mb-8">Checkout</h1>
        {error && <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-950 mb-4">Order Summary</h2>
              {product ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                    <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-950">{product.title}</div>
                      <div className="text-xs text-slate-500">{product.category?.name}</div>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-slate-600">Product Price</span><span className="text-slate-950">₹{(product.price_paise / 100).toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-600">Platform Fee</span><span className="text-slate-950">₹0 (Free)</span></div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold"><span className="text-slate-950">Total</span><span className="text-slate-950">₹{(product.price_paise / 100).toLocaleString()}</span></div>
                  </div>
                </div>
              ) : <div className="text-center py-8 text-slate-500">Loading product...</div>}
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-950 mb-4">Payment Method</h2>
              <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-950 bg-slate-50 mb-6">
                <CreditCard className="w-5 h-5 text-slate-950" />
                <div><div className="text-sm font-medium text-slate-950">Razorpay</div><div className="text-xs text-slate-500">UPI, Cards, Netbanking</div></div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-6"><Lock className="w-3 h-3" /><span>Secured by Razorpay</span></div>
              <Button onClick={handlePurchase} disabled={loading || !product} className="w-full h-12 bg-slate-950 text-white hover:bg-slate-800">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ₹${product ? (product.price_paise / 100).toLocaleString() : "0"}`}
              </Button>
              <p className="text-xs text-slate-500 text-center mt-4">By purchasing, you agree to our Terms of Service</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
