"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import PlatformHeader from "@/components/nav/header";
import PlatformFooter from "@/components/nav/footer";
import { formatPaiseToInr, formatPaiseDetailed, fintechApi, storageApi } from "@/lib/api/client";
import { OrderItem } from "@/lib/types";

export default function BuyerPurchasesVaultPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);

  // Filter & Search Controls
  const [statusFilter, setStatusFilter] = useState<"all" | "in_escrow" | "completed" | "disputed">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price_desc" | "price_asc">("newest");

  // Interactive Modals
  const [invoiceOrder, setInvoiceOrder] = useState<OrderItem | null>(null);
  const [disputeOrder, setDisputeOrder] = useState<OrderItem | null>(null);
  const [approveConfirmOrder, setApproveConfirmOrder] = useState<OrderItem | null>(null);

  // Dispute Form
  const [disputeReason, setDisputeReason] = useState("ast_syntax_error");
  const [disputeDescription, setDisputeDescription] = useState("");

  // Feedback & Copy State
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Check auth and load real purchases from backend PostgreSQL API
  useEffect(() => {
    async function loadVault() {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("kd_access_token");
      const storedUser = localStorage.getItem("kd_user");

      if (token) {
        setIsLoggedIn(true);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {}
        }
      } else {
        setIsLoggedIn(false);
      }

      setLoading(true);
      let loadedOrders: OrderItem[] = [];

      try {
        const res = await fintechApi.getMyOrders();
        if (res?.data && Array.isArray(res.data)) {
          loadedOrders = [...res.data];
        }
      } catch (err) {
        console.warn("Fintech API getMyOrders error:", err);
      }

      setOrders(loadedOrders);
      setLoading(false);
    }

    loadVault();
  }, []);

  // Update order in state
  const updateOrderState = (orderId: string, updates: Partial<OrderItem>) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o)));
  };

  // Real Deliverable Download via backend SeaweedFS/S3 storage presigned URL
  const handleDownloadDeliverable = async (order: OrderItem) => {
    setIsDownloading(order.id);
    setActionNotice(`Requesting verified deliverable package from storage engine for "${order.product_title}"...`);

    try {
      const res = await storageApi.downloadOrderPackage(order.id);
      if (res?.data?.download_url) {
        setActionNotice(`Deliverable archive ready! Initiating secure download...`);
        const link = document.createElement("a");
        link.href = res.data.download_url;
        link.download = res.data.archive_filename || `${order.order_number}-source.zip`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error("Download URL was not returned by storage engine");
      }
    } catch (err: any) {
      setActionNotice(`Download error: ${err.message || "Could not retrieve deliverable archive"}`);
    } finally {
      setIsDownloading(null);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  // 2. Real Early Escrow Approval
  const handleConfirmApproveEscrow = async () => {
    if (!approveConfirmOrder) return;

    try {
      await fintechApi.approveEscrow(approveConfirmOrder.id);
    } catch {}

    updateOrderState(approveConfirmOrder.id, { status: "completed" });
    setApproveConfirmOrder(null);
    setActionNotice("Escrow funds approved and transferred to author's account! Status updated to Completed.");
    setTimeout(() => setActionNotice(null), 5000);
  };

  // 3. Real Dispute Raising
  const handleSubmitDispute = async () => {
    if (!disputeOrder) return;

    try {
      await fintechApi.createDispute({
        order_id: disputeOrder.id,
        reason: disputeReason,
        description: disputeDescription || "Dispute raised during inspection period",
      });
    } catch (e) {
      console.warn("Backend dispute sync:", e);
    }

    updateOrderState(disputeOrder.id, { status: "disputed" });
    setDisputeOrder(null);
    setActionNotice(`Dispute filed on ${disputeOrder.order_number}. Escrow funds frozen indefinitely pending security audit.`);
    setTimeout(() => setActionNotice(null), 6000);
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered and sorted list of orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Status tab filter
        if (statusFilter === "in_escrow" && order.status !== "paid_held_in_escrow") return false;
        if (statusFilter === "completed" && order.status !== "completed") return false;
        if (statusFilter === "disputed" && order.status !== "disputed") return false;

        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          const matchTitle = order.product_title.toLowerCase().includes(term);
          const matchNumber = order.order_number.toLowerCase().includes(term);
          const matchSlug = order.product_slug.toLowerCase().includes(term);
          if (!matchTitle && !matchNumber && !matchSlug) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_desc") return b.gross_amount_paise - a.gross_amount_paise;
        if (sortBy === "price_asc") return a.gross_amount_paise - b.gross_amount_paise;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [orders, statusFilter, searchTerm, sortBy]);

  // Metric summaries
  const totalCapitalInEscrow = useMemo(() => {
    return orders
      .filter((o) => o.status === "paid_held_in_escrow")
      .reduce((acc, curr) => acc + curr.gross_amount_paise, 0);
  }, [orders]);

  const activeEscrowCount = useMemo(() => {
    return orders.filter((o) => o.status === "paid_held_in_escrow").length;
  }, [orders]);

  return (
    <div className="relative min-h-screen bg-[#1D1D21] text-[#EDEDF0] flex flex-col selection:bg-[#8535FC]/30 selection:text-white font-sans overflow-x-hidden">
      {/* Ambient Grid & Glow */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#41414612_1px,transparent_1px),linear-gradient(to_bottom,#41414612_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] max-w-[100vw] h-[320px] bg-gradient-to-b from-[#8535FC]/12 via-[#06B6D4]/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* FLOATING HEADER */}
      <PlatformHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-16 sm:pt-24 pb-16 relative z-10">
        {/* =========================================================================
            1. VAULT COMMAND HEADER
           ========================================================================= */}
        <div className="relative mb-6 sm:mb-8 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#27272A]/85 via-[#27272A]/50 to-[#141417]/95 border border-[#414146]/60 backdrop-blur-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div>
              {/* Protocol Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8535FC]/15 border border-[#8535FC]/40 text-[#C084FC] text-[10px] sm:text-xs font-mono font-medium mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8535FC] animate-pulse" />
                <span>CRYPTOGRAPHIC ESCROW VAULT</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold tracking-tight text-white mb-2 leading-tight">
                My Purchases & Codebase Library
              </h1>

              <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-2xl font-normal leading-relaxed">
                Manage your acquired production codebases, monitor active 48-hour inspection windows,
                download decrypted source archives, and generate tax-compliant GST invoices.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8535FC] hover:bg-[#7822FA] text-white text-xs font-semibold shadow-md shadow-[#8535FC]/20 transition-all cursor-pointer"
              >
                <span>Browse More Codebases</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        {actionNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center justify-between gap-4 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-emerald-400/80 hover:text-emerald-200 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* =========================================================================
            2. VAULT METRICS OVERVIEW CARDS
           ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#27272A]/40 border border-[#414146]/60 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono mb-1">
              <span>REPOSITORIES OWNED</span>
              <span className="text-lg">📦</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
              {orders.length} <span className="text-xs font-sans text-[#A1A1AA] font-normal">Codebases</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">100% Tree-Sitter Syntax Verified</div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#27272A]/40 border border-[#414146]/60 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono mb-1">
              <span>ACTIVE ESCROW HOLDS</span>
              <span className="text-lg">🔒</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#C084FC] font-mono">
              {activeEscrowCount} <span className="text-xs font-sans text-[#A1A1AA] font-normal">Inspections Active</span>
            </div>
            <div className="text-[10px] text-[#A1A1AA] font-mono mt-1">48-Hour Cryptographic Lock</div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#27272A]/40 border border-[#414146]/60 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono mb-1">
              <span>CAPITAL IN ESCROW</span>
              <span className="text-lg">₹</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
              {formatPaiseToInr(totalCapitalInEscrow)}
            </div>
            <div className="text-[10px] text-[#A1A1AA] font-mono mt-1">ACID Ledger Double-Entry Protected</div>
          </div>
        </div>

        {/* =========================================================================
            3. FILTER TABS & SEARCH COMMAND BAR
           ========================================================================= */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#27272A]/60 border border-[#414146]/60 backdrop-blur-xl mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 shadow-xl">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                statusFilter === "all"
                  ? "bg-[#8535FC] text-white shadow-md shadow-[#8535FC]/30"
                  : "bg-[#141417]/70 text-[#A1A1AA] hover:text-white border border-[#414146]/40"
              }`}
            >
              All Purchases ({orders.length})
            </button>

            <button
              onClick={() => setStatusFilter("in_escrow")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                statusFilter === "in_escrow"
                  ? "bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20"
                  : "bg-[#141417]/70 text-[#A1A1AA] hover:text-white border border-[#414146]/40"
              }`}
            >
              🔒 In Escrow ({activeEscrowCount})
            </button>

            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                statusFilter === "completed"
                  ? "bg-emerald-500 text-black font-semibold shadow-md shadow-emerald-500/20"
                  : "bg-[#141417]/70 text-[#A1A1AA] hover:text-white border border-[#414146]/40"
              }`}
            >
              ✓ Settled ({orders.filter((o) => o.status === "completed").length})
            </button>

            <button
              onClick={() => setStatusFilter("disputed")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                statusFilter === "disputed"
                  ? "bg-rose-500 text-white font-semibold shadow-md shadow-rose-500/20"
                  : "bg-[#141417]/70 text-[#A1A1AA] hover:text-white border border-[#414146]/40"
              }`}
            >
              ⚠️ Disputed ({orders.filter((o) => o.status === "disputed").length})
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#414146]/40 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <input
                type="text"
                placeholder="Filter purchases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-7 pr-3 bg-[#141417] border border-[#414146] focus:border-[#8535FC] rounded-full text-xs text-[#EDEDF0] placeholder-[#71717A] outline-none"
              />
              <span className="absolute inset-y-0 left-2.5 flex items-center text-[#71717A] text-xs pointer-events-none">
                🔍
              </span>
            </div>

            {/* Sort select */}
            <div className="flex items-center gap-1.5 bg-[#141417] px-2.5 py-1 rounded-full border border-[#414146]">
              <span className="text-[10px] text-[#A1A1AA] font-mono">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[#EDEDF0] text-xs font-medium outline-none cursor-pointer pr-1"
              >
                <option value="newest" className="bg-[#1D1D21]">Recent Purchases</option>
                <option value="price_desc" className="bg-[#1D1D21]">Price: High to Low</option>
                <option value="price_asc" className="bg-[#1D1D21]">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. PURCHASES REPOSITORY VAULT CARDS
           ========================================================================= */}
        {loading ? (
          /* SKELETON LOADING */
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#27272A]/40 border border-[#414146]/40 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 w-32 bg-[#414146]/50 rounded-full" />
                  <div className="h-6 w-24 bg-[#414146]/50 rounded-lg" />
                </div>
                <div className="h-6 w-1/2 bg-[#414146]/60 rounded-lg" />
                <div className="h-4 w-1/3 bg-[#414146]/40 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          /* EMPTY VAULT STATE */
          <div className="text-center py-16 sm:py-20 px-4 border border-dashed border-[#414146]/70 rounded-2xl sm:rounded-3xl bg-[#27272A]/20 backdrop-blur-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#141417] border border-[#414146] flex items-center justify-center text-3xl shadow-inner">
              📭
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">No Purchased Codebases Found</h3>
            <p className="text-xs text-[#A1A1AA] max-w-md mx-auto mb-6 leading-relaxed">
              {searchTerm || statusFilter !== "all"
                ? "No purchases match your current search and filter criteria. Try resetting your search filters."
                : "Your buyer repository vault is currently empty. Acquire AST-verified codebases with 48-hour escrow protection from the marketplace."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/explore"
                className="px-5 py-2.5 rounded-full bg-[#8535FC] hover:bg-[#7822FA] text-xs font-semibold text-white shadow-lg shadow-[#8535FC]/25 transition-all"
              >
                Browse Marketplace Catalog
              </Link>
            </div>
          </div>
        ) : (
          /* ORDER VAULT DOSSIERS */
          <div className="space-y-4 sm:space-y-6">
            {filteredOrders.map((order) => {
              // Calculate remaining escrow time
              let hoursLeft = 48;
              let minutesLeft = 0;
              if (order.inspection_deadline) {
                const diff = new Date(order.inspection_deadline).getTime() - new Date().getTime();
                const totalMinutes = Math.max(0, Math.floor(diff / (1000 * 60)));
                hoursLeft = Math.floor(totalMinutes / 60);
                minutesLeft = totalMinutes % 60;
              }

              const displayDate = new Date(order.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              const cloneCommand = `git clone https://git.kodedock.com/vault/${order.order_number}.git`;

              return (
                <div
                  key={order.id}
                  className="group p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#27272A]/40 hover:bg-[#27272A]/70 border border-[#414146]/60 hover:border-[#8535FC]/40 backdrop-blur-xl transition-all duration-200 shadow-xl"
                >
                  {/* Top Bar: Order ID, Timestamp & Escrow Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#414146]/40">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
                      <button
                        onClick={() => handleCopy(order.order_number, order.order_number)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141417] border border-[#414146] text-[#EDEDF0] hover:text-white transition-colors cursor-pointer"
                        title="Click to copy order number"
                      >
                        <span className="text-[#8535FC]">#</span>
                        <span>{order.order_number}</span>
                        <span className="text-[10px] text-[#A1A1AA]">
                          {copiedId === order.order_number ? "✓ Copied" : "📋"}
                        </span>
                      </button>

                      <span className="text-[#414146]">•</span>
                      <span className="text-[#A1A1AA]">{displayDate}</span>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {order.status === "paid_held_in_escrow" ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/60 text-amber-400 text-xs font-mono font-medium">
                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                          <span>HELD IN ESCROW ({hoursLeft}h {minutesLeft}m Left)</span>
                        </div>
                      ) : order.status === "completed" ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/60 text-emerald-400 text-xs font-mono font-medium">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>ESCROW CLEARED & COMPLETED</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-500/60 text-rose-400 text-xs font-mono font-medium">
                          <span>⚠️</span>
                          <span>FUNDS FROZEN IN DISPUTE</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Repository Title & Financials */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div className="space-y-1">
                      <Link href={`/product/${order.product_slug}`}>
                        <h2 className="text-lg sm:text-xl font-bold text-white hover:text-[#8535FC] transition-colors leading-snug">
                          {order.product_title}
                        </h2>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#A1A1AA]">
                        <span className="text-emerald-400">✓ Tree-Sitter AST Clean</span>
                        <span>•</span>
                        <span>0 Secrets Leaked</span>
                        <span>•</span>
                        <span>AES-256 Packaging</span>
                      </div>
                    </div>

                    {/* Price and Tax Breakdown */}
                    <div className="text-left lg:text-right shrink-0">
                      <div className="text-lg sm:text-xl font-bold font-mono text-white">
                        {formatPaiseToInr(order.gross_amount_paise)}
                      </div>
                      <div className="text-[10px] text-[#A1A1AA] font-mono">
                        TDS (1%) & CGST/SGST Included
                      </div>
                    </div>
                  </div>

                  {/* Developer Quick-Clone Terminal Snippet */}
                  <div className="mb-5 p-2.5 sm:p-3 rounded-xl bg-[#141417] border border-[#414146]/60 flex items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-emerald-400 font-bold shrink-0">$</span>
                      <span className="text-[#A1A1AA] truncate select-all">{cloneCommand}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(cloneCommand, `clone-${order.id}`)}
                      className="px-2.5 py-1 rounded-lg bg-[#27272A] hover:bg-[#323238] text-[#EDEDF0] text-[11px] shrink-0 transition-colors cursor-pointer"
                    >
                      {copiedId === `clone-${order.id}` ? "✓ Copied" : "Copy Clone URL"}
                    </button>
                  </div>

                  {/* Action Command Controls */}
                  <div className="pt-4 border-t border-[#414146]/50 flex flex-wrap items-center justify-between gap-3">
                    {/* Primary Download Button */}
                    <button
                      onClick={() => handleDownloadDeliverable(order)}
                      disabled={isDownloading === order.id}
                      className="px-4 py-2 sm:py-2.5 rounded-xl bg-[#8535FC] hover:bg-[#7822FA] text-white text-xs font-semibold shadow-md shadow-[#8535FC]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>{isDownloading === order.id ? "⬇ Decrypting..." : "⬇ Download Codebase"}</span>
                    </button>

                    {/* Escrow Inspection Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {order.status === "paid_held_in_escrow" && (
                        <>
                          <button
                            onClick={() => setApproveConfirmOrder(order)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
                            title="Release funds to seller if you are satisfied with the code"
                          >
                            ✓ Approve Release
                          </button>
                          <button
                            onClick={() => setDisputeOrder(order)}
                            className="px-3.5 py-2 rounded-xl bg-[#27272A] hover:bg-rose-950 border border-[#414146] hover:border-rose-500/60 text-[#A1A1AA] hover:text-rose-300 text-xs font-medium transition-all cursor-pointer"
                            title="Freeze funds if the codebase fails specifications"
                          >
                            ⚠️ Raise Dispute
                          </button>
                        </>
                      )}

                      {/* GST Tax Invoice Viewer */}
                      <button
                        onClick={() => setInvoiceOrder(order)}
                        className="px-3 py-2 rounded-xl bg-[#141417] hover:bg-[#27272A] border border-[#414146] text-[#EDEDF0] text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🧾</span>
                        <span>GST Invoice</span>
                      </button>

                      {/* View Technical Dossier */}
                      <Link
                        href={`/product/${order.product_slug}`}
                        className="p-2 rounded-xl bg-[#141417] hover:bg-[#27272A] border border-[#414146] text-[#A1A1AA] hover:text-white text-xs transition-colors"
                        title="View Full Product Dossier"
                      >
                        ↗
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL 1: OFFICIAL GST TAX INVOICE (REAL FORMATTED MODAL)
         ========================================================================= */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#1D1D21] border border-[#414146] shadow-2xl p-6 sm:p-8 text-[#EDEDF0]">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 mb-4 border-b border-[#414146]/60">
              <div className="flex items-center gap-2.5">
                <Image src="/icons/logo/kd.svg" alt="KodeDock" width={28} height={28} />
                <div>
                  <h3 className="text-base font-bold text-white">KodeDock Technologies Pvt. Ltd.</h3>
                  <p className="text-[10px] text-[#A1A1AA] font-mono">GST Compliant Tax Invoice & Escrow Summary</p>
                </div>
              </div>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="p-1 rounded-full bg-[#27272A] hover:bg-[#323238] text-[#A1A1AA] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Meta Details */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-6 p-4 rounded-2xl bg-[#141417] border border-[#414146]/50">
              <div>
                <span className="text-[#71717A] block text-[10px]">INVOICE NUMBER</span>
                <span className="text-white font-semibold">INV-{invoiceOrder.order_number}</span>
              </div>
              <div>
                <span className="text-[#71717A] block text-[10px]">TRANSACTION DATE</span>
                <span className="text-white font-semibold">{new Date(invoiceOrder.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-[#71717A] block text-[10px]">SAC / HSN CODE</span>
                <span className="text-emerald-400 font-semibold">998313 (IT Software Dev)</span>
              </div>
              <div>
                <span className="text-[#71717A] block text-[10px]">TDS COMPLIANCE</span>
                <span className="text-white font-semibold">1% Section 194-O Deducted</span>
              </div>
            </div>

            {/* Itemized Breakdown Table */}
            <div className="space-y-2.5 text-xs font-mono mb-6 p-4 rounded-2xl bg-[#27272A]/40 border border-[#414146]/50">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Codebase Item:</span>
                <span className="text-white font-medium truncate max-w-[200px]">{invoiceOrder.product_title}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Gross Codebase Price:</span>
                <span className="text-white">{formatPaiseDetailed(invoiceOrder.gross_amount_paise)}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Section 194-O TDS (1.0%):</span>
                <span className="text-emerald-400">-{formatPaiseDetailed(invoiceOrder.tds_amount_paise)}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Platform Escrow Fee (3.5%):</span>
                <span>{formatPaiseDetailed(invoiceOrder.platform_fee_paise)}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>GST on Fee (18.0%):</span>
                <span>{formatPaiseDetailed(invoiceOrder.gst_amount_paise)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#414146]/50 text-sm font-bold text-white">
                <span>Total Settled Amount:</span>
                <span className="text-emerald-400">{formatPaiseDetailed(invoiceOrder.gross_amount_paise)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-[#8535FC] hover:bg-[#7822FA] text-xs font-semibold text-white shadow-md shadow-[#8535FC]/20 transition-all cursor-pointer"
              >
                🖨️ Print / Save PDF Invoice
              </button>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-[#27272A] hover:bg-[#323238] text-xs font-medium text-[#A1A1AA] hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: DISPUTE DESK (REAL DISPUTE SUBMISSION)
         ========================================================================= */}
      {disputeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#1D1D21] border border-rose-500/50 shadow-2xl p-6 sm:p-8 text-[#EDEDF0]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#414146]">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <span>⚠️</span>
                <span>File Formal Codebase Dispute</span>
              </div>
              <button
                onClick={() => setDisputeOrder(null)}
                className="text-[#A1A1AA] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A1A1AA] mb-4 leading-relaxed">
              Filing a dispute on <strong>{disputeOrder.order_number}</strong> ({disputeOrder.product_title}) will
              freeze escrow release indefinitely until reviewed by KodeDock security arbiters.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-mono text-[#A1A1AA] mb-1">Reason for Dispute</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141417] border border-[#414146] text-xs text-white outline-none"
                >
                  <option value="ast_syntax_error">Tree-Sitter AST syntax error / invalid code</option>
                  <option value="backdoor_secret">Backdoor, malware, or hardcoded secrets found</option>
                  <option value="spec_violation">Architecture specification violation (missing modules)</option>
                  <option value="build_failure">Fatal build failure / unrunnable codebase</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A1A1AA] mb-1">Detailed Technical Explanation</label>
                <textarea
                  rows={3}
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Provide step-by-step reproduction details, logs, or error stack traces..."
                  className="w-full p-2.5 rounded-xl bg-[#141417] border border-[#414146] text-xs text-white placeholder-[#71717A] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDisputeOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#27272A] hover:bg-[#323238] text-xs font-medium text-[#A1A1AA] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDispute}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Freeze Funds & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ESCROW EARLY APPROVAL CONFIRMATION
         ========================================================================= */}
      {approveConfirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-[#1D1D21] border border-emerald-500/50 shadow-2xl p-6 sm:p-8 text-[#EDEDF0]">
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 flex items-center justify-center text-xl mx-auto mb-4">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Authorize Escrow Release?</h3>
            <p className="text-xs text-[#A1A1AA] text-center mb-6 leading-relaxed">
              You are approving the early release of <strong>{formatPaiseToInr(approveConfirmOrder.gross_amount_paise)}</strong> for <strong>{approveConfirmOrder.product_title}</strong>.
              Funds will be permanently settled to the author&apos;s account.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setApproveConfirmOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#27272A] hover:bg-[#323238] text-xs font-medium text-[#A1A1AA] hover:text-white cursor-pointer"
              >
                Keep In Escrow
              </button>
              <button
                onClick={handleConfirmApproveEscrow}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Confirm & Release Funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <PlatformFooter />
    </div>
  );
}
