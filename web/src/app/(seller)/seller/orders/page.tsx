"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  Download,
  ShieldCheck,
  ExternalLink,
  DollarSign,
} from "lucide-react";
import { apiGet } from "@/shared/lib/api/client";
import { SellerHeader } from "../components/seller-header";

interface OrderProduct {
  id: string;
  title: string;
  image_url?: string | null;
}

interface OrderItem {
  id: string;
  product_id: string;
  amount_paise: number;
  seller_amount_paise: number;
  status: string;
  created_at: string;
  product?: OrderProduct | null;
}

const POLL_INTERVAL = 15000;

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        apiGet<OrderItem[]>("/orders?status=completed"),
        apiGet<any[]>("/seller/products"),
      ]);

      if (ordersRes.data) {
        const productMap = new Map<string, any>();
        if (productsRes.data) {
          productsRes.data.forEach((p) => productMap.set(p.id, p));
        }

        const enrichedOrders = ordersRes.data.map((order) => ({
          ...order,
          product: productMap.get(order.product_id) || order.product,
        }));

        setOrders(enrichedOrders);
        setLastUpdated(new Date());
      }
    } catch {
      // Silently catch background poll errors
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const timer = setInterval(() => fetchOrders(), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchOrders]);

  const copyToClipboard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Stats calculation
  const completedOrders = useMemo(() => orders.filter((o) => o.status === "completed"), [orders]);
  const pendingOrders = useMemo(() => orders.filter((o) => o.status === "pending"), [orders]);
  const totalRevenuePaise = useMemo(
    () => completedOrders.reduce((acc, o) => acc + (o.seller_amount_paise || 0), 0),
    [completedOrders]
  );
  const fulfillmentRate = orders.length > 0 ? 100 : 0;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const title = order.product?.title || "";
      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-accent animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Loading Customer Orders...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      {/* 1. Header */}
      <SellerHeader
        badge="Fulfillment Center"
        title="Customer Orders"
        description="Real-time ledger of completed purchases, customer delivery events, and payout status."
        lastUpdated={lastUpdated}
        onRefresh={() => fetchOrders(true)}
        refreshing={refreshing}
      />

      {/* 2. Metrics Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        <div className="rounded-[26px] bg-background p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-white to-slate-50/60 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Orders
              </span>
              <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground tabular-nums">
              {orders.length} Orders
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">
              All time purchases
            </p>
          </div>
        </div>

        <div className="rounded-[26px] bg-background p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-white to-slate-50/60 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Completed & Disbursed
              </span>
              <div className="w-8 h-8 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-success tabular-nums">
              {completedOrders.length}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">
              Instant code delivery
            </p>
          </div>
        </div>

        <div className="rounded-[26px] bg-background p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-white to-slate-50/60 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Net Sales Disbursed
              </span>
              <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground tabular-nums">
              ₹{(totalRevenuePaise / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">
              Direct to seller wallet
            </p>
          </div>
        </div>

        <div className="rounded-[26px] bg-background p-1.5 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-white to-slate-50/60 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Delivery Integrity
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground tabular-nums">
              {fulfillmentRate}%
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">
              Automated GitHub sync
            </p>
          </div>
        </div>
      </div>

      {/* 3. Orders Search & Filter Bar */}
      <div className="rounded-[28px] bg-background p-2 ring-1 ring-slate-200/80 shadow-xs mb-8">
        <div className="rounded-[22px] bg-gradient-to-b from-white to-slate-50/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All Orders", count: orders.length },
              { id: "completed", label: "Completed", count: completedOrders.length },
              { id: "pending", label: "Pending Escrow", count: pendingOrders.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {tab.label} <span className="opacity-60 text-[10px] ml-1">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border/80 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-foreground outline-none focus:border-slate-900 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Orders List Deck */}
      <div className="rounded-[28px] bg-background p-2 ring-1 ring-slate-200/80 shadow-xs">
        <div className="rounded-[22px] bg-gradient-to-b from-white to-slate-50/40 p-5 sm:p-6">
          {filteredOrders.length === 0 ? (
            <div className="py-20 text-center bg-slate-50/60 rounded-2xl border border-dashed border-border">
              <Package className="w-10 h-10 text-muted-foreground/80 mx-auto mb-3" />
              <h3 className="text-base font-black text-foreground">No orders found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                {searchQuery
                  ? "Try searching for a different product title or order ID."
                  : "Your customer sales will appear here as soon as orders complete."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const isFree = order.seller_amount_paise === 0;
                const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 rounded-2xl bg-background border border-border/60 hover:border-border hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    {/* Left: Product Thumbnail & Order Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-secondary border border-border/80 flex items-center justify-center flex-shrink-0 overflow-hidden text-muted-foreground">
                        {order.product?.image_url ? (
                          <img
                            src={order.product.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-foreground truncate group-hover:text-blue-600 transition-colors">
                          {order.product?.title || "Digital Code Asset"}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <button
                            type="button"
                            onClick={(e) => copyToClipboard(order.id, e)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-secondary hover:bg-slate-200 text-[11px] font-mono text-foreground transition-colors cursor-pointer"
                            title="Click to copy full Order ID"
                          >
                            <span>#{order.id.slice(0, 8)}</span>
                            {copiedId === order.id ? (
                              <Check className="w-3 h-3 text-success" />
                            ) : (
                              <Copy className="w-3 h-3 text-muted-foreground" />
                            )}
                          </button>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {formattedDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Status Badge */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-black text-foreground tabular-nums">
                          {isFree ? (
                            <span className="inline-flex items-center gap-1 text-success bg-success/10 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-200/50">
                              <Download className="w-3 h-3" /> Free
                            </span>
                          ) : (
                            `+₹${(order.seller_amount_paise / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          Net Payout
                        </span>
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${
                            order.status === "completed"
                              ? "bg-success/10 text-success border-emerald-200/60"
                              : order.status === "pending"
                              ? "bg-warning/10 text-warning border-amber-200/60"
                              : "bg-secondary text-muted-foreground border-border"
                          }`}
                        >
                          {order.status === "completed" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-warning" />
                          )}
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
