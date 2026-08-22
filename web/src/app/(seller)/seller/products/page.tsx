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
import { Button } from "@/shared/ui/button";
import { apiGet } from "@/shared/lib/api/client";
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
        <RefreshCw className="w-8 h-8 text-accent animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Loading Inventory Catalog...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      {/* 1. Header */}
      <SellerHeader
        title="Products & Assets"
        description="Manage your code packages, monitor views, and track individual sales performance."
        lastUpdated={lastUpdated}
        onRefresh={() => fetchProducts(true)}
        refreshing={refreshing}
        actions={
          <Link href="/seller/products/new">
            <button
              type="button"
              className="group h-11 pl-5 pr-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-3 shadow-md shadow-slate-950/20 active:scale-[0.98] cursor-pointer"
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
        <div className="rounded-[26px] bg-background p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-background to-secondary/40 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Catalog Size
              </span>
              <div className="text-2xl font-black text-foreground tabular-nums">
                {products.length} Products
              </div>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                {activeCount} currently active for purchase
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] bg-background p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-background to-secondary/40 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50/80 border border-success/20 flex items-center justify-center text-success shrink-0">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Units Sold
              </span>
              <div className="text-2xl font-black text-foreground tabular-nums">
                {totalSales.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                Across all product listings
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] bg-background p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-background to-secondary/40 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-center justify-center text-warning shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Catalog Views
              </span>
              <div className="text-2xl font-black text-foreground tabular-nums">
                {totalViews.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                Unique visits & impressions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Deck & Search Toolbar */}
      <div className="rounded-[28px] bg-background p-2 ring-1 ring-slate-200/80 shadow-xs mb-8">
        <div className="rounded-[22px] bg-gradient-to-b from-background to-secondary/20 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                    ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
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
                className="bg-background border border-border/80 text-xs font-bold text-foreground py-2.5 px-3 rounded-xl outline-none cursor-pointer hover:border-border shadow-2xs"
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
              className="bg-background border border-border/80 text-xs font-bold text-foreground py-2.5 px-3 rounded-xl outline-none cursor-pointer hover:border-border shadow-2xs"
            >
              <option value="sales">Sort: Top Sales</option>
              <option value="views">Sort: Most Views</option>
              <option value="price_high">Price: High to Low</option>
              <option value="price_low">Price: Low to High</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border/80 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary shadow-2xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Products Grid */}
      {products.length === 0 ? (
        <div className="w-full bg-background border border-dashed border-border rounded-[32px] p-16 text-center shadow-xs">
          <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6 text-accent shadow-xs">
            <Package className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">
            Your catalog is currently empty
          </h3>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm leading-relaxed font-normal">
            You haven't published any digital code assets yet. Upload your first boilerplate, UI kit, or project to begin selling.
          </p>
          <Link href="/seller/products/new">
            <button
              type="button"
              className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 shadow-md shadow-slate-950/20 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> List Your First Product
            </button>
          </Link>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="w-full bg-background border border-dashed border-border rounded-[32px] p-16 text-center shadow-xs">
          <Package className="w-10 h-10 text-muted-foreground/80 mx-auto mb-4" />
          <h3 className="text-base font-bold text-foreground mb-1">No matching products found</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-6">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setCategoryFilter("all");
            }}
            className="px-4 py-2 rounded-xl bg-secondary text-xs font-bold text-foreground hover:bg-secondary/80 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`group flex flex-col bg-background rounded-[26px] p-1.5 ring-1 shadow-xs hover:shadow-lg transition-all duration-300 relative ${
                changedIds.has(product.id)
                  ? "ring-emerald-400 shadow-emerald-100/50"
                  : "ring-slate-200/80 hover:ring-slate-300"
              }`}
            >
              <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-background to-secondary/30 flex-1 flex flex-col overflow-hidden">
                {/* Image Section */}
                <div className="aspect-[16/10] w-full bg-secondary/50 relative overflow-hidden flex items-center justify-center border-b border-border">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <Package className="w-10 h-10 text-muted-foreground/80" />
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs border backdrop-blur-md ${
                        product.status === "active"
                          ? "bg-emerald-500/90 text-primary-foreground border-emerald-400/50"
                          : product.status === "limited"
                          ? "bg-rose-500/90 text-primary-foreground border-rose-400/50"
                          : product.status === "paused"
                          ? "bg-amber-500/90 text-primary-foreground border-amber-400/50"
                          : "bg-secondary text-foreground border-border"
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
                      className="w-8 h-8 rounded-full bg-background/90 backdrop-blur-md text-foreground flex items-center justify-center hover:bg-background shadow-xs border border-border/60 transition-transform active:scale-90 cursor-pointer"
                      title="Copy Public Link"
                    >
                      {copiedId === product.id ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">
                      {product.category_name || "Code Asset"}
                    </span>
                    {product.status === "limited" && product.stock_limit && (
                      <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        {product.stock_limit} left
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-foreground text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>

                  {/* Velocity Stats */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mb-4 mt-auto pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="tabular-nums font-bold">
                        {product.sales_count || 0} sales
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-foreground">
                      <Eye className="w-3.5 h-3.5 text-accent" />
                      <span className="tabular-nums font-bold">
                        {product.view_count || 0} views
                      </span>
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="font-black text-foreground text-base tabular-nums">
                      {product.price_paise === 0 ? (
                        <span className="text-success">Free</span>
                      ) : (
                        `₹${(product.price_paise / 100).toLocaleString()}`
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/products/${product.id}`} target="_blank">
                        <button
                          type="button"
                          className="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:bg-secondary/80 hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                          title="View on marketplace"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <Link href={`/seller/products/${product.id}/edit`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg border-border text-foreground hover:bg-primary hover:text-white font-bold px-3 text-xs transition-colors cursor-pointer"
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
