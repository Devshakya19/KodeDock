"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, CreditCard, Loader2, CheckCircle, Package, AlertCircle, Shield, Zap, Download } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { apiGet, apiPost } from "@/shared/lib/api";

interface Product {
  id: string;
  title: string;
  description: string;
  price_paise: number;
  image_url: string | null;
  category_name: string | null;
}

interface CheckoutOrderResponse {
  order_id: string;
  razorpay_order_id: string;
  amount_paise: number;
  currency: string;
  key_id: string | null;
  product_title: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayCallbackResponse) => void;
  prefill: { email?: string };
  theme: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance { open: () => void; }

interface RazorpayCallbackResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) { resolve(true); return; }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) { existing.addEventListener("load", () => resolve(true)); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product_id");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);

  const loadProduct = useCallback(async () => {
    if (!productId) { setProductLoading(false); return; }
    try {
      const result = await apiGet<Product>(`/products/${productId}`);
      if (result.success && result.data) setProduct(result.data);
      else setError(result.error || "Product not found");
    } catch { setError("Failed to load product"); }
    finally { setProductLoading(false); }
  }, [productId]);

  useEffect(() => { loadProduct(); }, [loadProduct]);

  async function handlePurchase() {
    if (!product || !productId) return;
    setLoading(true);
    setError("");
    try {
      const orderResult = await apiPost<CheckoutOrderResponse>("/orders", { product_id: productId });
      if (!orderResult.success || !orderResult.data) {
        setError(orderResult.error || "Failed to create order");
        setLoading(false);
        return;
      }
      const orderData = orderResult.data;
      if (!orderData.key_id) { setError("Payments are not configured. Please contact support."); setLoading(false); return; }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) { setError("Failed to load payment gateway. Please try again."); setLoading(false); return; }

      const options: RazorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount_paise,
        currency: orderData.currency,
        name: "CodeHaat",
        description: orderData.product_title,
        order_id: orderData.razorpay_order_id,
        handler: async (response) => {
          try {
            const verifyResult = await apiPost("/orders/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderData.order_id,
            });
            if (verifyResult.success) {
              setSuccess(true);
              setTimeout(() => router.push("/dashboard/purchases"), 3000);
            } else {
              setError(verifyResult.error || "Payment verification failed.");
              setLoading(false);
            }
          } catch {
            setError("Payment was made but verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: {},
        theme: { color: "#0f172a" },
        modal: { ondismiss: () => { setError("Payment was cancelled."); setLoading(false); } },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight mb-2">Payment Successful!</h1>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-2">
            Your code will be delivered to your GitHub account shortly.
          </p>
          <p className="text-xs text-slate-400 mb-8">Check your email for the repo access link.</p>
          <Link href="/browse">
            <Button className="bg-slate-950 text-white hover:bg-slate-800 rounded-xl px-8 h-12 font-semibold shadow-lg shadow-slate-950/20">
              Browse More Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = product ? product.price_paise / 100 : 0;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
          <Link href="/browse" className="flex items-center gap-2 text-slate-500 hover:text-slate-950 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Browse
          </Link>
        </nav>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!productId && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            No product selected. Go to <Link href="/browse" className="underline font-medium">Browse</Link> to pick a product.
          </div>
        )}

        <Card className="border-slate-200 mb-5">
          <CardContent className="p-5">
            {productLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : product ? (
              <>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-950 truncate">{product.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{product.category_name || "Uncategorized"}</div>
                  </div>
                  <div className="text-sm font-bold text-slate-950 flex-shrink-0">
                    ₹{price.toLocaleString()}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Product Price</span>
                    <span className="text-slate-700 font-medium">₹{price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Platform Fee</span>
                    <span className="text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded-full">Included</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between">
                    <span className="font-extrabold text-slate-950 text-base">Total</span>
                    <span className="font-extrabold text-slate-950 text-base">₹{price.toLocaleString()}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">Product not found</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <h2 className="text-sm font-extrabold text-slate-950 tracking-tight mb-4 uppercase">Payment</h2>

            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-950 bg-slate-50 mb-4">
              <CreditCard className="w-5 h-5 text-slate-950" />
              <div>
                <div className="text-sm font-semibold text-slate-950">Razorpay</div>
                <div className="text-xs text-slate-500">UPI, Cards, Netbanking, Wallets</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">
              <Lock className="w-3.5 h-3.5" />
              <span>256-bit encrypted &middot; Secured by Razorpay</span>
            </div>

            <Button
              onClick={handlePurchase}
              disabled={loading || !product || !productId}
              className="w-full h-13 bg-slate-950 text-white hover:bg-slate-800 rounded-xl text-base font-semibold shadow-lg shadow-slate-950/20 transition-all hover:shadow-xl hover:shadow-slate-950/30 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ₹${price.toLocaleString()}`}
            </Button>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              By purchasing, you agree to our <Link href="/terms" className="underline hover:text-slate-600">Terms of Service</Link>
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: Shield, label: "Secure Payment" },
            { icon: Download, label: "Instant Access" },
            { icon: Zap, label: "GitHub Delivery" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 text-center py-3 rounded-xl bg-slate-50 border border-slate-100">
              <Icon className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] text-slate-500 font-medium leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
