import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Users, 
  ShoppingBag, 
  Wallet, 
  ShieldAlert, 
  TrendingUp, 
  ArrowUpRight,
  Activity
} from "lucide-react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";

// Removed mock chartData

function MetricCard({ title, value, icon: Icon, trend, subtitle }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        </div>
        {trend && (
          <span className="flex items-center text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-black text-foreground tracking-tight tabular-nums">{value}</h3>
        <p className="text-sm font-semibold text-muted-foreground mt-1">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: statsRes } = useQuery({
    queryKey: ['hq-stats'],
    queryFn: async () => await api.get("/api/hq/stats")
  });
  
  // Fetch latest 5 audit logs for the activity feed
  const { data: auditRes } = useQuery({
    queryKey: ['hq-audit-recent'],
    queryFn: async () => await api.get("/api/hq/audit")
  });
  
  // Wait for data or fallback safely
  const stats = statsRes?.data?.data || { 
    total_revenue_paise: 0, 
    active_sellers: 0, 
    products_pending: 0,
    active_disputes: 0,
    revenue_chart: []
  };
  
  const recentActivity = (auditRes?.data?.data || []).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
        <p className="text-muted-foreground mt-1 font-medium">Real-time pulse of the KodeDock marketplace.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue (Platform)" 
          value={`₹${(Number(stats.total_revenue_paise) / 100).toLocaleString()}`} 
          icon={Wallet}
          trend="+12.5%"
          subtitle="All time marketplace GMV"
        />
        <MetricCard 
          title="Pending Products" 
          value={Number(stats.products_pending || 0).toLocaleString()} 
          icon={ShoppingBag}
          subtitle="Awaiting moderation"
        />
        <MetricCard 
          title="Active Sellers" 
          value={Number(stats.active_sellers || 0).toLocaleString()} 
          icon={Users}
        />
        <MetricCard 
          title="Active Disputes" 
          value={Number(stats.active_disputes || 0).toLocaleString()} 
          icon={ShieldAlert}
          subtitle="Requires immediate attention"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-foreground">Revenue Velocity</h3>
              <p className="text-sm text-muted-foreground font-medium">Gross merchandise volume over last 7 days</p>
            </div>
            <select className="bg-secondary text-foreground text-xs font-bold px-3 py-1.5 rounded-md border-none outline-none cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenue_chart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderRadius: '12px',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> System Activity
            </h3>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          
          <div className="space-y-6 flex-1">
            {recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex gap-4 group cursor-pointer">
                <div className="relative mt-1">
                  <div className="w-2 h-2 bg-border rounded-full group-hover:bg-primary transition-colors z-10 relative"></div>
                  <div className="absolute top-3 left-1 w-[1px] h-12 bg-border/50 group-hover:bg-primary/20 transition-colors"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors capitalize">{activity.action.replace(/_/g, ' ')}</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">{activity.entity_type} • {new Date(activity.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-2 bg-secondary text-foreground text-xs font-bold rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-1">
            View Full Audit Log <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
