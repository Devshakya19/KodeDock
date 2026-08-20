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
      accent: "text-foreground",
      pillBg: "bg-secondary text-foreground border border-border/60",
      tag: "Live Store",
      detail: "Publicly visible",
    },
    {
      title: "Completed Orders",
      value: totalSales.toLocaleString(),
      subtitle: "Automated fulfillment",
      icon: Download,
      accent: "text-accent",
      pillBg: "bg-accent/10 text-accent border border-accent/30",
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
      accent: "text-foreground",
      pillBg: "bg-success/10 text-success border border-success/20",
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
      accent: "text-success",
      pillBg: "bg-success/10 text-success-foreground border border-success/30",
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
            className="group relative rounded-[2rem] bg-background p-1.5 ring-1 ring-border/60 shadow-md hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)] hover:ring-slate-300 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <div className="rounded-[calc(2rem-0.375rem)] bg-gradient-to-b from-white to-slate-50/40 p-6 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
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

                <div className="flex items-end justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-[13px] text-foreground font-bold leading-none mb-1">
                      {card.subtitle}
                    </p>
                    <span className="text-[11px] text-muted-foreground font-semibold">
                      {card.detail}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-secondary/50 border border-border/80 flex items-center justify-center text-muted-foreground group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]">
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
