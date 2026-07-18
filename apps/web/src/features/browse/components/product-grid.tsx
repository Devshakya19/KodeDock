"use client";

import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { ProductCard } from "./product-card";
import { apiGet } from "@/shared/lib/api";

interface Product {
  id: string;
  title: string;
  description: string;
  price_paise: number;
  original_price_paise?: number;
  category?: { name: string };
  category_name?: string;
  seller?: { full_name: string };
  rating: number;
  review_count: number;
  tags: string[];
  sales_count: number;
  image_url?: string;
}

interface ProductGridProps {
  searchQuery?: string;
  categoryFilter?: string;
}

export function ProductGrid({ searchQuery = "", categoryFilter = "" }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (categoryFilter) params.set("category", categoryFilter);

        const qs = params.toString();
        const path = `/products${qs ? `?${qs}` : ""}`;
        const result = await apiGet<Product[]>(path);
        if (result.success && result.data) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, categoryFilter]);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video bg-slate-200 rounded-t-xl" />
            <div className="p-4 space-y-3 border border-t-0 border-slate-200 rounded-b-xl">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg">No products found</p>
        <p className="text-slate-400 text-sm mt-2">Be the first to list a product!</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          description={product.description || ""}
          price={product.price_paise / 100}
          originalPrice={product.original_price_paise ? product.original_price_paise / 100 : undefined}
          category={product.category_name || "Uncategorized"}
          seller={product.seller?.full_name || "Unknown"}
          rating={product.rating}
          reviews={product.review_count}
          image={product.image_url || undefined}
          tags={product.tags || []}
        />
      ))}
    </div>
  );
}
