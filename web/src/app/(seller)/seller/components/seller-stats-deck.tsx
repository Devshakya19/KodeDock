"use client";

import { motion } from "framer-motion";
import {
  Package,
  Download,
  DollarSign,
  Wallet,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  } as any;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            variants={cardVariants}
            className="group relative rounded-[2rem] bg-white p-1.5 ring-1 ring-slate-200/60 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)] hover:ring-slate-300 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <div className="rounded-[calc(2rem-0.375rem)] bg-gradient-to-b from-white to-slate-50/40 p-6 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                  {card.title}
                </span>
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${card.pillBg}`}
                >
                  {card.tag}
                </span>
              </div>

              <div className="space-y-2 relative z-10">
                <div
                  className={`text-3xl font-black tracking-tighter tabular-nums ${card.accent}`}
                >
                  {card.value}
                </div>

                <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[13px] text-slate-700 font-bold leading-none mb-1">
                      {card.subtitle}
                    </p>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {card.detail}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]">
                    <Icon className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
