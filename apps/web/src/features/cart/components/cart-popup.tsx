"use client";

import { useEffect } from "react";
import { X, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

interface Props {
  onClose: () => void;
}

export function CartPopup({ onClose }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="mt-16 mr-4 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-950">Cart</span>
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        <div className="py-10 text-center">
          <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 mb-1">Cart coming soon</p>
          <p className="text-xs text-slate-400 mb-4">Purchase products directly from their page</p>
          <Link href="/browse" onClick={onClose}>
            <Button size="sm" className="bg-slate-950 text-white hover:bg-slate-800 text-xs">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
