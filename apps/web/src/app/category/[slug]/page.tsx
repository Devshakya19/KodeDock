import { auth } from "@/shared/lib/auth";
import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

async function getCategoryProducts(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/products?category=${slug}`);
    const data = await res.json();
    return data.success ? data.data : [];
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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/browse" className="flex items-center gap-2 text-slate-600 hover:text-slate-950 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <CodeHaatLogo href="/browse" />
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Badge variant="secondary" className="mb-2 bg-slate-100 border-slate-200">Category</Badge>
          <h1 className="text-2xl font-bold text-slate-950">{formatSlug(slug)}</h1>
          <p className="text-slate-500 mt-1">{products.length} products available</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-950 mb-2">No products in this category</h2>
            <Link href="/browse">
              <Button className="mt-4 bg-slate-950 text-white hover:bg-slate-800">
                Browse All Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="group border border-slate-200 hover:border-slate-950 hover:shadow-lg transition-all cursor-pointer h-full">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-950 text-sm line-clamp-2">{product.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="text-base font-bold text-slate-950">
                        ₹{(product.price_paise / 100).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500">
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
