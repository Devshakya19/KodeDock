import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { KodeDockLogo } from "@/shared/components/brand/kodedock-logo";
import { serverApiGet } from "@/shared/lib/auth/client";
import { theme } from "@/shared/lib/theme";

interface Product {
  id: string;
  title: string;
  description: string;
  price_paise: number;
  rating: number;
}

async function getCategoryProducts(slug: string): Promise<Product[]> {
  try {
    const res = await serverApiGet<Product[]>(`/products?category=${slug}`);
    return res.data ?? [];
  } catch {
    return [];
  }
}

function formatSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getCategoryProducts(slug);

  return (
    <div className="flex-1">
      <header className="border-b border-border bg-background">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/browse" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <KodeDockLogo href="/browse" />
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Badge variant="secondary" className="mb-2 bg-secondary border-border">Category</Badge>
          <h1 className="text-2xl font-bold text-foreground">{formatSlug(slug)}</h1>
          <p className="text-muted-foreground mt-1">{products.length} products available</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No products in this category</h2>
            <Link href="/browse">
              <Button className="mt-4 bg-primary text-primary-foreground hover:bg-slate-800">
                Browse All Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="group border border-border hover:border-slate-950 hover:shadow-lg transition-all cursor-pointer h-full">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2">{product.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className={`text-base font-bold ${product.price_paise === 0 ? "text-success font-extrabold" : "text-foreground"}`}>
                        {product.price_paise === 0 ? "Free" : `₹${(product.price_paise / 100).toLocaleString()}`}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {product.rating?.toFixed(1) || "0.0"} ★
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
