"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  Eye,
  ShoppingCart,
  Edit2,
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Check,
  Filter,
  SlidersHorizontal,
  Sparkles,
  Layers,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api/client";
import { SellerHeader } from "../components/seller-header";

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

const POLL_INTERVAL = 15000;

export default function ProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"sales" | "views" | "price_high" | "price_low">("sales");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Highlight animation on background polling change
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

        const changed = new Set<string>();
        newProducts.forEach((p) => {
          const old = prev.get(p.id);
          if (old) {
            if (old.sales_count !== p.sales_count || old.view_count !== p.view_count) {
              changed.add(p.id);
            }
          }
        });

        if (changed.size > 0) {
          setChangedIds(changed);
          setTimeout(() => setChangedIds(new Set()), 2000);
        }

        const newMap = new Map<string, SellerProduct>();
        newProducts.forEach((p) => newMap.set(p.id, p));
        prevProductsRef.current = newMap;

        setProducts(newProducts);
        setLastUpdated(new Date());
      }
    } catch {
      // Silently catch background poll failures
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const timer = setInterval(() => fetchProducts(), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchProducts]);

  const copyProductLink = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/products/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category_name) set.add(p.category_name);
    });
    return Array.from(set);
  }, [products]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        const matchesCategory = categoryFilter === "all" || p.category_name === categoryFilter;
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "sales") return (b.sales_count || 0) - (a.sales_count || 0);
        if (sortBy === "views") return (b.view_count || 0) - (a.view_count || 0);
        if (sortBy === "price_high") return b.price_paise - a.price_paise;
        if (sortBy === "price_low") return a.price_paise - b.price_paise;
        return 0;
      });
  }, [products, statusFilter, categoryFilter, searchQuery, sortBy]);

  // Derived stats
  const totalViews = stats?.total_views ?? products.reduce((acc, p) => acc + (p.view_count || 0), 0);
  const totalSales = stats?.total_sales ?? products.reduce((acc, p) => acc + (p.sales_count || 0), 0);
  const activeCount = products.filter((p) => p.status === "active").length;

  if (loading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Loading Inventory Catalog...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      {/* 1. Header */}
      <SellerHeader
        badge="Product Inventory"
        title="Products & Assets"
        description="Manage your code packages, monitor views, and track individual sales performance."
        lastUpdated={lastUpdated}
        onRefresh={() => fetchProducts(true)}
        refreshing={refreshing}
        actions={
          <Link href="/seller/products/new">
            <button
              type="button"
              className="group h-11 pl-5 pr-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-3 shadow-md shadow-slate-950/20 active:scale-[0.98] cursor-pointer"
            >
              <span>Create New Product</span>
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
            </button>
          </Link>
        }
      />

      {/* 2. Catalog Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-8">
        <div className="rounded-[26px] bg-white p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-white to-slate-50/60 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Catalog Size
              </span>
              <div className="text-2xl font-black text-slate-950 tabular-nums">
                {products.length} Products
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {activeCount} currently active for purchase
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] bg-white p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-white to-slate-50/60 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Units Sold
              </span>
              <div className="text-2xl font-black text-slate-950 tabular-nums">
                {totalSales.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Across all product listings
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] bg-white p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-white to-slate-50/60 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Catalog Views
              </span>
              <div className="text-2xl font-black text-slate-950 tabular-nums">
                {totalViews.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Unique visits & impressions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Deck & Search Toolbar */}
      <div className="rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs mb-8">
        <div className="rounded-[22px] bg-gradient-to-b from-white to-slate-50/40 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All", count: products.length },
              { id: "active", label: "Active", count: activeCount },
              { id: "limited", label: "Limited", count: products.filter((p) => p.status === "limited").length },
              { id: "paused", label: "Paused", count: products.filter((p) => p.status === "paused").length },
              { id: "draft", label: "Drafts", count: products.filter((p) => p.status === "draft").length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-slate-950 text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                {tab.label} <span className="opacity-60 text-[10px] ml-1">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search & Sort Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200/80 text-xs font-bold text-slate-700 py-2.5 px-3 rounded-xl outline-none cursor-pointer hover:border-slate-300 shadow-2xs"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200/80 text-xs font-bold text-slate-700 py-2.5 px-3 rounded-xl outline-none cursor-pointer hover:border-slate-300 shadow-2xs"
            >
              <option value="sales">Sort: Top Sales</option>
              <option value="views">Sort: Most Views</option>
              <option value="price_high">Price: High to Low</option>
              <option value="price_low">Price: Low to High</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 shadow-2xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Products Grid */}
      {products.length === 0 ? (
        <div className="w-full bg-white border border-dashed border-slate-200 rounded-[32px] p-16 text-center shadow-xs">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-xs">
            <Package className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
            Your catalog is currently empty
          </h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed font-normal">
            You haven't published any digital code assets yet. Upload your first boilerplate, UI kit, or project to begin selling.
          </p>
          <Link href="/seller/products/new">
            <button
              type="button"
              className="h-12 px-8 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 shadow-md shadow-slate-950/20 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> List Your First Product
            </button>
          </Link>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="w-full bg-white border border-dashed border-slate-200 rounded-[32px] p-16 text-center shadow-xs">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No matching products found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setCategoryFilter("all");
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`group flex flex-col bg-white rounded-[26px] p-1.5 ring-1 shadow-xs hover:shadow-lg transition-all duration-300 relative ${
                changedIds.has(product.id)
                  ? "ring-emerald-400 shadow-emerald-100/50"
                  : "ring-slate-200/80 hover:ring-slate-300"
              }`}
            >
              <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-white to-slate-50/50 flex-1 flex flex-col overflow-hidden">
                {/* Image Section */}
                <div className="aspect-[16/10] w-full bg-slate-100/80 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <Package className="w-10 h-10 text-slate-300" />
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs border backdrop-blur-md ${
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

                  {/* Quick Copy Link Tooltip Action */}
                  <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => copyProductLink(product.id, e)}
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-700 flex items-center justify-center hover:bg-white shadow-xs border border-slate-200/60 transition-transform active:scale-90 cursor-pointer"
                      title="Copy Public Link"
                    >
                      {copiedId === product.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                      {product.category_name || "Code Asset"}
                    </span>
                    {product.status === "limited" && product.stock_limit && (
                      <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        {product.stock_limit} left
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-slate-900 text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>

                  {/* Velocity Stats */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-4 mt-auto pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="tabular-nums font-bold">
                        {product.sales_count || 0} sales
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span className="tabular-nums font-bold">
                        {product.view_count || 0} views
                      </span>
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="font-black text-slate-950 text-base tabular-nums">
                      {product.price_paise === 0 ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        `₹${(product.price_paise / 100).toLocaleString()}`
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/products/${product.id}`} target="_blank">
                        <button
                          type="button"
                          className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                          title="View on marketplace"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <Link href={`/seller/products/${product.id}/edit`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-950 hover:text-white font-bold px-3 text-xs transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 mr-1.5" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
