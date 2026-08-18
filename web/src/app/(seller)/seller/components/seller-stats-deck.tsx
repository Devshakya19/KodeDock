"use client";

import {
  Package,
  Download,
  DollarSign,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface SellerStatsDeckProps {
  activeProducts: number;
  totalSales: number;
  totalRevenuePaise: number;
  totalEarnedPaise: number;
  totalViews?: number;
}

export function SellerStatsDeck({
  activeProducts,
  totalSales,
  totalRevenuePaise,
  totalEarnedPaise,
  totalViews = 0,
}: SellerStatsDeckProps) {
  const cards = [
    {
      title: "Active Products",
      value: activeProducts.toLocaleString(),
      subtitle: "Live in store catalog",
      icon: Package,
      accent: "text-slate-900",
      pillBg: "bg-slate-100 text-slate-700 border border-slate-200/60",
      tag: "Live Store",
      detail: "Publicly visible",
    },
    {
      title: "Completed Orders",
      value: totalSales.toLocaleString(),
      subtitle: "Automated fulfillment",
      icon: Download,
      accent: "text-blue-600",
      pillBg: "bg-blue-50 text-blue-700 border border-blue-100/80",
      tag: "100% Delivery",
      detail: "Instant git sync",
    },
    {
      title: "Gross Sales Volume",
      value: `₹${(totalRevenuePaise / 100).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`,
      subtitle: "Total customer spend",
      icon: DollarSign,
      accent: "text-slate-950",
      pillBg: "bg-emerald-50 text-emerald-700 border border-emerald-100/80",
      tag: "2.5% Fee",
      detail: "Platform fee",
    },
    {
      title: "Net Creator Profit",
      value: `₹${(totalEarnedPaise / 100).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`,
      subtitle: "Credited to wallet",
      icon: Wallet,
      accent: "text-emerald-600",
      pillBg: "bg-emerald-50 text-emerald-800 border border-emerald-200/70",
      tag: "Ready Payout",
      detail: "Direct to bank/UPI",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="group relative rounded-[26px] bg-white p-1.5 ring-1 ring-slate-200/80 shadow-xs hover:shadow-md hover:ring-slate-300 transition-all duration-300"
          >
            <div className="rounded-[calc(26px-6px)] bg-gradient-to-b from-white to-slate-50/50 p-5 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${card.pillBg}`}
                >
                  {card.tag}
                </span>
              </div>

              <div className="space-y-1.5">
                <div
                  className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums ${card.accent}`}
                >
                  {card.value}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
                  <div>
                    <p className="text-[12px] text-slate-600 font-semibold leading-none">
                      {card.subtitle}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {card.detail}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center text-slate-600 group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 transition-all duration-300 shadow-2xs group-hover:scale-105">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
