"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiGet } from "@/shared/lib/api/client";
import ProductCard, { ProductSummary } from "@/components/product/product-card";

export default function ExplorePage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await apiGet<ProductSummary[]>("/products");
        if (res.success && res.data) {
          setProducts(res.data);
        } else {
          setError(res.error || "Failed to load products");
        }
      } catch (err) {
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">Explore Marketplace</h1>
        <p className="text-gray-400 text-lg">Discover the best boilerplate codes, templates, and SaaS starters.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-purple-500" size={40} />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
          <p className="text-gray-400 text-lg">No products found at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.public_id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
