"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Copy,
  Check,
  ArrowUpRight,
  TrendingUp,
  Download
} from "lucide-react";
import { apiGet } from "@/shared/lib/api";

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
      // Fetch seller orders and seller products to match product titles if needed
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

  // Live auto-refresh polling
  useEffect(() => {
    const timer = setInterval(() => fetchOrders(), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchOrders]);

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Stats calculation
  const completedOrders = orders.filter((o) => o.status === "completed");
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const totalRevenuePaise = completedOrders.reduce(
    (acc, o) => acc + (o.seller_amount_paise || 0),
    0
  );
  const successRate =
    orders.length > 0
      ? Math.round((completedOrders.length / orders.length) * 100)
      : 100;

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const title = order.product?.title || "";
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Header & Live Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
            <ShoppingCart className="w-3.5 h-3.5" />
            Sales History
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Orders
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Realtime record of product sales and completed transactions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-[11px] text-slate-400">
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl px-3 py-2 shadow-sm transition-all hover:bg-slate-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live
            </span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[13px] text-slate-500 font-medium">Total Orders</span>
            <ShoppingCart className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-[26px] font-bold text-slate-900 leading-none">
            {orders.length}
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[13px] text-slate-500 font-medium">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-[26px] font-bold text-slate-900 leading-none">
            {completedOrders.length}
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[13px] text-slate-500 font-medium">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-[26px] font-bold text-slate-900 leading-none">
            ₹{(totalRevenuePaise / 100).toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[13px] text-slate-500 font-medium">Fulfillment Rate</span>
            <ArrowUpRight className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-[26px] font-bold text-slate-900 leading-none">
            {successRate}%
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 self-start">
            {[
              { id: "all", label: "All Orders", count: orders.length },
              { id: "completed", label: "Completed", count: completedOrders.length },
              { id: "pending", label: "Pending", count: pendingOrders.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Your store has no completed orders in this view yet."}
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
                  className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  {/* Left: Product Info & Order ID */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {order.product?.image_url ? (
                        <img
                          src={order.product.image_url}
                          alt=""
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {order.product?.title || "Digital Product"}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <button
                          onClick={() => copyToClipboard(order.id)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-600 transition-colors"
                          title="Copy Order ID"
                        >
                          <span>#{order.id.slice(0, 8)}</span>
                          {copiedId === order.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Status Badge */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-base font-extrabold text-slate-900">
                        {isFree ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            <Download className="w-3 h-3" /> Free Download
                          </span>
                        ) : (
                          `₹${(order.seller_amount_paise / 100).toLocaleString()}`
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Seller Payout
                      </span>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${
                          order.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            : order.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200/60"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {order.status === "completed" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
  );
}
