import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  ShoppingBag, Package, ArrowRight, Wallet, 
  CreditCard, Search, ArrowUpRight, Clock, 
  Sparkles, CheckCircle2, ChevronRight, HelpCircle
} from "lucide-react";
import { getServerUser, serverApiGet } from "@/shared/lib/auth/client";
import { WalletCard } from "./components/wallet-card";

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const [ordersRes, walletRes] = await Promise.all([
    serverApiGet<any[]>(`/orders?buyer_id=${user.id}`),
    serverApiGet<{ balance_paise: number }>("/wallet"),
  ]);

  const orders = (ordersRes.success && ordersRes.data) ? ordersRes.data : [];
  const walletBalance = (walletRes.success && walletRes.data) ? walletRes.data.balance_paise : null;

  const totalSpent = orders.reduce((sum: number, o: any) => sum + o.amount_paise, 0);
  const completedOrders = orders.filter((o: any) => o.status === "completed").length;

  return (
    <div className="w-full space-y-8 pb-12 pt-2 md:pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-2">
            Welcome back, {user.full_name?.split(" ")[0] || "Buyer"}.
          </h1>
          <p className="text-muted-foreground font-medium text-lg">Here's your activity overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/browse" className="h-12 px-7 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2.5 hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-foreground/10 active:scale-95">
            <Search className="w-4.5 h-4.5" /> Explore Marketplace
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Purchases */}
        <div className="bg-background rounded-[24px] p-6 border border-border/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:border-border transition-colors group flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-secondary/50 text-foreground flex items-center justify-center border border-border group-hover:bg-secondary transition-colors">
              <ShoppingBag className="w-5.5 h-5.5" />
            </div>
            <Link href="/dashboard/purchases" className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <div>
            <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Purchases</p>
            <p className="text-3xl font-black text-foreground">{completedOrders}</p>
          </div>
        </div>

        {/* Amount Spent */}
        <div className="bg-background rounded-[24px] p-6 border border-border/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:border-border transition-colors group flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center border border-success/20 group-hover:bg-success/20 transition-colors">
              <CreditCard className="w-5.5 h-5.5" />
            </div>
          </div>
          <div>
            <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Amount Spent</p>
            <p className="text-3xl font-black text-foreground tracking-tight">₹{(totalSpent / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Wallet Balance */}
        <WalletCard initialBalance={walletBalance} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-background rounded-[24px] border border-border/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/40 flex items-center justify-between bg-secondary/30">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-muted-foreground" /> Recent Purchases
            </h2>
            {orders.length > 0 && (
              <Link href="/dashboard/purchases" className="text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                View all
              </Link>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <Package className="w-8 h-8 text-muted-foreground/80" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No purchases yet</h3>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto mb-8">You haven't bought anything yet. Explore the marketplace to find awesome digital products.</p>
              <Link href="/browse" className="h-12 px-7 rounded-full bg-secondary text-foreground font-bold text-sm flex items-center gap-2 hover:bg-secondary/80 transition-colors">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/40 flex-1">
              {orders.slice(0, 5).map((order: any) => (
                <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors group">
                  <div className="flex items-center gap-4.5">
                    <div className="w-12 h-12 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center group-hover:border-foreground/20 transition-colors shrink-0">
                      <Package className="w-5.5 h-5.5 text-muted-foreground group-hover:text-foreground/80 transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-[15px] group-hover:text-accent transition-colors">{order.product?.title || "Digital Product"}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle2 className={`w-4 h-4 ${order.status === 'completed' ? 'text-success' : 'text-muted-foreground'}`} />
                        <span className="text-[13px] font-semibold text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="hidden sm:block">
                      <div className="font-black text-foreground text-[15px]">₹{(order.amount_paise / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      <div className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${order.status === 'completed' ? 'text-success' : 'text-warning'}`}>
                        {order.status}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/80 group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          
          {/* Seller Banner */}
          <Link href="/seller" className="block group h-full">
            <div className="bg-accent/5 dark:bg-accent/10 rounded-[24px] p-7 border border-accent/20 relative overflow-hidden transition-all hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 h-full">
              <div className="absolute top-0 right-0 p-4 opacity-40 mix-blend-multiply dark:mix-blend-plus-lighter">
                <Sparkles className="w-24 h-24 text-accent/30 -rotate-12 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-background text-accent flex items-center justify-center shadow-sm mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-5.5 h-5.5" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">Become a Seller</h3>
                <p className="text-sm font-medium text-muted-foreground mb-6 leading-relaxed">
                  Turn your code into cash. Start selling templates, plugins, and UI kits to our global community.
                </p>
                <div className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-bold text-primary-foreground transition-colors hover:brightness-110 shadow-sm shadow-accent/20">
                  Setup Store <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>
          </Link>

          {/* Help Center */}
          <Link href="/contact" className="block group">
            <div className="bg-background rounded-[24px] p-6 border border-border/60 flex items-center gap-5 hover:border-border transition-all hover:shadow-sm">
              <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center border border-border shrink-0 group-hover:bg-secondary transition-colors">
                <HelpCircle className="w-5.5 h-5.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-0.5">Need help?</h4>
                <p className="text-[13px] font-medium text-muted-foreground">Contact our support team</p>
              </div>
            </div>
          </Link>
          
        </div>
      </div>
    </div>
  );
}
