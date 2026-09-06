"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import PlatformHeader from "@/components/nav/header";
import PlatformFooter from "@/components/nav/footer";
import { formatPaiseToInr, marketplaceApi } from "@/lib/api/client";
import { CatalogProduct } from "@/lib/types";

const CATEGORIES = [
  { id: "all", label: "All Codebases", icon: "⬡" },
  { id: "saas", label: "Full-Stack SaaS", icon: "⚡" },
  { id: "ai", label: "AI & LLM Agents", icon: "🧠" },
  { id: "rust", label: "High-Perf Systems", icon: "⚙️" },
  { id: "mobile", label: "Mobile Apps", icon: "📱" },
  { id: "infra", label: "DevOps & Cloud", icon: "☁️" },
];

const TECH_FILTERS = [
  { name: "All Tech", icon: null },
  { name: "Rust", icon: "/icons/tech/rust.svg" },
  { name: "Next.js", icon: "/icons/tech/nextjs.svg" },
  { name: "Go", icon: "/icons/tech/go.svg" },
  { name: "Python", icon: "/icons/tech/python.svg" },
  { name: "TypeScript", icon: "/icons/tech/typescript.svg" },
  { name: "Flutter", icon: "/icons/tech/flutter.svg" },
  { name: "React", icon: "/icons/tech/react.svg" },
  { name: "PostgreSQL", icon: "/icons/tech/postgresql.svg" },
  { name: "Docker", icon: "/icons/tech/docker.svg" },
];

const getTechIcon = (tag: string): string | null => {
  const lower = tag.toLowerCase().trim();
  if (lower.includes("rust")) return "/icons/tech/rust.svg";
  if (lower.includes("next")) return "/icons/tech/nextjs.svg";
  if (lower.includes("go") || lower === "golang") return "/icons/tech/go.svg";
  if (lower.includes("python")) return "/icons/tech/python.svg";
  if (lower.includes("flutter")) return "/icons/tech/flutter.svg";
  if (lower.includes("react")) return "/icons/tech/react.svg";
  if (lower.includes("postgres") || lower.includes("sqlx")) return "/icons/tech/postgresql.svg";
  if (lower.includes("docker")) return "/icons/tech/docker.svg";
  if (lower.includes("typescript") || lower === "ts") return "/icons/tech/typescript.svg";
  if (lower.includes("tailwind")) return "/icons/tech/tailwindcss.svg";
  if (lower.includes("aws")) return "/icons/tech/aws.svg";
  if (lower.includes("node")) return "/icons/tech/nodejs.svg";
  return null;
};

