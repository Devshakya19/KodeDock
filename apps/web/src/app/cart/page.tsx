"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Trash2, Package } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);

  function removeItem(id: string) {
    setItems(items.filter((item) => item.id !== id));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/browse" className="flex items-center gap-2 text-slate-600 hover:text-slate-950 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Browse</span>
            </Link>
          </div>
          <CodeHaatLogo href="/browse" />
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-950 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-16 text-center">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-950 mb-2">Your cart is empty</h2>
              <p className="text-slate-500 mb-6">Browse our marketplace to find code assets.</p>
              <Link href="/browse">
                <Button className="bg-slate-950 text-white hover:bg-slate-800">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="border-slate-200">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-950">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-950">₹{item.price}</div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-between items-center pt-4">
              <Link href="/browse" className="text-sm text-slate-600 hover:text-slate-950">
                Continue Shopping
              </Link>
              <Link href="/checkout">
                <Button className="bg-slate-950 text-white hover:bg-slate-800">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
