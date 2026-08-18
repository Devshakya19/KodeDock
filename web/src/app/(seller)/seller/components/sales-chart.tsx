"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingCart,
  Activity,
  Zap,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Percent,
} from "lucide-react";

interface Order {
  id: string;
  product_id: string;
  seller_amount_paise: number;
  created_at: string;
}

interface SalesChartProps {
  orders: Order[];
}

export function SalesChart({ orders }: SalesChartProps) {
  const [filter, setFilter] = useState("6m");
  const [metric, setMetric] = useState<"revenue" | "sales" | "aov">("revenue");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const router = useRouter();

  // Load saved filter state on mount
  useEffect(() => {
    const savedFilter = localStorage.getItem("codehaat_seller_chart_filter");
    if (savedFilter) setFilter(savedFilter);
    const savedStart = localStorage.getItem("codehaat_seller_chart_start");
    if (savedStart) setCustomStart(savedStart);
    const savedEnd = localStorage.getItem("codehaat_seller_chart_end");
    if (savedEnd) setCustomEnd(savedEnd);
  }, []);

  // Save filter state on change
  useEffect(() => {
    localStorage.setItem("codehaat_seller_chart_filter", filter);
    localStorage.setItem("codehaat_seller_chart_start", customStart);
    localStorage.setItem("codehaat_seller_chart_end", customEnd);
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
    const numBuckets = 7; // 7 anchor points = 6 smooth intervals
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
    if (totalPeriodSales === 0) return { text: "Awaiting Sales", color: "text-slate-400" };
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const rev2 = secondHalf.reduce((s, b) => s + b.revenue, 0);
    const rev1 = firstHalf.reduce((s, b) => s + b.revenue, 0);

    if (rev2 > rev1) {
      return { text: "Accelerating Momentum", color: "text-emerald-600 bg-emerald-50 border-emerald-200/60" };
    }
    return { text: "Steady Velocity", color: "text-blue-600 bg-blue-50 border-blue-200/60" };
  }, [chartData, totalPeriodSales]);

  // SVG Scalers
  const values = chartData.map((m) =>
    metric === "revenue" ? m.revenue : metric === "sales" ? m.sales : m.aov
  );
  const rawMax = Math.max(
    ...values,
    metric === "revenue" ? 500 : metric === "sales" ? 4 : 200
  );
  const maxValue =
    metric === "revenue"
      ? Math.ceil(rawMax / 500) * 500
      : metric === "sales"
      ? Math.ceil(rawMax / 4) * 4
      : Math.ceil(rawMax / 200) * 200;

  const mapY = (val: number) => 150 - (val / (maxValue || 1)) * 135 - 10;

  const points = chartData.map((m, i) => ({
    x: i * (500 / (chartData.length - 1)), // evenly spaced across viewBox 500
    y: mapY(metric === "revenue" ? m.revenue : metric === "sales" ? m.sales : m.aov),
    data: m,
  }));

  // Generate smooth cubic bezier curve
  let curvePath = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i !== points.length - 2 ? points[i + 2] : p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    curvePath += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  const filledPath = `M 0,150 L 0,${points[0].y} ${curvePath.substring(
    curvePath.indexOf("C") - 1
  )} L 500,150 Z`;

  return (
    <div className="rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs">
      <div className="rounded-[22px] bg-gradient-to-b from-white to-slate-50/50 p-6 sm:p-7">
        {/* Top Controls Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                Performance Velocity
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${momentumLabel.color}`}
              >
                {momentumLabel.text}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight tabular-nums">
                {metric === "revenue"
                  ? `₹${totalPeriodRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}`
                  : metric === "sales"
                  ? `${totalPeriodSales} Sales`
                  : `₹${periodAOV.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}`}
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                {metric === "revenue"
                  ? "gross revenue in window"
                  : metric === "sales"
                  ? "total completed orders"
                  : "average order value"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Metric Segmented Control */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100/90 border border-slate-200/70 text-xs font-bold shadow-inner">
              <button
                type="button"
                onClick={() => setMetric("revenue")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  metric === "revenue"
                    ? "bg-white text-slate-950 shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Revenue
              </button>
              <button
                type="button"
                onClick={() => setMetric("sales")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  metric === "sales"
                    ? "bg-white text-slate-950 shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Units
              </button>
              <button
                type="button"
                onClick={() => setMetric("aov")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  metric === "aov"
                    ? "bg-white text-slate-950 shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                AOV
              </button>
            </div>

            {/* Time Filter Selector */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white border border-slate-200/90 text-xs font-bold text-slate-700 py-2 pl-3.5 pr-8 rounded-xl outline-none cursor-pointer hover:border-slate-300 focus:ring-2 focus:ring-slate-900/10 shadow-2xs appearance-none"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
                <option value="custom">Custom Range...</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Custom date range row */}
        {filter === "custom" && (
          <div className="flex items-center gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-4 w-fit animate-in fade-in duration-200">
            <span className="text-slate-500 font-semibold">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 outline-none text-slate-800 font-medium"
            />
            <span className="text-slate-500 font-semibold">to:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 outline-none text-slate-800 font-medium"
            />
          </div>
        )}

        {/* Chart Canvas */}
        <div className="h-[250px] w-full relative mt-4 select-none">
          {/* Y Axis Labels */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-slate-400 font-bold tabular-nums transform -translate-y-1.5 select-none w-12 text-right pr-2">
            <span>
              {metric === "revenue" || metric === "aov"
                ? `₹${maxValue.toLocaleString()}`
                : maxValue}
            </span>
            <span>
              {metric === "revenue" || metric === "aov"
                ? `₹${Math.round((maxValue * 2) / 3).toLocaleString()}`
                : Math.round((maxValue * 2) / 3)}
            </span>
            <span>
              {metric === "revenue" || metric === "aov"
                ? `₹${Math.round(maxValue / 3).toLocaleString()}`
                : Math.round(maxValue / 3)}
            </span>
            <span>0</span>
          </div>

          {/* SVG Area */}
          <div className="absolute left-14 right-2 top-0 bottom-8">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-b border-dashed border-slate-200/50 h-0" />
              <div className="w-full border-b border-dashed border-slate-200/50 h-0" />
              <div className="w-full border-b border-dashed border-slate-200/50 h-0" />
              <div className="w-full border-b border-slate-200/80 h-0" />
            </div>

            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 500 150"
            >
              <defs>
                <linearGradient id="creatorSplineGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                  <stop offset="50%" stopColor="#2563eb" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
                <filter id="splineGlow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Area Fill */}
              <path
                d={filledPath}
                fill="url(#creatorSplineGrad)"
                className="transition-all duration-700 ease-out"
              />

              {/* Spline Stroke */}
              <path
                d={curvePath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.2"
                strokeLinecap="round"
                filter="url(#splineGlow)"
                className="transition-all duration-700 ease-out"
              />

              {/* Vertical Laser Hover Guide */}
              {hoveredIdx !== null && (
                <line
                  x1={points[hoveredIdx].x}
                  y1="0"
                  x2={points[hoveredIdx].x}
                  y2="150"
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="transition-all duration-150"
                />
              )}

              {/* Interactive Point Nodes */}
              {points.map((p, idx) => {
                const isHovered = hoveredIdx === idx;
                return (
                  <g key={idx}>
                    {/* Outer pulse circle when hovered */}
                    {isHovered && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="12"
                        fill="#2563eb"
                        fillOpacity="0.2"
                        className="animate-ping"
                      />
                    )}
                    {/* Clickable Hit Target */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="16"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                    {/* Visual node */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? "6.5" : "4"}
                      fill={isHovered ? "#2563eb" : "#ffffff"}
                      stroke="#2563eb"
                      strokeWidth={isHovered ? "3" : "2.2"}
                      className="transition-all duration-200 ease-out pointer-events-none drop-shadow-xs"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Glassmorphic Floating Tooltip */}
            {hoveredIdx !== null && (
              <div
                className="absolute z-20 bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 transition-all duration-150 border border-slate-800 min-w-[150px]"
                style={{
                  left: `calc(100% * (${points[hoveredIdx].x} / 500))`,
                  top: `${points[hoveredIdx].y}px`,
                  marginTop: "-14px",
                }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {chartData[hoveredIdx].fullDateStr || chartData[hoveredIdx].label}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4 text-xs font-black">
                    <span className="text-slate-300">Revenue:</span>
                    <span className="text-white tabular-nums">
                      ₹{chartData[hoveredIdx].revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-xs font-bold">
                    <span className="text-slate-400">Sales:</span>
                    <span className="text-emerald-400 tabular-nums">
                      {chartData[hoveredIdx].sales} units
                    </span>
                  </div>
                  {chartData[hoveredIdx].sales > 0 && (
                    <div className="flex items-center justify-between gap-4 text-[11px] font-semibold text-slate-400 pt-1 border-t border-slate-800">
                      <span>AOV:</span>
                      <span className="text-blue-300 tabular-nums">
                        ₹{Math.round(chartData[hoveredIdx].aov).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                {/* Arrow Pointer */}
                <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-950" />
              </div>
            )}
          </div>

          {/* X Axis Labels */}
          <div className="absolute left-14 right-2 bottom-0 flex justify-between text-[10px] text-slate-400 font-bold px-1 select-none">
            {chartData.map((m, idx) => (
              <span key={idx} className="text-center">
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Velocity Metrics Micro-Deck */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-5 mt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Peak Velocity
            </span>
            <div className="text-sm font-black text-slate-900 mt-0.5 tabular-nums">
              {metric === "revenue"
                ? `₹${peakBucket.revenue.toLocaleString()}`
                : metric === "sales"
                ? `${peakBucket.sales} Sales`
                : `₹${Math.round(peakBucket.aov).toLocaleString()}`}
            </div>
            <span className="text-[10px] font-medium text-slate-500">
              on {peakBucket.label}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Daily Run Rate
            </span>
            <div className="text-sm font-black text-slate-900 mt-0.5 tabular-nums">
              ₹
              {Math.round(
                totalPeriodRevenue / Math.max(chartData.length, 1)
              ).toLocaleString()}
            </div>
            <span className="text-[10px] font-medium text-slate-500">
              average per bucket
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Fulfillment Speed
            </span>
            <div className="text-sm font-black text-emerald-600 mt-0.5 tabular-nums flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Instant (0s)
            </div>
            <span className="text-[10px] font-medium text-slate-500">
              automated GitHub invite
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
