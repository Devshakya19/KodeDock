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
  try { return JSON.parse(localStorage.getItem("kodedock_cart") || "[]"); } catch { return []; }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem("kodedock_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

interface Props {
  onClose: () => void;
}

import { PopupWrapper } from "@/shared/ui/popup-wrapper";

export function CartPopup({ onClose }: Props) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => { setItems(getCart()); }, []);

  const removeItem = useCallback((id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    saveCart(updated);
  }, [items]);

  const total = items.reduce((sum, item) => sum + item.price_paise, 0);

  return (
    <PopupWrapper 
      title="Cart" 
      icon={ShoppingCart} 
      onClose={onClose}
      headerRight={items.length > 0 && <span className="text-xs text-muted-foreground">({items.length})</span>}
    >

        {items.length === 0 ? (
          <div className="py-10 text-center">
            <ShoppingCart className="w-8 h-8 text-muted-foreground/80 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Your cart is empty</p>
            <p className="text-xs text-muted-foreground mb-4">Browse products and add them to your cart</p>
            <Link href="/browse" onClick={onClose}>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <p className={`text-xs ${item.price_paise === 0 ? "text-success font-semibold" : "text-muted-foreground"}`}>
                      {item.price_paise === 0 ? "Free" : `₹${(item.price_paise / 100).toLocaleString()}`}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Total</span>
                <span className={`text-base font-bold ${total === 0 ? "text-success font-extrabold" : "text-foreground"}`}>
                  {total === 0 ? "Free" : `₹${(total / 100).toLocaleString()}`}
                </span>
              </div>
              <Link href={`/checkout?product_id=${items[0]?.id}`} onClick={onClose}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm h-10">
                  Checkout <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </>
        )}
    </PopupWrapper>
  );
}
