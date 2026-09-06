"use client";

import React, { useState } from "react";
import Link from "next/link";
import PlatformHeader from "@/components/nav/header";
import PlatformFooter from "@/components/nav/footer";
import { formatPaiseToInr } from "@/lib/api/client";

interface OrderMock {
  id: string;
  orderNumber: string;
  title: string;
  slug: string;
  pricePaise: number;
  status: "paid_held_in_escrow" | "completed";
  inspectionHoursLeft: number;
  purchasedDate: string;
}

const SAMPLE_ORDERS: OrderMock[] = [
  {
    id: "ord-1",
    orderNumber: "KD-ORD-2026-0042",
    title: "SaaS Multi-Tenant Boilerplate (Next.js 15 + Rust)",
    slug: "saas-multitenant-nextjs-rust",
    pricePaise: 499900,
    status: "paid_held_in_escrow",
    inspectionHoursLeft: 42,
    purchasedDate: "Today, 11:20 AM",
  },
  {
    id: "ord-2",
    orderNumber: "KD-ORD-2026-0019",
    title: "AI Semantic Vector Search Engine & RAG Pipeline",
    slug: "ai-vector-search-rag-pipeline",
    pricePaise: 799900,
    status: "completed",
    inspectionHoursLeft: 0,
    purchasedDate: "Aug 28, 2026",
  },
];

export default function BuyerDashboardPage() {
  const [orders, setOrders] = useState<OrderMock[]>(SAMPLE_ORDERS);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleApproveEscrow = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "completed", inspectionHoursLeft: 0 }
          : o
      )
    );
    setActionNotice("Escrow funds released to seller account! Transaction recorded in ACID ledger.");
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRaiseDispute = (orderNumber: string) => {
    setActionNotice(`Dispute raised on ${orderNumber}. Escrow funds frozen indefinitely pending security audit.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleDownloadDeliverable = (title: string) => {
    setActionNotice(`Decrypting AES-256 deliverable for "${title}"... Download started!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="relative min-h-screen bg-[#1D1D21] text-[#EDEDF0] flex flex-col selection:bg-[#8535FC]/30 selection:text-white">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-gradient-to-b from-[#8535FC]/15 via-[#06B6D4]/5 to-transparent blur-3xl pointer-events-none z-0" />

      <PlatformHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 relative z-10">
        {/* HEADER */}
        <div className="mb-8 pb-6 border-b border-[#414146]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8535FC]/15 border border-[#8535FC]/40 text-[#A855F7] text-xs font-mono font-medium mb-3">
              <span>🛒 BUYER REPOSITORY VAULT</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              My Purchased Codebases
            </h1>
            <p className="text-sm text-[#A1A1AA] mt-1">
              Manage your active 48-hour escrow inspection windows, download decrypted archives, and access tax invoices.
            </p>
          </div>

          <Link
            href="/"
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#323238] border border-[#414146] text-xs font-medium text-white transition-all"
          >
            ← Browse More Codebases
          </Link>
        </div>

        {/* NOTIFICATION TOAST */}
        {actionNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-mono animate-fadeIn">
            ✓ {actionNotice}
          </div>
        )}

        {/* METRICS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#27272A]/40 border border-[#414146]/60 backdrop-blur-sm">
            <div className="text-xs text-[#71717A] font-mono">Total Repositories Owned</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">{orders.length} Codebases</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#27272A]/40 border border-[#414146]/60 backdrop-blur-sm">
            <div className="text-xs text-[#71717A] font-mono">Active Escrow Windows</div>
            <div className="text-2xl font-bold text-[#8535FC] font-mono mt-1">
              {orders.filter((o) => o.status === "paid_held_in_escrow").length} Pending Release
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#27272A]/40 border border-[#414146]/60 backdrop-blur-sm">
            <div className="text-xs text-[#71717A] font-mono">Total Capital In Escrow</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {formatPaiseToInr(orders.reduce((acc, curr) => acc + curr.pricePaise, 0))}
            </div>
          </div>
        </div>

        {/* ORDERS VAULT LIST */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 sm:p-8 rounded-3xl bg-[#27272A]/40 border border-[#414146]/60 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-[#8535FC]/40 transition-all"
            >
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono text-[#A1A1AA]">{order.orderNumber}</span>
                  <span className="text-[#414146]">•</span>
                  <span className="text-xs font-mono text-[#71717A]">{order.purchasedDate}</span>

                  {order.status === "paid_held_in_escrow" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/50 text-amber-400 text-xs font-mono font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>HELD IN ESCROW ({order.inspectionHoursLeft}h Remaining)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>ESCROW SETTLED & COMPLETED</span>
                    </span>
                  )}
                </div>

                <Link
                  href={`/product/${order.slug}`}
                  className="text-xl font-bold text-white hover:text-[#8535FC] transition-colors block"
                >
                  {order.title}
                </Link>

                <div className="flex items-center gap-4 text-xs font-mono text-[#A1A1AA]">
                  <div>
                    Price Paid: <span className="text-white font-bold">{formatPaiseToInr(order.pricePaise)}</span>
                  </div>
                  <div>•</div>
                  <div>Delivery: <span className="text-emerald-400">AES-256 ZIP Ready</span></div>
                </div>
              </div>

              {/* ACTION CONTROLS */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => handleDownloadDeliverable(order.title)}
                  className="px-4 py-2.5 rounded-xl bg-[#8535FC] hover:bg-[#7828e8] text-white text-xs font-semibold tracking-wide shadow-md shadow-[#8535FC]/20 transition-all flex items-center gap-2"
                >
                  <span>⬇ Download Codebase</span>
                </button>

                {order.status === "paid_held_in_escrow" && (
                  <>
                    <button
                      onClick={() => handleApproveEscrow(order.id)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-semibold transition-all"
                      title="Release funds to seller early if you have finished inspection"
                    >
                      Approve Release
                    </button>
                    <button
                      onClick={() => handleRaiseDispute(order.orderNumber)}
                      className="px-4 py-2.5 rounded-xl bg-[#27272A] hover:bg-rose-950 border border-[#414146] hover:border-rose-500/50 text-[#A1A1AA] hover:text-rose-300 text-xs font-medium transition-all"
                      title="Freeze funds if the codebase fails specifications"
                    >
                      Raise Dispute
                    </button>
                  </>
                )}

                <button
                  onClick={() => setActionNotice(`Generated GST Tax Invoice PDF for ${order.orderNumber}`)}
                  className="p-2.5 rounded-xl bg-[#1D1D21] border border-[#414146] text-[#A1A1AA] hover:text-white text-xs font-mono transition-all"
                  title="Download GST Compliant Tax Invoice"
                >
                  🧾 Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PlatformFooter />
    </div>
  );
}
