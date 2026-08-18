import { getServerUser, serverApiGet } from "@/lib/auth/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Activity,
  Wallet,
  ArrowUpRight,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Store,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  BarChart2,
  BookOpen,
} from "lucide-react";
import { getUserRole, ROLES } from "@/lib/auth/roles";
import { SalesChart } from "./components/sales-chart";
import { SellerHeader } from "./components/seller-header";
import { SellerStatsDeck } from "./components/seller-stats-deck";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SellerProduct {
  id: string;
  title: string;
  price_paise: number;
  sales_count: number;
  view_count: number;
  status: string;
  image_url?: string | null;
  category_name?: string | null;
}

interface Order {
  id: string;
  product_id: string;
  seller_amount_paise: number;
  created_at: string;
}

interface WalletData {
  balance_paise: number;
  pending_paise: number;
  total_earned_paise: number;
}

export default async function SellerDashboardPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const role = getUserRole(user);
  if (role !== ROLES.DEVELOPER) redirect("/browse");

  const defaultStats = {
    total_products: 0,
    active_products: 0,
    total_sales: 0,
    total_revenue_paise: 0,
    total_earned_paise: 0,
    total_views: 0,
  };

  const [statsRes, productsRes, ordersRes, walletRes] = await Promise.all([
    serverApiGet<any>("/seller/stats"),
    serverApiGet<SellerProduct[]>("/seller/products"),
    serverApiGet<Order[]>("/orders?status=completed"),
    serverApiGet<WalletData>("/wallet"),
  ]);

  const stats = statsRes.success ? statsRes.data : defaultStats;
  const products = productsRes.success ? productsRes.data || [] : [];
  const orders = ordersRes.success ? ordersRes.data || [] : [];
  const wallet = walletRes.success ? walletRes.data : null;

  const topProducts = [...products]
    .sort((a, b) => b.sales_count - a.sales_count)
    .slice(0, 5);

  const maxProductSales = Math.max(...products.map((p) => p.sales_count || 0), 1);

  const recentActivities = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getTimeAgo = (dateStr: string) => {
    const diffHours = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const sellerFirstName = user.full_name?.split(" ")[0] || "Creator";

  return (
    <div className="w-full font-sans min-h-screen">
      {/* 1. Header with Actions */}
      <SellerHeader
        badge="Creator Studio"
        title={`Welcome back, ${sellerFirstName}!`}
        description="Monitor your code assets, track customer orders, and manage financial payouts."
        actions={
          <div className="flex items-center gap-3">
            <Link href="/browse">
              <button
                type="button"
                className="h-11 px-4 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-2xs hover:border-slate-300 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-slate-500" />
                Storefront
              </button>
            </Link>
            <Link href="/seller/products/new">
              <button
                type="button"
                className="group h-11 pl-5 pr-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-3 shadow-md shadow-slate-950/20 active:scale-[0.98] cursor-pointer"
              >
                <span>New Product</span>
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
              </button>
            </Link>
          </div>
        }
      />

      {/* 2. Top Double-Bezel Metrics Deck */}
      <SellerStatsDeck
        activeProducts={stats.active_products ?? products.filter((p) => p.status === "active").length}
        totalSales={stats.total_sales ?? orders.length}
        totalRevenuePaise={stats.total_revenue_paise ?? 0}
        totalEarnedPaise={stats.total_earned_paise ?? 0}
        totalViews={stats.total_views ?? 0}
      />

      {/* 3. Asymmetrical Bento Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Performance Velocity Chart & Recent Sales Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Analytics Spline */}
          <SalesChart orders={orders} />

          {/* Recent Live Sales Stream */}
          <div className="rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs">
            <div className="rounded-[22px] bg-gradient-to-b from-white to-slate-50/40 p-6 sm:p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Recent Sales Activity
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Real-time live feed of customer purchases & deliveries
                  </p>
                </div>
                <Link href="/seller/orders">
                  <span className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                    All Orders <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>

              <div className="space-y-3">
                {recentActivities.map((order) => {
                  const product = products.find((p) => p.id === order.product_id);
                  const isFree = order.seller_amount_paise === 0;

                  return (
                    <div
                      key={order.id}
                      className="group p-4 rounded-2xl bg-white border border-slate-200/60 hover:border-slate-300 hover:shadow-2xs transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-blue-50/80 border border-blue-100/80 flex items-center justify-center flex-shrink-0 text-blue-600">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {product?.title || "Digital Product Asset"}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                            <span className="font-mono text-[11px] text-slate-400 font-semibold">
                              #{order.id.slice(0, 8)}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{getTimeAgo(order.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div
                          className={`text-sm font-black tracking-tight tabular-nums ${
                            isFree ? "text-emerald-600" : "text-slate-950"
                          }`}
                        >
                          {isFree ? "Free" : `+₹${(order.seller_amount_paise / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5 border border-emerald-200/50">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Fulfilled
                        </span>
                      </div>
                    </div>
                  );
                })}

                {recentActivities.length === 0 && (
                  <div className="py-12 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">No recent customer sales</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Your customer purchases and downloads will stream here live.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Wallet Hub, Top Products, Creator Tip */}
        <div className="space-y-6">
          {/* 1. Wallet Quick-Deck */}
          <div className="rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs">
            <div className="rounded-[22px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-7 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Wallet className="w-36 h-36 -rotate-12 translate-x-8 -translate-y-8" />
              </div>

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black tracking-[0.18em] uppercase text-slate-400">
                      Creator Balance
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> Escrow Protected
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-black tracking-tight mb-5 tabular-nums">
                    ₹
                    {((wallet?.balance_paise ?? 0) / 100).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 mb-6 text-xs backdrop-blur-xs">
                    <div>
                      <p className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> In Escrow
                      </p>
                      <p className="font-bold text-white mt-0.5 tabular-nums">
                        ₹{((wallet?.pending_paise ?? 0) / 100).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" /> Total Earned
                      </p>
                      <p className="font-bold text-white mt-0.5 tabular-nums">
                        ₹{((wallet?.total_earned_paise ?? 0) / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <Link href="/seller/wallet">
                  <button
                    type="button"
                    className="w-full py-3 rounded-xl bg-white text-slate-950 text-xs font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-[0.98]"
                  >
                    <span>Manage Wallet & Payouts</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* 2. Top Performing Assets */}
          <div className="rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs">
            <div className="rounded-[22px] bg-gradient-to-b from-white to-slate-50/40 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Top Assets
                  </h3>
                </div>
                <Link href="/seller/products">
                  <span className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                    View All
                  </span>
                </Link>
              </div>

              <div className="space-y-3">
                {topProducts.length === 0 ? (
                  <div className="p-6 bg-slate-50/60 rounded-2xl text-center text-xs font-medium text-slate-500 border border-dashed border-slate-200">
                    No products listed yet.
                  </div>
                ) : (
                  topProducts.map((product, rank) => {
                    const salesShare = Math.round(((product.sales_count || 0) / maxProductSales) * 100);

                    return (
                      <Link href={`/seller/products/${product.id}/edit`} key={product.id}>
                        <div className="group p-3 rounded-2xl bg-white border border-slate-200/60 hover:border-slate-300 hover:shadow-2xs transition-all flex flex-col gap-2 cursor-pointer mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center flex-shrink-0 overflow-hidden relative font-black text-slate-400">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <span className="text-xs">#{rank + 1}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                {product.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-semibold">
                                <span className="text-slate-900 tabular-nums">
                                  {product.sales_count} sales
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="tabular-nums">{product.view_count} views</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-xs font-black text-slate-900 tabular-nums">
                                {product.price_paise === 0
                                  ? "Free"
                                  : `₹${(product.price_paise / 100).toLocaleString()}`}
                              </span>
                            </div>
                          </div>

                          {/* Velocity Progress Bar */}
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all duration-500"
                              style={{ width: `${salesShare}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 3. Creator Playbook Card */}
          <div className="rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs">
            <div className="rounded-[22px] bg-gradient-to-br from-blue-50/60 to-indigo-50/50 p-5 border border-blue-100/60">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs shadow-blue-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                    Creator Tip
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                    Link a GitHub repository to enable automatic repository cloning for buyers upon checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
