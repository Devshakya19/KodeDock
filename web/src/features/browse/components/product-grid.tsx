"use client";

import { useEffect, useState } from "react";
import { SearchX } from "lucide-react";
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
  seller_name?: string | null;
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white p-2 rounded-[20px] border border-slate-100">
            <div className="aspect-[4/3] bg-slate-100 rounded-[14px] mb-4" />
            <div className="px-2 space-y-3 pb-2">
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[24px] border border-slate-100 border-dashed">
        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
          <SearchX className="w-10 h-10 text-slate-300" />
        </div>
        <p className="text-slate-900 text-xl font-bold mb-2">No templates found</p>
        <p className="text-slate-500 text-[15px] max-w-sm">
          We couldn't find any products matching your current search filters. Try adjusting your search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          description={product.description || ""}
          price={product.price_paise / 100}
          originalPrice={product.original_price_paise ? product.original_price_paise / 100 : undefined}
          category={product.category_name || "Uncategorized"}
          seller={product.seller_name || "Unknown"}
          rating={product.rating}
          reviews={product.review_count}
          image={product.image_url || undefined}
          tags={product.tags || []}
        />
      ))}
    </div>
  );
}
