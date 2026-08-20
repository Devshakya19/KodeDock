"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  DollarSign,
  ShoppingCart,
  Activity,
  Zap,
  Percent,
  ChevronDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Order {
  id: string;
  product_id: string;
  seller_amount_paise: number;
  created_at: string;
}

interface SalesChartProps {
  orders: Order[];
}

function TimeFilterSelect({ filter, setFilter }: { filter: string, setFilter: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const options = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "6m", label: "Last 6 Months" },
    { value: "1y", label: "Last Year" },
    { value: "custom", label: "Custom Range..." },
  ];

  const selectedLabel = options.find(o => o.value === filter)?.label || "Select";

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 bg-background border border-border text-xs font-bold text-foreground py-2.5 px-4 rounded-xl outline-none cursor-pointer hover:border-border hover:bg-secondary focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all min-w-[150px]"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          {selectedLabel}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilter(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                    filter === option.value
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background/95 backdrop-blur-md border border-border p-4 rounded-2xl shadow-xl min-w-[200px]"
      >
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          {data.fullDateStr || data.label}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground font-medium text-sm flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-muted-foreground" /> Revenue</span>
            <span className="text-foreground font-bold tabular-nums">
              ₹{data.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground font-medium text-sm flex items-center gap-1.5"><ShoppingCart className="w-4 h-4 text-muted-foreground" /> Sales</span>
            <span className="text-success font-bold tabular-nums">
              {data.sales}
            </span>
          </div>
          {data.sales > 0 && (
            <div className="flex items-center justify-between gap-4 pt-3 mt-3 border-t border-border">
              <span className="text-muted-foreground font-medium text-xs flex items-center gap-1.5"><Percent className="w-3.5 h-3.5" /> AOV</span>
              <span className="text-accent font-bold text-xs tabular-nums">
                ₹{Math.round(data.aov).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
  return null;
};
export function SalesChart({ orders }: SalesChartProps) {
  const [filter, setFilter] = useState("6m");
  const [metric, setMetric] = useState<"revenue" | "sales" | "aov">("revenue");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const router = useRouter();

  // Load saved filter state on mount
  useEffect(() => {
    const savedFilter = localStorage.getItem("kodedock_seller_chart_filter");
    if (savedFilter) setFilter(savedFilter);
    const savedStart = localStorage.getItem("kodedock_seller_chart_start");
    if (savedStart) setCustomStart(savedStart);
    const savedEnd = localStorage.getItem("kodedock_seller_chart_end");
    if (savedEnd) setCustomEnd(savedEnd);
  }, []);

  // Save filter state on change
  useEffect(() => {
    localStorage.setItem("kodedock_seller_chart_filter", filter);
    localStorage.setItem("kodedock_seller_chart_start", customStart);
    localStorage.setItem("kodedock_seller_chart_end", customEnd);
  }, [filter, customStart, customEnd]);

  // Auto-refresh the entire dashboard page every 15 seconds to stream live sales
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, 15000);
    return () => clearInterval(timer);
  }, [router]);

  // Dynamic Bucket Generation based on Time Filter
  const chartData = useMemo(() => {
    const now = new Date();
    let startTime = new Date();

    if (filter === "today") {
      startTime.setHours(0, 0, 0, 0);
    } else if (filter === "yesterday") {
      startTime.setDate(now.getDate() - 1);
      startTime.setHours(0, 0, 0, 0);
    } else if (filter === "7d") {
      startTime.setDate(now.getDate() - 7);
    } else if (filter === "30d") {
      startTime.setDate(now.getDate() - 30);
    } else if (filter === "90d") {
      startTime.setDate(now.getDate() - 90);
    } else if (filter === "6m") {
      startTime.setMonth(now.getMonth() - 6);
    } else if (filter === "1y") {
      startTime.setFullYear(now.getFullYear() - 1);
    } else if (filter === "custom" && customStart && customEnd) {
      startTime = new Date(customStart);
      now.setTime(new Date(customEnd).getTime());
    } else if (filter === "custom") {
      startTime.setDate(now.getDate() - 30);
    }

    const timeSpan = Math.max(now.getTime() - startTime.getTime(), 1000);
    const numBuckets = 7;
    const bucketDuration = timeSpan / (numBuckets - 1);

    const buckets = Array.from({ length: numBuckets }).map((_, i) => {
      const bucketTime = new Date(startTime.getTime() + i * bucketDuration);

      let label = "";
      let fullDateStr = "";
      if (timeSpan <= 2 * 24 * 60 * 60 * 1000) {
        label = bucketTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        fullDateStr = bucketTime.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (timeSpan <= 90 * 24 * 60 * 60 * 1000) {
        label = bucketTime.toLocaleDateString([], { month: "short", day: "numeric" });
        fullDateStr = bucketTime.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } else {
        label = bucketTime.toLocaleDateString([], { month: "short" });
        fullDateStr = bucketTime.toLocaleDateString([], { month: "long", year: "numeric" });
      }

      return {
        label,
        fullDateStr,
        time: bucketTime.getTime(),
        sales: 0,
        revenue: 0,
        aov: 0,
      };
    });

    // Assign completed orders to nearest time bucket
    orders.forEach((order) => {
      const orderTime = new Date(order.created_at).getTime();
      if (orderTime >= startTime.getTime() && orderTime <= now.getTime()) {
        let closestIdx = 0;
        let minDiff = Infinity;
        buckets.forEach((b, i) => {
          const diff = Math.abs(b.time - orderTime);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
          }
        });
        buckets[closestIdx].sales += 1;
        buckets[closestIdx].revenue += order.seller_amount_paise / 100;
      }
    });

    // Compute AOV per bucket
    buckets.forEach((b) => {
      b.aov = b.sales > 0 ? b.revenue / b.sales : 0;
    });

    return buckets;
  }, [orders, filter, customStart, customEnd]);

  // Aggregate totals
  const totalPeriodRevenue = useMemo(
    () => chartData.reduce((sum, b) => sum + b.revenue, 0),
    [chartData]
  );
  const totalPeriodSales = useMemo(
    () => chartData.reduce((sum, b) => sum + b.sales, 0),
    [chartData]
  );
  const periodAOV = useMemo(
    () => (totalPeriodSales > 0 ? totalPeriodRevenue / totalPeriodSales : 0),
    [totalPeriodRevenue, totalPeriodSales]
  );

  // Peak bucket
  const peakBucket = useMemo(() => {
    let max = chartData[0];
    chartData.forEach((b) => {
      const val = metric === "revenue" ? b.revenue : metric === "sales" ? b.sales : b.aov;
      const maxVal =
        metric === "revenue" ? max.revenue : metric === "sales" ? max.sales : max.aov;
      if (val > maxVal) max = b;
    });
    return max;
  }, [chartData, metric]);

  // Calculate momentum / run rate
  const momentumLabel = useMemo(() => {
    if (totalPeriodSales === 0) return { text: "AWAITING SALES", color: "text-muted-foreground bg-secondary border-border" };
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const rev2 = secondHalf.reduce((s, b) => s + b.revenue, 0);
    const rev1 = firstHalf.reduce((s, b) => s + b.revenue, 0);

    if (rev2 > rev1) {
      return { text: "ACCELERATING", color: "text-success bg-success/10 border-success/30" };
    }
    return { text: "STEADY VELOCITY", color: "text-accent bg-accent/10 border-accent/30" };
  }, [chartData, totalPeriodSales]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background/95 backdrop-blur-md border border-border p-4 rounded-2xl shadow-xl min-w-[200px]"
        >
          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            {data.fullDateStr || data.label}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground font-medium text-sm flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-muted-foreground" /> Revenue</span>
              <span className="text-foreground font-bold tabular-nums">
                ₹{data.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground font-medium text-sm flex items-center gap-1.5"><ShoppingCart className="w-4 h-4 text-muted-foreground" /> Sales</span>
              <span className="text-success font-bold tabular-nums">
                {data.sales}
              </span>
            </div>
            {data.sales > 0 && (
              <div className="flex items-center justify-between gap-4 pt-3 mt-3 border-t border-border">
                <span className="text-muted-foreground font-medium text-xs flex items-center gap-1.5"><Percent className="w-3.5 h-3.5" /> AOV</span>
                <span className="text-accent font-bold text-xs tabular-nums">
                  ₹{Math.round(data.aov).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  const chartColor = metric === "revenue" ? "#2563eb" : metric === "sales" ? "#10b981" : "#6366f1";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-background rounded-3xl p-6 sm:p-8 shadow-lg border border-border"
    >
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-accent" />
              Performance Velocity
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${momentumLabel.color}`}
            >
              {momentumLabel.text}
            </span>
          </div>

          <div className="flex items-end gap-3">
            <motion.h2 
              key={metric}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-black text-foreground tracking-tight tabular-nums"
            >
              {metric === "revenue"
                ? `₹${totalPeriodRevenue.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}`
                : metric === "sales"
                ? `${totalPeriodSales.toLocaleString()} Sales`
                : `₹${periodAOV.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}`}
            </motion.h2>
            <span className="text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
              {metric === "revenue"
                ? "gross revenue in window"
                : metric === "sales"
                ? "total completed orders"
                : "average order value"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Metric Segmented Control */}
          <div className="inline-flex p-1 rounded-xl bg-secondary/50 border border-border/60 relative">
            {(["revenue", "sales", "aov"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all z-10 ${
                  metric === m ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {metric === m && (
                  <motion.div
                    layoutId="active-metric-pill"
                    className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="flex items-center gap-1.5 capitalize">
                  {m === "revenue" ? <DollarSign className="w-3.5 h-3.5" /> : m === "sales" ? <ShoppingCart className="w-3.5 h-3.5" /> : <Percent className="w-3.5 h-3.5" />}
                  {m}
                </span>
              </button>
            ))}
          </div>

          {/* Time Filter Selector */}
          <TimeFilterSelect filter={filter} setFilter={setFilter} />
        </div>
      </div>

      {/* Custom date range row */}
      <AnimatePresence>
        {filter === "custom" && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 text-xs bg-secondary/50 p-4 rounded-2xl border border-border w-fit shadow-sm">
              <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">From</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 outline-none text-foreground font-semibold focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] ml-2">To</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 outline-none text-foreground font-semibold focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recharts Canvas */}
      <div className="h-[320px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
              dy={15} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              tickFormatter={(value) => {
                if (value === 0) return "0";
                if (metric === "sales") return value.toString();
                if (value >= 1000) return `₹${(value / 1000).toFixed(value % 1000 !== 0 ? 1 : 0)}k`;
                return `₹${value}`;
              }}
              dx={-10}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />
            <Area
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={chartColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorMetric)"
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Velocity Metrics Micro-Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-10 mt-6 border-t border-border">
        {[
          {
            label: "Peak Velocity",
            value: metric === "revenue"
              ? `₹${peakBucket.revenue.toLocaleString()}`
              : metric === "sales"
              ? `${peakBucket.sales} Sales`
              : `₹${Math.round(peakBucket.aov).toLocaleString()}`,
            subtext: `on ${peakBucket.label}`,
            delay: 0.1
          },
          {
            label: "Daily Run Rate",
            value: `₹${Math.round(totalPeriodRevenue / Math.max(chartData.length, 1)).toLocaleString()}`,
            subtext: "average per bucket",
            delay: 0.2
          },
          {
            label: "Fulfillment Speed",
            value: (
              <span className="flex items-center gap-1.5 text-success">
                <Zap className="w-4 h-4 fill-current" /> Instant
              </span>
            ),
            subtext: "automated execution",
            delay: 0.3
          }
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + item.delay, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 sm:p-6 rounded-3xl bg-slate-50/50 border border-border hover:shadow-md hover:bg-background transition-all duration-300"
          >
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] block mb-2">
              {item.label}
            </span>
            <div className="text-2xl font-black text-foreground tabular-nums">
              {item.value}
            </div>
            <span className="text-xs font-semibold text-muted-foreground mt-1 block">
              {item.subtext}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
