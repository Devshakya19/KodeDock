"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-slate-200">
          <CardContent className="p-16 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-950 mb-2">Cart coming soon</h2>
            <p className="text-slate-500 mb-6">
              The shopping cart is under development. In the meantime, you can purchase products directly from their page.
            </p>
            <Link href="/browse">
              <Button className="bg-slate-950 text-white hover:bg-slate-800">
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
