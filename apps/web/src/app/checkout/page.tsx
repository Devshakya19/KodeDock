"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Loader2, CheckCircle, Package, AlertCircle, Shield, Zap, Download, Wallet, CreditCard, ChevronRight, Receipt } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { apiGet, apiPost } from "@/shared/lib/api";

interface Product {
  id: string;
  title: string;
  description: string;
  price_paise: number;
  image_url: string | null;
  category_name: string | null;
}

interface WalletBalance {
  balance_paise: number;
  pending_paise: number;
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
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const loadProduct = useCallback(async () => {
    if (!productId) { setProductLoading(false); return; }
    try {
      const [productRes, walletRes] = await Promise.all([
        apiGet<Product>(`/products/${productId}`),
        apiGet<WalletBalance>("/wallet"),
      ]);
      if (productRes.success && productRes.data) setProduct(productRes.data);
      else setError(productRes.error || "Product not found");
      if (walletRes.success && walletRes.data) setWalletBalance(walletRes.data.balance_paise);
    } catch { setError("Failed to load product"); }
    finally { setProductLoading(false); }
  }, [productId]);

  useEffect(() => { loadProduct(); }, [loadProduct]);

  async function handleWalletPayment() {
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
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/purchases"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
      setLoading(false);
    }
  }

  async function handleRazorpayPayment() {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 md:p-14 rounded-[32px] text-center max-w-lg w-full shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
          <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-8 border-[8px] border-white shadow-lg">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Payment Successful!</h1>
          <p className="text-slate-500 text-base leading-relaxed mb-8 font-medium">
            Your purchase is confirmed. We are setting up your repository access and preparing your source code.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/purchases">
              <Button className="w-full h-14 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-bold shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 transition-all">
                View My Purchases <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const price = product ? product.price_paise / 100 : 0;
  const hasEnoughWallet = walletBalance !== null && walletBalance >= (product?.price_paise ?? 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={`/products/${productId || ''}`} className="flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </Link>
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Lock className="w-4 h-4" /> Secure Checkout
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-sm font-bold text-rose-700 flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {!productId && !productLoading && (
          <div className="max-w-md mx-auto mt-20 text-center">
             <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-amber-500" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-3">No product selected</h2>
             <p className="text-slate-500 font-medium mb-8">Please select a product from the marketplace to continue.</p>
             <Link href="/browse">
               <Button className="h-12 px-8 bg-slate-900 text-white rounded-2xl font-bold">Browse Marketplace</Button>
             </Link>
          </div>
        )}

        {productId && (
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
            
            {/* Left Column: Order Summary */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">Review your order</h1>
                <p className="text-slate-500 font-medium">Verify the details below before completing your purchase.</p>
              </div>

              <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-slate-400" /> Order Details
                </h2>

                {productLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : product ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="w-full sm:w-32 aspect-[16/10] sm:aspect-square rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-2 self-start">
                          {product.category_name || "Uncategorized"}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">{product.title}</h3>
                        <p className="text-sm text-slate-500 font-medium line-clamp-2">{product.description}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 space-y-4">
                      <div className="flex justify-between items-center text-[15px]">
                        <span className="text-slate-500 font-medium">Subtotal</span>
                        <span className="font-bold text-slate-900">
                          {price === 0 ? "Free" : `₹${price.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[15px]">
                        <span className="text-slate-500 font-medium">Platform Fee</span>
                        <span className="font-bold text-emerald-600">Included</span>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                        <span className="text-lg font-black text-slate-900">Total Due</span>
                        <span className={`text-3xl font-black tracking-tight ${price === 0 ? "text-emerald-600" : "text-slate-900"}`}>
                          {price === 0 ? "Free" : `₹${price.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 font-medium">Product not found.</div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Shield, title: "Secure Checkout", desc: "256-bit SSL encryption" },
                  { icon: Download, title: "Instant Delivery", desc: "Get code immediately" },
                  { icon: Zap, title: "Quality Assured", desc: "Verified source code" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="p-5 rounded-[24px] bg-white border border-slate-200/60 flex flex-col items-center text-center">
                    <Icon className="w-6 h-6 text-emerald-500 mb-3" />
                    <h4 className="text-[13px] font-bold text-slate-900 mb-1">{title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Payment */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                  
                  {/* Decorative corner */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-2xl pointer-events-none" />

                  <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" /> Payment Method
                  </h2>

                  {/* Wallet Balance Display */}
                  {walletBalance !== null && price > 0 && (
                    <div className="mb-6">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Available Balance</label>
                      <div className="flex items-center justify-between p-4 rounded-[20px] bg-slate-900 text-white shadow-inner">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white/90" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Digital Wallet</p>
                            <p className="text-xl font-black tracking-tight">₹{(walletBalance / 100).toLocaleString()}</p>
                          </div>
                        </div>
                        {hasEnoughWallet ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {hasEnoughWallet ? (
                      <div>
                        <Button
                          onClick={handleWalletPayment}
                          disabled={loading || !product || !productId}
                          className="w-full h-14 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl text-[15px] font-bold shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : price === 0 ? "Get for Free" : `Pay ₹${price.toLocaleString()} from Wallet`}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {walletBalance !== null && (
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-[12px] font-bold text-amber-700 text-center flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Insufficient wallet balance. Pay via Razorpay.
                          </div>
                        )}
                        <Button
                          onClick={handleRazorpayPayment}
                          disabled={loading || !product || !productId}
                          className="w-full h-14 bg-[#3399cc] text-white hover:bg-[#2b83b0] rounded-2xl text-[15px] font-bold shadow-lg shadow-[#3399cc]/20 transition-all hover:-translate-y-0.5"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : price === 0 ? "Get for Free" : `Pay ₹${price.toLocaleString()} securely`}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100/80">
                      <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[12px] font-bold text-slate-700 mb-1">
                          Payments processed securely
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          By proceeding, you agree to CodeHaat&apos;s <Link href="/terms" className="text-slate-700 hover:text-slate-950 underline underline-offset-2 decoration-slate-300">Terms of Service</Link> and <Link href="/privacy" className="text-slate-700 hover:text-slate-950 underline underline-offset-2 decoration-slate-300">Privacy Policy</Link>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
