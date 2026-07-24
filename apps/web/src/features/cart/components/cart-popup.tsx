"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

interface CartItem {
  id: string;
  title: string;
  price_paise: number;
  image_url: string | null;
}

function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("codehaat_cart") || "[]"); } catch { return []; }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem("codehaat_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

interface Props {
  onClose: () => void;
}

export function CartPopup({ onClose }: Props) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => { setItems(getCart()); }, []);

  const removeItem = useCallback((id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    saveCart(updated);
  }, [items]);

  const total = items.reduce((sum, item) => sum + item.price_paise, 0);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div className="mt-16 mr-4 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-950">Cart</span>
            {items.length > 0 && <span className="text-xs text-slate-400">({items.length})</span>}
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="py-10 text-center">
            <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-1">Your cart is empty</p>
            <p className="text-xs text-slate-400 mb-4">Browse products and add them to your cart</p>
            <Link href="/browse" onClick={onClose}>
              <Button size="sm" className="bg-slate-950 text-white hover:bg-slate-800 text-xs">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-950 truncate">{item.title}</p>
                    <p className="text-xs text-slate-500">₹{(item.price_paise / 100).toLocaleString()}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">Total</span>
                <span className="text-base font-bold text-slate-950">₹{(total / 100).toLocaleString()}</span>
              </div>
              <Link href={`/checkout?product_id=${items[0]?.id}`} onClick={onClose}>
                <Button className="w-full bg-slate-950 text-white hover:bg-slate-800 rounded-lg text-sm h-10">
                  Checkout <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
