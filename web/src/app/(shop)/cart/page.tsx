"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { theme } from "@/shared/lib/theme";

export default function CartPage() {
  return (
    <div className="flex-1">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-border">
          <CardContent className="p-16 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Cart coming soon</h2>
            <p className="text-muted-foreground mb-6">
              The shopping cart is under development. In the meantime, you can purchase products directly from their page.
            </p>
            <Link href="/browse">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
