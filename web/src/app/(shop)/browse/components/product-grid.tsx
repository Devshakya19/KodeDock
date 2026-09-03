"use client";

import { useEffect, useState } from "react";
import { SearchX } from "lucide-react";
import { ProductCard } from "./product-card";
import { apiGet } from "@/shared/lib/api/client";

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
  sortFilter?: string;
  priceFilter?: string;
}

export function ProductGrid({
  searchQuery = "",
  categoryFilter = "",
  sortFilter = "popular",
  priceFilter = "",
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (categoryFilter) params.set("category", categoryFilter);
        if (sortFilter && sortFilter !== "popular") params.set("sort", sortFilter);
        if (priceFilter) params.set("price", priceFilter);

        const qs = params.toString();
        const path = `/products${qs ? `?${qs}` : ""}`;
        const result = await apiGet<Product[]>(path);

        if (result.success && Array.isArray(result.data)) {
          setProducts(result.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, categoryFilter, sortFilter, priceFilter]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-[#110f1c] p-3 rounded-[22px] border border-[#211d35]"
          >
            <div className="aspect-[16/10] bg-[#1a162b] rounded-[16px] mb-3.5" />
            <div className="px-1.5 space-y-2.5 pb-2">
              <div className="h-3 bg-[#1e1933] rounded w-1/3" />
              <div className="h-4 bg-[#1e1933] rounded w-3/4" />
              <div className="h-3 bg-[#1e1933] rounded w-1/2" />
              <div className="h-5 bg-[#1e1933] rounded w-1/4 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-[#100e1c] rounded-[24px] border border-[#231f38] border-dashed">
        <div className="w-16 h-16 rounded-2xl bg-[#1a162b] flex items-center justify-center mb-4 text-slate-500">
          <SearchX className="w-8 h-8 text-violet-400" />
        </div>
        <p className="text-white text-lg font-bold mb-1">No templates found</p>
        <p className="text-slate-400 text-[14px] max-w-sm">
          We couldn't find any products matching your current filters. Try adjusting your search
          terms or categories.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          description={product.description || ""}
          price={product.price_paise / 100}
          originalPrice={
            product.original_price_paise ? product.original_price_paise / 100 : undefined
          }
          category={product.category_name || product.category?.name || "Uncategorized"}
          seller={product.seller_name || "Creator"}
          rating={product.rating || 0}
          reviews={product.review_count || 0}
          image={product.image_url || undefined}
          tags={product.tags || []}
          salesCount={product.sales_count || 0}
        />
      ))}
    </div>
  );
}