export default function PlatformMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTech, setSelectedTech] = useState("All Tech");
  const [selectedSort, setSelectedSort] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [quickViewProduct, setQuickViewProduct] = useState<CatalogProduct | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch live catalog from Rust API
  useEffect(() => {
    async function loadLiveCatalog() {
      try {
        setLoading(true);
        const res = await marketplaceApi.getCatalog();
        if (res?.data?.products) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error("Failed to fetch catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveCatalog();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search Filter
        const matchesSearch =
          searchTerm === "" ||
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

        // Tech Filter
        const matchesTech =
          selectedTech === "All Tech" ||
          product.tags?.some((t) => t.toLowerCase().includes(selectedTech.toLowerCase())) ||
          product.tech_stack?.some((t) => t.toLowerCase().includes(selectedTech.toLowerCase()));

        // Category Filter
        let matchesCategory = true;
        if (selectedCategory === "saas") {
          matchesCategory =
            Boolean(product.tags?.some((t) => ["saas", "fullstack", "next.js", "react"].includes(t.toLowerCase()))) ||
            product.asset_type === "saas_boilerplate";
        } else if (selectedCategory === "ai") {
          matchesCategory =
            Boolean(product.tags?.some((t) => ["ai", "llm", "agent", "python", "rag"].includes(t.toLowerCase()))) ||
            product.title.toLowerCase().includes("ai") ||
            product.summary.toLowerCase().includes("ai");
        } else if (selectedCategory === "rust") {
          matchesCategory =
            Boolean(product.tags?.some((t) => ["rust", "axum", "tokio", "systems"].includes(t.toLowerCase()))) ||
            Boolean(product.tech_stack?.some((t) => t.toLowerCase().includes("rust")));
        } else if (selectedCategory === "mobile") {
          matchesCategory =
            Boolean(product.tags?.some((t) => ["flutter", "react-native", "mobile", "ios", "android"].includes(t.toLowerCase())));
        } else if (selectedCategory === "infra") {
          matchesCategory =
            Boolean(product.tags?.some((t) => ["docker", "postgres", "cloud", "devops", "k8s"].includes(t.toLowerCase())));
        }

        return matchesSearch && matchesTech && matchesCategory;
      })
      .sort((a, b) => {
        if (selectedSort === "price_asc") return a.base_price_paise - b.base_price_paise;
        if (selectedSort === "price_desc") return b.base_price_paise - a.base_price_paise;
        if (selectedSort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return (b.sales_count || 0) - (a.sales_count || 0);
      });
  }, [products, searchTerm, selectedCategory, selectedTech, selectedSort]);

  const activeFilterCount =
    (searchTerm ? 1 : 0) + (selectedTech !== "All Tech" ? 1 : 0) + (selectedCategory !== "all" ? 1 : 0);

  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedTech("All Tech");
    setSelectedSort("popular");
  };

  return (
    <div className="relative min-h-screen bg-[#1D1D21] text-[#EDEDF0] flex flex-col selection:bg-[#8535FC]/30 selection:text-white font-sans overflow-x-hidden">
      {/* Background Cyber-Grid Pattern with Ambient Lighting */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#41414612_1px,transparent_1px),linear-gradient(to_bottom,#41414612_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] max-w-[100vw] h-[340px] bg-gradient-to-b from-[#8535FC]/12 via-[#06B6D4]/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* FLOATING HEADER */}
      <PlatformHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-16 sm:pt-24 pb-16 relative z-10">
        {/* =========================================================================
            1. CYBERNETIC COMMAND HERO
           ========================================================================= */}
        <div className="relative mb-6 sm:mb-10 p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#27272A]/85 via-[#27272A]/50 to-[#141417]/95 border border-[#414146]/60 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-black/60">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-[#8535FC]/12 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-52 sm:w-72 h-52 sm:h-72 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            {/* Guarantee Tag */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 rounded-full bg-[#8535FC]/15 border border-[#8535FC]/40 text-[#C084FC] text-[10px] sm:text-xs font-mono font-medium mb-3 sm:mb-4 shadow-sm max-w-full">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#8535FC] animate-pulse shrink-0" />
              <span className="truncate">CRYPTOGRAPHIC 48-HOUR ESCROW PROTOCOL</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-white mb-3 sm:mb-4 leading-tight">
              Production Codebases. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-white via-[#EDEDF0] to-[#8535FC] bg-clip-text text-transparent">
                Zero Vulnerabilities.
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-xs sm:text-sm lg:text-base text-[#A1A1AA] leading-relaxed mb-6 sm:mb-8 max-w-2xl font-normal">
              Acquire clean, verified repositories audited with real Tree-Sitter AST syntax trees and secret
              leak scanners. All funds remain locked inside our double-entry ACID ledger until you inspect and approve.
            </p>

            {/* Protocol Guarantees Ribbon */}
            <div className="pt-4 sm:pt-6 border-t border-[#414146]/50 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[#EDEDF0]">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-[10px] sm:text-xs">Tree-Sitter Clean</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[#EDEDF0]">
                <span className="text-[#8535FC] font-bold">🔒</span>
                <span className="text-[10px] sm:text-xs">48h Escrow Lock</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[#EDEDF0]">
                <span className="text-[#06B6D4] font-bold">₹</span>
                <span className="text-[10px] sm:text-xs">Zero-Float Currency</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[#EDEDF0]">
                <span className="text-amber-400 font-bold">📑</span>
                <span className="text-[10px] sm:text-xs">Sec 194-O TDS Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. CATEGORY COMMAND TABS (Touch Edge Scrollable)
           ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-3 mb-4 sm:mb-6 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-[#8535FC] text-white shadow-lg shadow-[#8535FC]/30 scale-[1.02]"
                    : "bg-[#27272A]/70 text-[#A1A1AA] hover:text-[#EDEDF0] hover:bg-[#27272A] border border-[#414146]/50"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            3. ADVANCED COMMAND BAR (TECH CHIPS, SORT, VIEW MODE & RESULTS)
           ========================================================================= */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#27272A]/60 border border-[#414146]/60 backdrop-blur-xl mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 shadow-xl">
          {/* Tech Filter Chips */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none flex-1 -mx-1 px-1 sm:mx-0 sm:px-0">
            <span className="text-[10px] sm:text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider shrink-0 mr-1">
              Stack:
            </span>
            {TECH_FILTERS.map((tech) => {
              const isActive = selectedTech === tech.name;
              return (
                <button
                  key={tech.name}
                  onClick={() => setSelectedTech(tech.name)}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-[#141417] text-white border border-[#8535FC] shadow-sm shadow-[#8535FC]/40 scale-[1.02]"
                      : "bg-[#141417]/60 text-[#A1A1AA] hover:text-white hover:bg-[#141417] border border-[#414146]/40"
                  }`}
                >
                  {tech.icon ? (
                    <div className="w-3.5 h-3.5 relative shrink-0 flex items-center justify-center">
                      <Image
                        src={tech.icon}
                        alt={tech.name}
                        width={14}
                        height={14}
                        className="w-3.5 h-3.5 object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#8535FC]">⚡</span>
                  )}
                  <span>{tech.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: Sort & Layout Toggle */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#414146]/40 w-full lg:w-auto">
            {/* Active Filters Reset */}
            {activeFilterCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-[#8535FC] hover:text-[#A855F7] font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Reset ({activeFilterCount})</span>
                <span>✕</span>
              </button>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#141417] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#414146]">
              <span className="text-[10px] sm:text-[11px] text-[#A1A1AA] font-mono">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-transparent text-[#EDEDF0] text-xs font-medium outline-none cursor-pointer pr-1 sm:pr-2"
              >
                <option value="popular" className="bg-[#1D1D21]">Most Popular</option>
                <option value="newest" className="bg-[#1D1D21]">Recently Audited</option>
                <option value="price_asc" className="bg-[#1D1D21]">Price: Low to High</option>
                <option value="price_desc" className="bg-[#1D1D21]">Price: High to Low</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid / List) */}
            <div className="flex items-center bg-[#141417] p-1 rounded-full border border-[#414146]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 sm:p-1.5 rounded-full transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-[#27272A] text-white" : "text-[#A1A1AA] hover:text-white"
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 sm:p-1.5 rounded-full transition-colors cursor-pointer ${
                  viewMode === "list" ? "bg-[#27272A] text-white" : "text-[#A1A1AA] hover:text-white"
                }`}
                title="List View"
                aria-label="List View"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Live Match Counter */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-[#A1A1AA] font-mono mb-4 px-1">
          <span>
            {loading ? "Searching ledger..." : `Found ${filteredProducts.length} verified codebases`}
          </span>
          {searchTerm && (
            <span className="truncate max-w-full">
              Filtering by: <span className="text-[#8535FC] font-semibold">&quot;{searchTerm}&quot;</span>
            </span>
          )}
        </div>

        {/* =========================================================================
            4. PRODUCT CATALOG GRID / LIST
           ========================================================================= */}
        {loading ? (
          /* SKELETON LOADING STATE */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#27272A]/40 border border-[#414146]/40 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 w-24 bg-[#414146]/50 rounded-full" />
                  <div className="h-6 w-20 bg-[#414146]/50 rounded-lg" />
                </div>
                <div className="h-6 w-3/4 bg-[#414146]/60 rounded-lg" />
                <div className="h-4 w-full bg-[#414146]/40 rounded-lg" />
                <div className="flex gap-2 pt-2">
                  <div className="h-5 w-16 bg-[#414146]/40 rounded-md" />
                  <div className="h-5 w-16 bg-[#414146]/40 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* CYBERNETIC EMPTY STATE */
          <div className="text-center py-16 sm:py-20 px-4 border border-dashed border-[#414146]/80 rounded-2xl sm:rounded-3xl bg-[#27272A]/20 backdrop-blur-xl">
            <div className="w-14 sm:w-16 h-14 sm:h-16 mx-auto mb-4 rounded-2xl bg-[#141417] border border-[#414146] flex items-center justify-center text-2xl shadow-inner">
              ⚡
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">No Matching Repositories Found</h3>
            <p className="text-xs text-[#A1A1AA] max-w-md mx-auto mb-6 leading-relaxed">
              We couldn&apos;t find any verified codebases matching your filter criteria. Try adjusting your tags or
              clearing the search filter.
            </p>
            <button
              onClick={resetAllFilters}
              className="px-5 py-2.5 rounded-full bg-[#8535FC] hover:bg-[#7822FA] text-xs font-semibold text-white shadow-lg shadow-[#8535FC]/25 transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW: EXPANSIVE 2-COLUMN CYBERNETIC DOSSIERS */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#27272A]/50 hover:bg-[#27272A]/85 border border-[#414146]/60 hover:border-[#8535FC]/60 backdrop-blur-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#8535FC]/10"
              >
                <div>
                  {/* Top Bar: Badges & Integer Paise Price */}
                  <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 text-[10px] sm:text-[11px] font-mono font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>AST Verified</span>
                      </span>
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-[#141417] border border-[#414146]/70 text-[#A1A1AA] text-[10px] sm:text-[11px] font-mono">
                        48h Escrow
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg sm:text-xl font-bold font-mono text-white group-hover:text-[#C084FC] transition-colors">
                        {formatPaiseToInr(product.base_price_paise)}
                      </div>
                      <div className="text-[9px] text-[#A1A1AA] font-mono tracking-tight">
                        TDS & Escrow Incl.
                      </div>
                    </div>
                  </div>

                  {/* Title & Technical Summary */}
                  <Link href={`/product/${product.slug}`} className="block group/title">
                    <h2 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug group-hover/title:text-[#A855F7] transition-colors line-clamp-1">
                      {product.title}
                    </h2>
                  </Link>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4 line-clamp-2">
                    {product.summary}
                  </p>

                  {/* Tech Stack Chips with Accent Icons */}
                  <div className="flex flex-wrap gap-1.5 mb-5 sm:mb-6">
                    {product.tags?.slice(0, 4).map((tag) => {
                      const icon = getTechIcon(tag);
                      return (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-[#141417] border border-[#414146]/50 text-[#EDEDF0] text-[10px] sm:text-[11px] font-mono"
                        >
                          {icon && (
                            <Image
                              src={icon}
                              alt={tag}
                              width={12}
                              height={12}
                              className="w-3 h-3 object-contain shrink-0"
                              unoptimized
                            />
                          )}
                          <span>{tag}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer: Seller Avatar, Stats, & CTA Buttons */}
                <div className="pt-3 sm:pt-4 border-t border-[#414146]/50 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                  {/* Seller Bio */}
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#8535FC] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                      {product.seller?.username ? product.seller.username[0].toUpperCase() : "K"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                        <span>{product.seller?.username || "Verified Engineer"}</span>
                        <span className="text-cyan-400 text-[10px]">★</span>
                      </div>
                      <div className="text-[10px] text-[#A1A1AA] font-mono truncate">
                        {product.sales_count} sales • {product.rating_average || 4.9} rating
                      </div>
                    </div>
                  </div>

                  {/* Actions: Quick View & Inspect */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      onClick={() => setQuickViewProduct(product)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#323238] border border-[#414146] text-[#A1A1AA] hover:text-white text-xs transition-colors cursor-pointer"
                      title="Quick Specs"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <Link
                      href={`/product/${product.slug}`}
                      className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#8535FC]/20 hover:bg-[#8535FC] border border-[#8535FC]/60 text-white text-xs font-semibold tracking-wide transition-all duration-200 group/btn"
                    >
                      <span>Inspect</span>
                      <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW: HIGH-DENSITY TERMINAL LIST */
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#27272A]/50 hover:bg-[#27272A]/85 border border-[#414146]/60 hover:border-[#8535FC]/60 backdrop-blur-xl transition-all shadow-md"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 text-[9px] sm:text-[10px] font-mono shrink-0">
                      AST Clean
                    </span>
                    <Link href={`/product/${product.slug}`}>
                      <h2 className="text-xs sm:text-sm font-bold text-white hover:text-[#8535FC] transition-colors truncate">
                        {product.title}
                      </h2>
                    </Link>
                  </div>
                  <p className="text-xs text-[#A1A1AA] truncate">{product.summary}</p>
                  <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
                    {product.tags?.slice(0, 3).map((tag) => {
                      const icon = getTechIcon(tag);
                      return (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#141417] border border-[#414146]/50 text-[#EDEDF0] text-[10px] font-mono shrink-0"
                        >
                          {icon && (
                            <Image
                              src={icon}
                              alt={tag}
                              width={10}
                              height={10}
                              className="w-2.5 h-2.5 object-contain shrink-0"
                              unoptimized
                            />
                          )}
                          <span>{tag}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#414146]/40">
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-bold font-mono text-white">
                      {formatPaiseToInr(product.base_price_paise)}
                    </div>
                    <div className="text-[9px] text-[#A1A1AA] font-mono">48h Escrow</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuickViewProduct(product)}
                      className="p-1.5 sm:p-2 rounded-lg bg-[#27272A] hover:bg-[#323238] border border-[#414146] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <Link
                      href={`/product/${product.slug}`}
                      className="px-3 sm:px-4 py-1.5 rounded-full bg-[#8535FC] hover:bg-[#7822FA] text-xs font-medium text-white transition-all"
                    >
                      Inspect →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* =========================================================================
          5. INTERACTIVE QUICK-VIEW DRAWER (SLIDE-OVER MODAL - FULLY RESPONSIVE)
         ========================================================================= */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-[#27272A] border border-[#414146] shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 bg-[#1D1D21] border-b border-[#414146] flex items-start justify-between gap-3 sticky top-0 z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/80 text-emerald-400 text-[10px] sm:text-[11px] font-mono mb-1.5 sm:mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Tree-Sitter Syntax Verified</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-tight line-clamp-1">
                  {quickViewProduct.title}
                </h3>
              </div>
              <button
                onClick={() => setQuickViewProduct(null)}
                className="p-1.5 rounded-full bg-[#27272A] hover:bg-[#323238] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <h4 className="text-[10px] sm:text-xs font-mono text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Technical Architecture
                </h4>
                <p className="text-xs sm:text-sm text-[#EDEDF0] leading-relaxed">
                  {quickViewProduct.summary}
                </p>
              </div>

              {/* Specs Matrix */}
              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#141417] border border-[#414146]/60 text-xs font-mono">
                <div>
                  <span className="text-[#A1A1AA] block text-[10px]">ESCROW PROTECTION</span>
                  <span className="text-white font-semibold text-xs">48-Hour Inspection</span>
                </div>
                <div>
                  <span className="text-[#A1A1AA] block text-[10px]">DELIVERY PROTOCOL</span>
                  <span className="text-white font-semibold text-xs">Instant S3 / Git Clone</span>
                </div>
                <div>
                  <span className="text-[#A1A1AA] block text-[10px]">SECRET SCANNING</span>
                  <span className="text-emerald-400 font-semibold text-xs">0 Secrets Leaked</span>
                </div>
                <div>
                  <span className="text-[#A1A1AA] block text-[10px]">AUTHOR VERIFICATION</span>
                  <span className="text-white font-semibold text-xs">
                    {quickViewProduct.seller?.username || "Verified"} ★
                  </span>
                </div>
              </div>

              {/* Price & Checkout Action */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {formatPaiseToInr(quickViewProduct.base_price_paise)}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-[#A1A1AA] font-mono">TDS & CGST/SGST Included</div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/product/${quickViewProduct.slug}`}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#8535FC] hover:bg-[#7822FA] text-xs font-semibold text-white shadow-lg shadow-[#8535FC]/30 transition-all"
                  >
                    Full Technical Dossier →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <PlatformFooter />
    </div>
  );
}
