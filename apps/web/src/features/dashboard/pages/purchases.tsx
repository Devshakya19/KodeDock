import { getServerUser } from "@/shared/lib/auth";
import { serverApiGet } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, ExternalLink, Package, ArrowLeft, Search, ArrowUpRight, Calendar, GitBranch, DownloadCloud } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

export default async function PurchasesPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const res = await serverApiGet<any[]>(`/orders?buyer_id=${user.id}`);
  const orders = (res.success && res.data) ? res.data : [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">My Purchases</h1>
            <p className="text-slate-500 mt-2 text-base font-medium">Access your purchased products and repositories.</p>
          </div>
          {orders.length > 0 && (
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search purchases..."
                className="pl-10 pr-4 h-11 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all w-full md:w-64"
              />
            </div>
          )}
        </div>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">No purchases yet</h3>
          <p className="text-slate-500 text-base max-w-md mx-auto mb-8 font-medium">
            You haven&apos;t bought anything yet. Explore our marketplace to find high-quality, production-ready code assets.
          </p>
          <Link href="/browse" className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-8 text-base font-bold text-white transition-colors hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:-translate-y-0.5">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm shadow-slate-100 hover:shadow-md hover:border-slate-300 transition-all p-6 group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Left side: Icon + Details */}
                <div className="flex items-start md:items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <Package className="w-7 h-7 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  
                  <div>
                    <Link href={`/orders/${order.id}`} className="hover:underline decoration-2 underline-offset-4 decoration-blue-500">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {order.product?.title || "Digital Product"}
                      </h3>
                    </Link>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
                      <Badge
                        variant="secondary"
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                          order.status === "completed"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                            : order.status === "refunded"
                            ? "bg-red-50 text-red-600 border-red-100/50"
                            : "bg-slate-50 text-slate-600 border-slate-100"
                        }`}
                      >
                        {order.status}
                      </Badge>
                      
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(order.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      
                      <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                      
                      <span className="text-sm font-medium text-slate-500">
                        by <span className="text-slate-700 font-semibold">{order.seller?.full_name || "Seller"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Price & Action */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                  <div className="text-xl font-black text-slate-900 mb-2">
                    ₹{(order.amount_paise / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  
                  {order.github_repo_url ? (
                    <a
                      href={order.github_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      <GitBranch className="w-4 h-4" /> Access Repository
                    </a>
                  ) : (
                    <Link 
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors"
                    >
                      View Details <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
