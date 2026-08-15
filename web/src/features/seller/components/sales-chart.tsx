"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  product_id: string;
  seller_amount_paise: number;
  created_at: string;
}

export function SalesChart({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState("6m");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const router = useRouter();

  // Load saved filter state on mount
  useEffect(() => {
    const savedFilter = localStorage.getItem("seller_chart_filter");
    if (savedFilter) setFilter(savedFilter);
    const savedStart = localStorage.getItem("seller_chart_start");
    if (savedStart) setCustomStart(savedStart);
    const savedEnd = localStorage.getItem("seller_chart_end");
    if (savedEnd) setCustomEnd(savedEnd);
  }, []);

  // Save filter state on change
  useEffect(() => {
    localStorage.setItem("seller_chart_filter", filter);
    localStorage.setItem("seller_chart_start", customStart);
    localStorage.setItem("seller_chart_end", customEnd);
  }, [filter, customStart, customEnd]);

  // Auto-refresh the entire dashboard page every 15 seconds to fetch live orders
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, 15000);
    return () => clearInterval(timer);
  }, [router]);

  const chartData = useMemo(() => {
    const now = new Date();
    let startTime = new Date();
    
    if (filter === "today") {
      startTime.setHours(0, 0, 0, 0);
    } else if (filter === "yesterday") {
      startTime.setDate(now.getDate() - 1);
    } else if (filter === "7d") {
      startTime.setDate(now.getDate() - 7);
    } else if (filter === "30d") {
      startTime.setDate(now.getDate() - 30);
    } else if (filter === "6m") {
      startTime.setMonth(now.getMonth() - 6);
    } else if (filter === "1y") {
      startTime.setFullYear(now.getFullYear() - 1);
    } else if (filter === "custom" && customStart && customEnd) {
      startTime = new Date(customStart);
      // set 'now' to custom end
      now.setTime(new Date(customEnd).getTime());
    } else if (filter === "custom") {
      // default 30 days if custom not fully set
      startTime.setDate(now.getDate() - 30);
    }

    const timeSpan = now.getTime() - startTime.getTime();
    const bucketDuration = timeSpan / 5; // 6 points = 5 intervals

    // Generate exactly 6 buckets
    const buckets = Array.from({ length: 6 }).map((_, i) => {
      const bucketTime = new Date(startTime.getTime() + i * bucketDuration);
      
      // Formatting label based on timeSpan
      let label = "";
      if (timeSpan <= 2 * 24 * 60 * 60 * 1000) { // <= 2 days
        label = bucketTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeSpan <= 60 * 24 * 60 * 60 * 1000) { // <= 60 days
        label = bucketTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else { // > 60 days
        label = bucketTime.toLocaleDateString([], { month: 'short' });
      }

      return {
        label,
        time: bucketTime.getTime(),
        sales: 0,
        revenue: 0
      };
    });

    // Assign orders to buckets
    orders.forEach(order => {
      const orderTime = new Date(order.created_at).getTime();
      if (orderTime >= startTime.getTime()) {
        // Find closest bucket
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
        buckets[closestIdx].revenue += (order.seller_amount_paise / 100);
      }
    });

    return buckets;
  }, [orders, filter, customStart, customEnd]);

  const rawMax = Math.max(...chartData.map(m => m.sales), 3);
  const maxSalesValue = Math.ceil(rawMax / 3) * 3;
  const mapY = (val: number) => 150 - ((val / maxSalesValue) * 150);

  const points = chartData.map((m, i) => ({
    x: i * 100, // 5 intervals * 100 = 500 width
    y: mapY(m.sales)
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
  
  const filledPath = `M 0,150 L 0,${points[0].y} ${curvePath.substring(curvePath.indexOf('C') - 1)} L 500,150 Z`;

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-[18px] font-bold text-slate-900">Sales Analytics</h2>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          {filter === "custom" && (
            <div className="flex items-center gap-2 text-xs">
              <input 
                type="date" 
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none text-slate-600 focus:border-blue-500 transition-colors"
              />
              <span className="text-slate-400">to</span>
              <input 
                type="date" 
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none text-slate-600 focus:border-blue-500 transition-colors"
              />
            </div>
          )}
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-50 border-none text-[13px] font-medium text-slate-600 py-1.5 px-3 rounded-lg outline-none cursor-pointer focus:ring-2 focus:ring-blue-100"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
            <option value="custom">Customize...</option>
          </select>
        </div>
      </div>
      
      <div className="h-[220px] w-full relative mt-4">
        {/* Y Axis Labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[11px] text-slate-400 font-medium transform -translate-y-1.5">
          <span>{maxSalesValue}</span>
          <span>{maxSalesValue * 2 / 3}</span>
          <span>{maxSalesValue / 3}</span>
          <span>0</span>
        </div>
        
        {/* Chart SVG */}
        <div className="absolute left-10 right-0 top-0 bottom-8">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            <div className="w-full border-b border-slate-100/60 h-0"></div>
            <div className="w-full border-b border-slate-100/60 h-0"></div>
            <div className="w-full border-b border-slate-100/60 h-0"></div>
            <div className="w-full border-b border-slate-200 h-0"></div>
          </div>
          
          {/* Real Data Smooth Curve SVG */}
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
            <defs>
              <linearGradient id="blueGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Filled Area */}
            <path d={filledPath} fill="url(#blueGradient)" className="transition-all duration-700 ease-in-out" />
            
            {/* Stroke Line */}
            <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" className="transition-all duration-700 ease-in-out" />
            
            {/* Data Points (Dots) */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={hoveredIdx === idx ? "6" : "4"} 
                  fill={hoveredIdx === idx ? "#2563eb" : "white"} 
                  stroke="#2563eb" 
                  strokeWidth="2" 
                  className="transition-all duration-300 ease-in-out cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            ))}
          </svg>
          
          {/* Tooltip */}
          {hoveredIdx !== null && (
            <div 
              className="absolute z-10 bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 transition-opacity duration-200"
              style={{
                left: `calc(3rem + (100% - 3rem) * (${points[hoveredIdx].x} / 500))`, // 3rem = left-10
                top: `${points[hoveredIdx].y}px`,
                marginTop: "-8px"
              }}
            >
              <div className="font-semibold mb-0.5">{chartData[hoveredIdx].sales} Sales (₹{chartData[hoveredIdx].revenue.toLocaleString()})</div>
              <div className="text-slate-400 text-[10px]">{chartData[hoveredIdx].label}</div>
              {/* Arrow */}
              <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-slate-900" />
            </div>
          )}
        </div>

        {/* X Axis Labels */}
        <div className="absolute left-10 right-0 bottom-0 flex justify-between text-[11px] text-slate-400 font-medium px-2">
          {chartData.map((m, idx) => (
            <span key={idx}>{m.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
