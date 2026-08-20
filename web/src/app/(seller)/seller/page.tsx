import { getServerUser, serverApiGet } from "@/shared/lib/auth/client";
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
import { getUserRole, ROLES } from "@/shared/lib/auth/roles";
import { SalesChart } from "./components/sales-chart";
import { SellerHeader } from "./components/seller-header";
import { SellerStatsDeck } from "./components/seller-stats-deck";
import { AnimatedNumber } from "@/shared/ui/animated-number";

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
    <div className="w-full font-sans min-h-[100dvh] pb-24">
      {/* 1. Header with Actions */}
      <SellerHeader
        badge="Creator Studio"
        title={`Welcome back, ${sellerFirstName}.`}
        description="Monitor your code assets, track customer orders, and manage financial payouts in real-time."
        actions={
          <div className="flex items-center gap-4">
            <Link href="/browse">
              <button
                type="button"
                className="group h-12 px-6 rounded-full bg-background border border-border text-foreground text-xs font-black uppercase tracking-wider hover:bg-secondary transition-all flex items-center gap-2 shadow-sm hover:border-border cursor-pointer active:scale-[0.98]"
              >
                <Store className="w-4 h-4 text-muted-foreground group-hover:text-slate-900 transition-colors" />
                Storefront
              </button>
            </Link>
            <Link href="/seller/products/new">
              <button
                type="button"
                className="group h-12 pl-6 pr-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-4 shadow-lg shadow-slate-950/20 active:scale-[0.98] cursor-pointer"
              >
                <span>New Product</span>
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 group-hover:bg-white group-hover:text-slate-950">
                  <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
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
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column (Span 8): Performance Velocity Chart & Recent Sales Activity */}
        <div className="xl:col-span-8 space-y-8">
          {/* Main Analytics Spline */}
          <SalesChart orders={orders} />

          {/* Recent Live Sales Stream (Double-Bezel) */}
          <div className="rounded-[2rem] bg-background p-2 ring-1 ring-border/60 shadow-sm">
            <div className="rounded-[calc(2rem-0.5rem)] bg-gradient-to-b from-white to-slate-50/40 p-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-foreground tracking-tight">
                    Recent Activity
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium mt-1">
                    Real-time live feed of customer purchases
                  </p>
                </div>
                <Link href="/seller/orders">
                  <span className="group text-[11px] font-black uppercase tracking-widest text-foreground bg-secondary hover:bg-slate-200 px-4 py-2 rounded-full transition-colors flex items-center gap-2">
                    All Orders <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
                      className="group p-2 rounded-2xl bg-background border border-border hover:border-border hover:shadow-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center justify-between gap-4 pr-6 cursor-default"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-secondary/50 border border-border flex items-center justify-center flex-shrink-0 text-muted-foreground group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-foreground truncate group-hover:text-blue-600 transition-colors">
                            {product?.title || "Digital Product Asset"}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-semibold">
                            <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                              #{order.id.slice(0, 8)}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{getTimeAgo(order.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div
                          className={`text-lg font-black tracking-tight tabular-nums ${
                            isFree ? "text-success" : "text-foreground"
                          }`}
                        >
                          {isFree ? "Free" : `+₹${(order.seller_amount_paise / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-success bg-success/10 px-2 py-1 rounded-md mt-1 border border-emerald-200/50">
                          <CheckCircle2 className="w-3 h-3" /> Fulfilled
                        </span>
                      </div>
                    </div>
                  );
                })}

                {recentActivities.length === 0 && (
                  <div className="py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-border">
                    <Package className="w-10 h-10 text-muted-foreground/80 mx-auto mb-3" />
                    <p className="text-base font-bold text-foreground">No recent sales yet</p>
                    <p className="text-sm font-medium text-muted-foreground mt-1 max-w-sm mx-auto">
                      Your customer purchases and real-time fulfillments will appear here once you make a sale.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Span 4): Wallet Hub, Top Products */}
        <div className="xl:col-span-4 space-y-8">
          {/* 1. Wallet Hub (Ethereal Glass Design) */}
          <div className="rounded-[2rem] bg-[#050505] p-2 ring-1 ring-slate-900 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-700" />
            
            <div className="rounded-[calc(2rem-0.5rem)] bg-gradient-to-br from-white/5 to-white/[0.02] p-8 text-primary-foreground relative z-10 border border-border/10 backdrop-blur-2xl">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/50">
                      Total Balance
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> Secured
                    </span>
                  </div>

                  <div className="text-5xl sm:text-6xl font-black tracking-tighter mb-8 tabular-nums">
                    <AnimatedNumber value={(wallet?.balance_paise ?? 0) / 100} prefix="₹" decimals={2} duration={2} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-amber-400" /> Escrow
                      </p>
                      <p className="font-bold text-primary-foreground text-lg mt-1.5 tabular-nums tracking-tight">
                        <AnimatedNumber value={(wallet?.pending_paise ?? 0) / 100} prefix="₹" duration={2} />
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-emerald-400" /> Earned
                      </p>
                      <p className="font-bold text-primary-foreground text-lg mt-1.5 tabular-nums tracking-tight">
                        <AnimatedNumber value={(wallet?.total_earned_paise ?? 0) / 100} prefix="₹" duration={2} />
                      </p>
                    </div>
                  </div>
                </div>

                <Link href="/seller/wallet">
                  <button
                    type="button"
                    className="w-full h-12 rounded-xl bg-background text-foreground text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <span>Payouts</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* 2. Top Performing Assets (Double-Bezel) */}
          <div className="rounded-[2rem] bg-background p-2 ring-1 ring-border/60 shadow-sm">
            <div className="rounded-[calc(2rem-0.5rem)] bg-slate-50/50 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-foreground tracking-tight">
                    Top Assets
                  </h3>
                </div>
                <Link href="/seller/products">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                    View All
                  </span>
                </Link>
              </div>

              <div className="space-y-4">
                {topProducts.length === 0 ? (
                  <div className="p-8 bg-background rounded-2xl text-center text-sm font-semibold text-muted-foreground border border-dashed border-border shadow-sm">
                    No products listed yet.
                  </div>
                ) : (
                  topProducts.map((product, rank) => {
                    const salesShare = Math.round(((product.sales_count || 0) / maxProductSales) * 100);

                    return (
                      <Link href={`/seller/products/${product.id}/edit`} key={product.id}>
                        <div className="group relative">
                          <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-background hover:shadow-md border border-transparent hover:border-slate-200 transition-all duration-300 cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-slate-200 border border-border/80 flex items-center justify-center flex-shrink-0 overflow-hidden relative font-black text-muted-foreground">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                />
                              ) : (
                                <span className="text-sm">#{rank + 1}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-foreground truncate group-hover:text-blue-600 transition-colors">
                                {product.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                                <span className="text-foreground tabular-nums">
                                  {product.sales_count} sales
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="tabular-nums">{product.view_count} views</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 pl-4 border-l border-border/80">
                              <span className="text-sm font-black text-foreground tabular-nums">
                                {product.price_paise === 0
                                  ? "Free"
                                  : `₹${(product.price_paise / 100).toLocaleString()}`}
                              </span>
                            </div>
                          </div>

                          {/* Minimal Progress Line underneath the item when hovered */}
                          <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-secondary rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div
                              className="h-full rounded-full bg-accent transition-all duration-1000 ease-out"
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
        </div>
      </div>
    </div>
  );
}
