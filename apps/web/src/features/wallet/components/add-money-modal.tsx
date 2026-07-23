"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { apiPost } from "@/shared/lib/api";

interface AddMoneyModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function AddMoneyModal({ onClose, onSuccess }: AddMoneyModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  async function handleAddMoney() {
    const amountPaise = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountPaise) || amountPaise < 100) {
      setError("Minimum amount is ₹1");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway");
        setLoading(false);
        return;
      }

      const result = await apiPost<{ razorpay_order_id: string; amount_paise: number; currency: string; key_id: string }>(
        "/wallet/topup",
        { amount_paise: amountPaise }
      );

      if (!result.success || !result.data) {
        setError(result.error || "Failed to create topup order");
        setLoading(false);
        return;
      }

      const options = {
        key: result.data.key_id,
        amount: result.data.amount_paise,
        currency: result.data.currency,
        name: "CodeHaat",
        description: "Add money to wallet",
        order_id: result.data.razorpay_order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyResult = await apiPost("/wallet/topup/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyResult.success) {
              onSuccess();
            } else {
              setError(verifyResult.error || "Payment verification failed");
              setLoading(false);
            }
          } catch {
            setError("Verification failed");
            setLoading(false);
          }
        },
        prefill: { name: "", email: "" },
        theme: { color: "#0f172a" },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-950">Add Money to Wallet</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Amount (INR)</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            className="h-11 text-lg"
          />
        </div>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(a.toString())}
              className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                amount === a.toString()
                  ? "bg-slate-950 text-white border-slate-950"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
              }`}
            >
              ₹{a.toLocaleString()}
            </button>
          ))}
        </div>

        <Button onClick={handleAddMoney} disabled={loading || !amount} className="w-full bg-slate-950 text-white hover:bg-slate-800">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Add Money
        </Button>
      </div>
    </div>
  );
}
