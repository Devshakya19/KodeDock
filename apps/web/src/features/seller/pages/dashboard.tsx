import { getServerUser, serverApiGet } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  CheckSquare, 
  Download, 
  DollarSign, 
  Star,
  Activity,
  Wallet,
  ArrowUpRight
} from "lucide-react";
import { getUserRole, ROLES } from "@/shared/lib/roles";
import { SalesChart } from "../components/sales-chart";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SellerProduct {
  id: string;
  title: string;
  price_paise: number;
  sales_count: number;
  view_count: number;
  status: string;
}

interface Order {
  id: string;
  product_id: string;
  seller_amount_paise: number;
  created_at: string;
}

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const role = getUserRole(user);
  if (role !== ROLES.DEVELOPER) redirect("/browse");

  const defaultStats = { total_products: 0, active_products: 0, total_sales: 0, total_revenue_paise: 0, total_earned_paise: 0 };
  
  const [statsRes, productsRes, ordersRes] = await Promise.all([
    serverApiGet<any>("/seller/stats"),
    serverApiGet<SellerProduct[]>("/seller/products"),
    serverApiGet<Order[]>("/orders?status=completed")
  ]);

  const stats = statsRes.success ? statsRes.data : defaultStats;
  const products = productsRes.success ? productsRes.data || [] : [];
  const orders = ordersRes.success ? ordersRes.data || [] : [];
  
  const topProducts = [...products].sort((a, b) => b.sales_count - a.sales_count).slice(0, 4);

  // --- Real Recent Activities Logic ---
  // Take top 5 recent orders
  const recentActivities = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  const getTimeAgo = (dateStr: string) => {
    const diffHours = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#F8FAFC] min-h-screen font-sans">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome, {user.full_name?.split(' ')[0] || "Seller"}!
        </h1>
        <p className="text-slate-500 mt-1 text-[15px]">
          Developer code marketplace today
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[14px] text-slate-600 font-medium">Active Projects</span>
            <CheckSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">
            {stats.active_products}
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[14px] text-slate-600 font-medium">Total Sales</span>
            <Download className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">
            {stats.total_sales}
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[14px] text-slate-600 font-medium">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">
            ₹{(stats.total_revenue_paise / 100).toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[14px] text-slate-600 font-medium">Net Earnings</span>
            <Star className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">
            ₹{(stats.total_earned_paise / 100).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Line Chart & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          <SalesChart orders={orders} />

          {/* Recent Activities (REAL) */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
            <h2 className="text-[18px] font-bold text-slate-900 mb-6">Recent Activities</h2>
            
            <div className="space-y-6">
              {recentActivities.map(order => {
                const product = products.find(p => p.id === order.product_id);
                return (
                  <div key={order.id} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Wallet className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-slate-900">
                        Sale: {product?.title || "Product"}
                      </p>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        {order.seller_amount_paise === 0 ? "Free download" : `₹${(order.seller_amount_paise / 100).toLocaleString()} earned`} • {getTimeAgo(order.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {recentActivities.length === 0 && (
                 <div className="text-center text-slate-500 text-sm py-4">
                   No recent sales activity to show.
                 </div>
              )}
            </div>
            
            {recentActivities.length > 0 && (
              <Link href="/seller/orders">
                <button className="w-full mt-6 py-2.5 rounded-xl bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors">
                  View All Activity
                </button>
              </Link>
            )}
          </div>
          
        </div>

        {/* Right Column: Top Performing Listings (REAL) */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-bold text-slate-900">Top Performing</h2>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl text-center text-sm text-slate-500">
                  No products listed yet.
                </div>
              ) : (
                topProducts.map(product => (
                  <Link href={`/seller/products/${product.id}/edit`} key={product.id}>
                    <div className="group p-3 -mx-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-4 cursor-pointer">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/60 overflow-hidden flex-shrink-0">
                        <span className="font-bold text-slate-400 text-[20px]">
                          {product.title.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14px] font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {product.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-[12px] text-slate-500 font-medium">
                          <span>{product.sales_count} sales</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{product.view_count} views</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <Link href="/seller/products">
              <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-[14px] font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                Manage Inventory
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
}
