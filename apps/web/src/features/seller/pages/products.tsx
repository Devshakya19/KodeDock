"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  Eye,
  ShoppingCart,
  Edit2,
  LayoutGrid,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { apiGet } from "@/shared/lib/api";

interface SellerProduct {
  id: string;
  title: string;
  description: string;
  price_paise: number;
  category_name: string | null;
  status: string;
  image_url: string | null;
  sales_count: number;
  view_count: number;
  stock_limit: number | null;
}

interface SellerStats {
  total_products: number;
  active_products: number;
  total_sales: number;
  total_views: number;
}

const POLL_INTERVAL = 15000; // 15 seconds

export default function ProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Track changed product ids for highlight animation
  const prevProductsRef = useRef<Map<string, SellerProduct>>(new Map());
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set());

  const fetchProducts = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [res, statsRes] = await Promise.all([
        apiGet<SellerProduct[]>("/seller/products"),
        apiGet<SellerStats>("/seller/stats"),
      ]);

      if (statsRes.data) {
        setStats(statsRes.data);
      }

      if (res.data) {
        const newProducts = res.data;
        const prev = prevProductsRef.current;

        // Detect which products had their sales_count or view_count change
        const changed = new Set<string>();
        newProducts.forEach((p) => {
          const old = prev.get(p.id);
          if (old) {
            if (
              old.sales_count !== p.sales_count ||
              old.view_count !== p.view_count
            ) {
              changed.add(p.id);
            }
          }
        });

        if (changed.size > 0) {
          setChangedIds(changed);
          setTimeout(() => setChangedIds(new Set()), 2000);
        }

        // Update ref
        const newMap = new Map<string, SellerProduct>();
        newProducts.forEach((p) => newMap.set(p.id, p));
        prevProductsRef.current = newMap;

        setProducts(newProducts);
        setLastUpdated(new Date());
      }
    } catch {
      // silently fail on background poll
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Live polling every 15s
  useEffect(() => {
    const timer = setInterval(() => fetchProducts(), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchProducts]);

  // Derived stats (prefer authoritative /seller/stats API, fallback to manual sum)
  const totalViews = stats?.total_views ?? products.reduce((acc, p) => acc + (p.view_count || 0), 0);
  const totalSales = stats?.total_sales ?? products.reduce(
    (acc, p) => acc + (p.sales_count || 0),
    0
  );
  const activeProducts = products.filter((p) => p.status === "active").length;

  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    return lastUpdated.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-slate-300 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-3">
            <LayoutGrid className="w-3.5 h-3.5" />
            Inventory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Your Products
          </h1>
          <p className="text-slate-500 mt-2 text-[15px] max-w-xl">
            Manage your digital products, track views, and monitor your sales
            performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live indicator + manual refresh */}
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-[11px] text-slate-400">
                Updated {formatLastUpdated()}
              </span>
            )}
            <button
              onClick={() => fetchProducts(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100"
              title="Refresh now"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            {/* Live pulse dot */}
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live
            </span>
          </div>
          <Link href="/seller/products/new">
            <Button className="h-11 px-6 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5">
              <Plus className="w-5 h-5 mr-2" />
              Create New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview — always visible once products exist */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-5 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Total Products
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {products.length}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {activeProducts} currently active
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-5 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Total Sales
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {totalSales}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Across all products</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-5 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Total Views
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {totalViews}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Product page visits</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Your inventory is empty
          </h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto text-[15px]">
            You haven't listed any products yet. Start your journey by creating
            your first digital product.
          </p>
          <Link href="/seller/products/new">
            <Button className="h-12 px-8 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-md">
              <Plus className="w-5 h-5 mr-2" />
              List Your First Product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={`group flex flex-col bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative ${
                changedIds.has(product.id)
                  ? "border-emerald-300 shadow-emerald-100 ring-2 ring-emerald-200"
                  : "border-slate-200/80 hover:border-slate-300"
              }`}
            >
              {/* Image Section */}
              <div className="aspect-[4/3] w-full bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <Package className="w-10 h-10 text-slate-300" />
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border backdrop-blur-md ${
                      product.status === "active"
                        ? "bg-emerald-500/90 text-white border-emerald-400/50"
                        : product.status === "limited"
                        ? "bg-rose-500/90 text-white border-rose-400/50"
                        : product.status === "paused"
                        ? "bg-amber-500/90 text-white border-amber-400/50"
                        : "bg-slate-800/90 text-white border-slate-700/50"
                    }`}
                  >
                    {product.status.toUpperCase()}
                  </span>
                </div>

                {/* Updated flash badge */}
                {changedIds.has(product.id) && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                      Updated!
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {product.category_name || "Uncategorized"}
                </div>

                <h3 className="font-extrabold text-slate-900 text-[16px] leading-snug mb-2 line-clamp-2">
                  {product.title}
                </h3>

                <div className="flex items-center gap-4 text-[12px] font-medium text-slate-500 mb-4 mt-auto pt-4">
                  <div
                    className={`flex items-center gap-1.5 transition-colors duration-500 ${
                      changedIds.has(product.id) ? "text-emerald-600" : ""
                    }`}
                  >
                    <ShoppingCart
                      className={`w-3.5 h-3.5 ${
                        changedIds.has(product.id)
                          ? "text-emerald-500"
                          : "text-emerald-500"
                      }`}
                    />
                    <span className="tabular-nums">
                      {product.sales_count || 0}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors duration-500 ${
                      changedIds.has(product.id) ? "text-blue-600" : ""
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span className="tabular-nums">
                      {product.view_count || 0}
                    </span>
                  </div>
                  {product.status === "limited" && product.stock_limit && (
                    <div className="flex items-center gap-1.5 text-rose-500 ml-auto">
                      <span>{product.stock_limit} left</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="font-extrabold text-slate-900 text-[16px]">
                    {product.price_paise === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      `₹${(product.price_paise / 100).toLocaleString()}`
                    )}
                  </div>
                  <Link href={`/seller/products/${product.id}/edit`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold px-4"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
