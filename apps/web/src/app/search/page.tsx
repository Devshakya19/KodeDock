import Link from "next/link";
import { Search, ArrowLeft, Package } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";
import { serverApiGet } from "@/shared/lib/auth";

async function searchProducts(query: string, category: string, sort: string): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);

    const res = await serverApiGet<any[]>(`/products?${params.toString()}`);
    return res.data ?? [];
  } catch {
    return [];
  }
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const category = params.category || "";
  const sort = params.sort || "newest";

  const products = await searchProducts(query, category, sort);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">
          <Link href="/browse" className="flex items-center gap-2 text-slate-600 hover:text-slate-950 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <CodeHaatLogo href="/browse" />
          <form className="hidden md:flex flex-1 max-w-xl" action="/search" method="get">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search templates, UI kits, projects..."
                className="h-10 pl-10 pr-20 border-slate-300 bg-slate-50 text-sm"
              />
              <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 text-xs font-semibold">
                Search
              </Button>
            </div>
          </form>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-950">
            {query ? `Results for "${query}"` : "All Products"}
          </h1>
          <p className="text-slate-500 mt-1">{products.length} products found</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link href={`/search?q=${query}&sort=newest`}>
            <Badge variant={sort === "newest" ? "default" : "secondary"} className="cursor-pointer">
              Newest
            </Badge>
          </Link>
          <Link href={`/search?q=${query}&sort=price_low`}>
            <Badge variant={sort === "price_low" ? "default" : "secondary"} className="cursor-pointer">
              Price: Low to High
            </Badge>
          </Link>
          <Link href={`/search?q=${query}&sort=price_high`}>
            <Badge variant={sort === "price_high" ? "default" : "secondary"} className="cursor-pointer">
              Price: High to Low
            </Badge>
          </Link>
          <Link href={`/search?q=${query}&sort=rating`}>
            <Badge variant={sort === "rating" ? "default" : "secondary"} className="cursor-pointer">
              Top Rated
            </Badge>
          </Link>
        </div>

        {/* Results */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-950 mb-2">No products found</h2>
            <p className="text-slate-500 mb-4">Try different keywords or browse categories</p>
            <Link href="/browse">
              <Button className="bg-slate-950 text-white hover:bg-slate-800">
                Browse All Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="group border border-slate-200 hover:border-slate-950 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-400" />
                    </div>
                    {product.category && (
                      <Badge variant="secondary" className="absolute top-3 left-3 text-[10px] bg-white/90 border border-slate-200">
                        {product.category.name}
                      </Badge>
                    )}
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
