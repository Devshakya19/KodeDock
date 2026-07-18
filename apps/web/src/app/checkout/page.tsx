"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, CreditCard, Loader2, CheckCircle, Package, AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { apiGet, apiPost } from "@/shared/lib/api";

interface Product {
  id: string;
  title: string;
  description: string;
  price_paise: number;
  image_url: string | null;
  category: { name: string; slug: string } | null;
  seller: { full_name: string | null; email: string } | null;
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

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayCallbackResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      return;
    }
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
    if (!productId) {
      setProductLoading(false);
      return;
    }
    try {
      const result = await apiGet<Product>(`/products/${productId}`);
      if (result.success && result.data) {
        setProduct(result.data);
      } else {
        setError(result.error || "Product not found");
      }
    } catch {
      setError("Failed to load product");
    } finally {
      setProductLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  async function handlePurchase() {
    if (!product || !productId) return;

    setLoading(true);
    setError("");

    try {
      // Step 1: Create order on backend (returns Razorpay order details)
      const orderResult = await apiPost<CheckoutOrderResponse>("/orders", {
        product_id: productId,
      });

      if (!orderResult.success || !orderResult.data) {
        setError(orderResult.error || "Failed to create order");
        setLoading(false);
        return;
      }

      const orderData = orderResult.data;

      // If Razorpay is not configured (key_id is null), show error
      if (!orderData.key_id) {
        setError("Payments are not configured. Please contact support.");
        setLoading(false);
        return;
      }

      // Step 2: Load Razorpay Checkout.js
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway. Please try again.");
        setLoading(false);
        return;
      }

      // Step 3: Open Razorpay Checkout
      const options: RazorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount_paise,
        currency: orderData.currency,
        name: "CodeHaat",
        description: orderData.product_title,
        order_id: orderData.razorpay_order_id,
        handler: async (response: RazorpayCallbackResponse) => {
          // Step 4: Verify payment on backend
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
              setError(
                verifyResult.error ||
                  "Payment verification failed. Please contact support."
              );
              setLoading(false);
            }
          } catch {
            setError(
              "Payment was made but verification failed. Please contact support with your payment ID."
            );
            setLoading(false);
          }
        },
        prefill: {},
        theme: { color: "#0f172a" },
        modal: {
          ondismiss: () => {
            setError("Payment was cancelled.");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error. Please try again."
      );
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="border-slate-200 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-950 mb-2">
              Purchase Successful!
            </h1>
            <p className="text-slate-600 mb-6">
              Your code will be delivered to your GitHub account shortly.
            </p>
            <Link href="/browse">
              <Button className="bg-slate-950 text-white hover:bg-slate-800">
                Browse More Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link
            href="/browse"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Browse</span>
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-950 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!productId && (
          <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            No product selected. Go to{" "}
            <Link href="/browse" className="underline font-medium">
              Browse
            </Link>{" "}
            to pick a product.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-950 mb-4">
                Order Summary
              </h2>
              {productLoading ? (
                <div className="text-center py-8 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading product...
                </div>
              ) : product ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                    <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-950">
                        {product.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {product.category?.name || "Uncategorized"}
                      </div>
                      {product.seller && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          by {product.seller.full_name || product.seller.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Product Price</span>
                      <span className="text-slate-950">
                        ₹{(product.price_paise / 100).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Platform Fee</span>
                      <span className="text-slate-950">Included</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold">
                      <span className="text-slate-950">Total</span>
                      <span className="text-slate-950">
                        ₹{(product.price_paise / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Product not found
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-950 mb-4">
                Payment Method
              </h2>
              <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-950 bg-slate-50 mb-6">
                <CreditCard className="w-5 h-5 text-slate-950" />
                <div>
                  <div className="text-sm font-medium text-slate-950">
                    Razorpay
                  </div>
                  <div className="text-xs text-slate-500">
                    UPI, Cards, Netbanking
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                <Lock className="w-3 h-3" />
                <span>Secured by Razorpay</span>
              </div>
              <Button
                onClick={handlePurchase}
                disabled={loading || !product || !productId}
                className="w-full h-12 bg-slate-950 text-white hover:bg-slate-800"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  `Pay ₹${product ? (product.price_paise / 100).toLocaleString() : "0"}`
                )}
              </Button>
              <p className="text-xs text-slate-500 text-center mt-4">
                By purchasing, you agree to our Terms of Service
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
