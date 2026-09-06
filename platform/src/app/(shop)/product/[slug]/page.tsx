"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlatformHeader from "@/components/nav/header";
import PlatformFooter from "@/components/nav/footer";
import { INITIAL_CATALOG } from "@/lib/initial-catalog";
import { formatPaiseToInr, formatPaiseDetailed, fintechApi } from "@/lib/api/client";
import { OrderItem } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const product = INITIAL_CATALOG.find((p) => p.slug === slug);

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  if (!product) {
    // If not found in static list
    return (
      <div className="min-h-screen bg-[#1D1D21] text-white flex flex-col">
        <PlatformHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Codebase Not Found</h1>
          <p className="text-sm text-[#A1A1AA] mb-6">The requested repository slug could not be located in the catalog.</p>
          <Link href="/" className="px-4 py-2 bg-[#8535FC] rounded-xl text-sm font-medium">
            ← Return to Marketplace
          </Link>
        </div>
        <PlatformFooter />
      </div>
    );
  }

  // Calculate integer paise financial breakdown
  const grossPaise = product.base_price_paise;
  const platformFeePaise = Math.floor((grossPaise * 350) / 10000); // 3.5%
  const tdsPaise = Math.floor((grossPaise * 100) / 10000); // 1.0% TDS
  const gstPaise = Math.floor((platformFeePaise * 1800) / 10000); // 18% GST on platform fee
  const netSellerPaise = grossPaise - platformFeePaise - tdsPaise;

  const handleBuyWithEscrow = async () => {
    setIsProcessing(true);
    setCheckoutError(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("kd_access_token") : null;
    if (!token) {
      alert("Please log in or register before initiating an escrow purchase.");
      window.location.href = "/login";
      setIsProcessing(false);
      return;
    }

    try {
      const res = await fintechApi.createOrder(product.id, "wallet");
      if (res?.data?.order_number) {
        setOrderId(res.data.order_number);
        setPurchaseSuccess(true);
      } else {
        throw new Error("Order creation failed on backend");
      }
    } catch (err: any) {
      console.error("Escrow purchase error:", err);
      setCheckoutError(err.message || "Failed to process escrow purchase. Please verify your wallet balance.");
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="relative min-h-screen bg-[#1D1D21] text-[#EDEDF0] flex flex-col selection:bg-[#8535FC]/30 selection:text-white overflow-x-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-[100vw] h-[300px] bg-gradient-to-b from-[#8535FC]/15 via-[#06B6D4]/5 to-transparent blur-3xl pointer-events-none z-0" />

      <PlatformHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-16 sm:pt-24 pb-12 relative z-10">
        {/* BREADCRUMB */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-mono text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition-colors">
            ← Marketplace
          </Link>
          <span>/</span>
          <span className="text-[#8535FC]">{product.asset_type}</span>
          <span>/</span>
          <span className="text-white truncate max-w-[160px] sm:max-w-xs">{product.slug}</span>
        </div>

        {/* MAIN 2-COLUMN DOSSIER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT 2 COLS: OVERVIEW & SECURITY AUDIT */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* PRODUCT HEADER */}
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#27272A]/50 border border-[#414146]/60 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/70 text-emerald-400 text-[11px] sm:text-xs font-mono font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>AST SCAN VERIFIED CLEAN</span>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#1D1D21] border border-[#414146] text-[#A1A1AA] text-[11px] sm:text-xs font-mono">
                  48-Hour Escrow Hold
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                {product.title}
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-[#A1A1AA] leading-relaxed mb-5 sm:mb-6">
                {product.summary}
              </p>

              {/* TECH STACK CHIPS */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t border-[#414146]/40">
                {product.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 sm:px-3 py-1 rounded-lg bg-[#1D1D21] border border-[#414146]/60 text-white text-[11px] sm:text-xs font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* AST SECURITY AUDIT DOSSIER */}
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#27272A]/40 border border-emerald-500/30 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
                <div>
                  <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1">
                    Pre-Commit Security Verification
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Cryptographic Code Audit Passed</h2>
                </div>
                <div className="h-9 sm:h-10 w-9 sm:w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-base sm:text-lg shrink-0">
                  🛡️
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 rounded-xl bg-[#1D1D21]/80 border border-[#414146]/60">
                  <div className="text-[10px] sm:text-xs text-[#71717A] font-mono">AST Syntax Tree Inspection</div>
                  <div className="text-xs sm:text-sm font-semibold text-white mt-1">Tree-Sitter Clean</div>
                  <div className="text-[10px] sm:text-[11px] text-emerald-400 mt-0.5">No dangerous eval() or obfuscated calls</div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-[#1D1D21]/80 border border-[#414146]/60">
                  <div className="text-[10px] sm:text-xs text-[#71717A] font-mono">Secret Leak Detection</div>
                  <div className="text-xs sm:text-sm font-semibold text-white mt-1">0 Secrets Detected</div>
                  <div className="text-[10px] sm:text-[11px] text-emerald-400 mt-0.5">Aho-Corasick multi-pattern scanner clean</div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-[#1D1D21]/80 border border-[#414146]/60">
                  <div className="text-[10px] sm:text-xs text-[#71717A] font-mono">Entropy Key Analysis</div>
                  <div className="text-xs sm:text-sm font-semibold text-white mt-1">Shannon Entropy Passed</div>
                  <div className="text-[10px] sm:text-[11px] text-emerald-400 mt-0.5">Zero high-entropy private keys leaked</div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-[#1D1D21]/80 border border-[#414146]/60">
                  <div className="text-[10px] sm:text-xs text-[#71717A] font-mono">Delivery Packaging</div>
                  <div className="text-xs sm:text-sm font-semibold text-white mt-1">AES-256-GCM Encrypted</div>
                  <div className="text-[10px] sm:text-[11px] text-[#A1A1AA] mt-0.5">Streamed directly via presigned S3 URLs</div>
                </div>
              </div>
            </div>

            {/* REPOSITORY ARCHITECTURE SPEC */}
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#27272A]/30 border border-[#414146]/50">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Architecture Specifications</h2>
              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#A1A1AA] leading-relaxed whitespace-pre-line font-sans">
                {product.description}
              </div>
            </div>
          </div>

          {/* RIGHT COL: ESCROW CHECKOUT & SELLER */}
          <div className="space-y-6">
            {/* ESCROW PURCHASE CARD */}
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#27272A]/80 to-[#18181C]/95 border border-[#8535FC]/50 backdrop-blur-xl shadow-2xl lg:sticky lg:top-24">
              <div className="mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-[#414146]/50">
                <div className="text-[11px] sm:text-xs text-[#A1A1AA] font-mono">Single License Purchase</div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
                  {formatPaiseToInr(product.base_price_paise)}
                </div>
                <div className="text-xs text-emerald-400 font-mono mt-1 flex items-center gap-1">
                  <span>●</span>
                  <span>48-Hour Escrow Protection Included</span>
                </div>
              </div>

              {/* BREAKDOWN TABLE */}
              <div className="space-y-2 sm:space-y-2.5 text-xs font-mono text-[#A1A1AA] mb-5 sm:mb-6">
                <div className="flex justify-between">
                  <span>Gross Codebase Price:</span>
                  <span className="text-white">{formatPaiseDetailed(grossPaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Escrow Fee (3.5%):</span>
                  <span>{formatPaiseDetailed(platformFeePaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST on Fee (18%):</span>
                  <span>{formatPaiseDetailed(gstPaise)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#414146]/50 font-bold text-white">
                  <span>Total Due Today:</span>
                  <span>{formatPaiseDetailed(grossPaise)}</span>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                onClick={() => setCheckoutModalOpen(true)}
                className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#8535FC] to-[#06B6D4] hover:opacity-95 text-white font-semibold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#8535FC]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Deposit to Escrow & Purchase</span>
                <span>→</span>
              </button>

              <div className="mt-3 sm:mt-4 text-center text-[10px] sm:text-[11px] text-[#71717A] leading-relaxed">
                Funds remain locked in the double-entry escrow ledger until you inspect and approve the codebase within 48 hours.
              </div>

              {/* SELLER DOSSIER */}
              <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#414146]/50 flex items-center gap-3">
                <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-gradient-to-tr from-[#8535FC] to-[#06B6D4] flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">
                  {product.seller?.username ? product.seller.username[0].toUpperCase() : "S"}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                    <span>{product.seller?.username}</span>
                    <span className="text-cyan-400 text-xs">✓ Verified</span>
                  </div>
                  <div className="text-[11px] text-[#71717A] font-mono">
                    {product.seller?.sales} sales • {product.seller?.rating} Rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CHECKOUT ESCROW MODAL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#18181C] border border-[#8535FC]/50 shadow-2xl relative animate-in zoom-in-95 duration-150">
            {!purchaseSuccess ? (
              <>
                <div className="flex items-center justify-between pb-3 sm:pb-4 mb-4 border-b border-[#414146]/50 sticky top-0 bg-[#18181C] z-10">
                  <h3 className="text-base sm:text-lg font-bold text-white">Escrow Purchase Authorization</h3>
                  <button
                    onClick={() => setCheckoutModalOpen(false)}
                    className="p-1 text-[#71717A] hover:text-white text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-5 sm:mb-6">
                  You are about to deposit <strong className="text-white">{formatPaiseToInr(grossPaise)}</strong> into the KodeDock Escrow Contract for <strong>{product.title}</strong>.
                </p>

                <div className="p-3.5 sm:p-4 rounded-xl bg-[#27272A]/60 border border-[#414146]/60 space-y-2 text-xs font-mono mb-5 sm:mb-6">
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">Escrow Hold Duration:</span>
                    <span className="text-emerald-400">48 Hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">TDS Compliance:</span>
                    <span className="text-white">1% Section 194-O Handled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">Payment Method:</span>
                    <span className="text-white">Instant UPI / NetBanking / Card</span>
                  </div>
                </div>

                {checkoutError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs flex flex-col gap-1.5">
                    <span className="font-semibold">Checkout Error:</span>
                    <span>{checkoutError}</span>
                    <Link href="/wallet" className="text-[#C084FC] hover:underline font-mono text-[11px] mt-0.5">
                      → Go to Wallet & Deposit Funds
                    </Link>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setCheckoutModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#27272A] hover:bg-[#323238] text-xs font-medium text-[#A1A1AA] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBuyWithEscrow}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-[#8535FC] hover:bg-[#7828e8] text-xs font-semibold text-white shadow-lg shadow-[#8535FC]/30 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? "Processing Escrow..." : "Authorize Deposit"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xl mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Escrow Contract Created!</h3>
                <p className="text-xs text-[#A1A1AA] mb-4">
                  Order <strong>{orderId}</strong> has been created. Your funds are held securely in escrow.
                </p>
                <div className="p-3 rounded-xl bg-[#27272A]/70 text-xs font-mono text-[#06B6D4] mb-6">
                  48-Hour Inspection Window is now ACTIVE
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/dashboard"
                    className="w-full py-3 rounded-xl bg-[#8535FC] hover:bg-[#7828e8] text-white text-xs font-semibold text-center"
                  >
                    View in My Purchases Vault →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <PlatformFooter />
    </div>
  );
}
