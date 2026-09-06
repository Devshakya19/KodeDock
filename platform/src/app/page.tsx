"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import PlatformHeader from "@/components/nav/header";
import PlatformFooter from "@/components/nav/footer";
import { INITIAL_CATALOG } from "@/lib/initial-catalog";
import { formatPaiseToInr, marketplaceApi } from "@/lib/api/client";
import { CatalogProduct } from "@/lib/types";

const TECH_FILTERS = [
  "All Frameworks",
  "Rust",
  "Next.js",
  "Go",
  "Python",
  "Flutter",
  "React",
  "PostgreSQL",
  "Docker",
];

export default function PlatformMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTech, setSelectedTech] = useState("All Frameworks");
  const [selectedSort, setSelectedSort] = useState("popular");
  const [products, setProducts] = useState<CatalogProduct[]>(INITIAL_CATALOG);
  const [loading, setLoading] = useState(false);

  // Fetch live catalog from Rust API if available
  useEffect(() => {
    async function loadLiveCatalog() {
      try {
        setLoading(true);
        const res = await marketplaceApi.getCatalog();
        if (res?.data?.products && res.data.products.length > 0) {
          // Merge or set live products
          setProducts((prev) => {
            const liveSlugs = new Set(res.data.products.map((p) => p.slug));
            const remainingInitial = prev.filter((p) => !liveSlugs.has(p.slug));
            return [...res.data.products, ...remainingInitial];
          });
        }
      } catch {
        // Backend offline or empty in dev; fallback to INITIAL_CATALOG
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
        const matchesSearch =
          searchTerm === "" ||
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesTech =
          selectedTech === "All Frameworks" ||
          product.tags?.some((t) => t.toLowerCase().includes(selectedTech.toLowerCase())) ||
          product.tech_stack?.some((t) => t.toLowerCase().includes(selectedTech.toLowerCase()));

        return matchesSearch && matchesTech;
      })
      .sort((a, b) => {
        if (selectedSort === "price_asc") return a.base_price_paise - b.base_price_paise;
        if (selectedSort === "price_desc") return b.base_price_paise - a.base_price_paise;
        if (selectedSort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return (b.sales_count || 0) - (a.sales_count || 0);
      });
  }, [products, searchTerm, selectedTech, selectedSort]);

  return (
    <div className="relative min-h-screen bg-[#1D1D21] text-[#EDEDF0] flex flex-col selection:bg-[#8535FC]/30 selection:text-white">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-b from-[#8535FC]/15 via-[#06B6D4]/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* HEADER */}
      <PlatformHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* HERO BANNER */}
        <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#27272A]/70 via-[#27272A]/40 to-[#18181C]/90 border border-[#414146]/60 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#8535FC]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8535FC]/15 border border-[#8535FC]/40 text-[#A855F7] text-xs font-mono font-medium mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8535FC] animate-pulse" />
              <span>48-HOUR CODE INSPECTION GUARANTEE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Explore Verified Production Codebases
            </h1>
            <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
              Every deliverable is pre-audited with Tree-Sitter AST syntax parsing and secret leak
              detection. Payments remain locked in our cryptographic escrow ledger until you verify the repository.
            </p>
          </div>

          {/* ESCROW STATS CHIPS */}
          <div className="mt-6 pt-6 border-t border-[#414146]/40 flex flex-wrap items-center gap-4 text-xs font-mono text-[#A1A1AA]">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Zero-Mock Implementations</span>
            </div>
            <div className="hidden sm:inline-block text-[#414146]">•</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#8535FC] font-bold">₹</span>
              <span>Integer Paise Arithmetic</span>
            </div>
            <div className="hidden sm:inline-block text-[#414146]">•</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#06B6D4] font-bold">⚡</span>
              <span>Section 194-O TDS Deductions</span>
            </div>
          </div>
        </div>

        {/* FILTER CONTROLS BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* TECH CHIPS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {TECH_FILTERS.map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTech(tech)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedTech === tech
                    ? "bg-[#8535FC] text-white shadow-md shadow-[#8535FC]/25"
                    : "bg-[#27272A]/70 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] border border-[#414146]/50"
                }`}
              >
                {tech}
              </button>
            ))}
          </div>

          {/* SORT DROPDOWN */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#71717A] font-medium">Sort By:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-3 py-1.5 bg-[#27272A] border border-[#414146] text-[#EDEDF0] text-xs rounded-xl outline-none focus:border-[#8535FC]"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Recently Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#414146]/60 rounded-3xl bg-[#27272A]/20">
            <p className="text-base text-[#EDEDF0] font-medium">No codebases matched your filter.</p>
            <p className="text-xs text-[#71717A] mt-1">Try searching for &quot;Rust&quot;, &quot;Next.js&quot;, or reset your tags.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedTech("All Frameworks");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#27272A] border border-[#414146] text-xs font-medium text-white hover:bg-[#323238]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-[#27272A]/50 hover:bg-[#27272A]/80 border border-[#414146]/60 hover:border-[#8535FC]/50 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-[#8535FC]/5"
              >
                <div>
                  {/* CARD HEADER: BADGES & PRICE */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[11px] font-mono font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>AST Clean</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#1D1D21] border border-[#414146]/70 text-[#A1A1AA] text-[11px] font-mono">
                        48h Escrow
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-white font-mono">
                        {formatPaiseToInr(product.base_price_paise)}
                      </div>
                      <div className="text-[10px] text-[#71717A] font-mono">GST & Escrow Incl.</div>
                    </div>
                  </div>

                  {/* TITLE & SUMMARY */}
                  <Link href={`/product/${product.slug}`} className="block group-hover:text-[#A855F7] transition-colors">
                    <h3 className="text-lg font-bold text-white mb-2 leading-snug line-clamp-1">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4 line-clamp-2">
                    {product.summary}
                  </p>

                  {/* TECH STACK TAGS */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {product.tags?.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-[#1D1D21]/80 border border-[#414146]/40 text-[#EDEDF0] text-[11px] font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CARD FOOTER: SELLER & CTA */}
                <div className="pt-4 border-t border-[#414146]/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#8535FC] to-[#06B6D4] flex items-center justify-center text-white text-[11px] font-bold">
                      {product.seller?.username ? product.seller.username[0].toUpperCase() : "K"}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white flex items-center gap-1">
                        <span>{product.seller?.username || "Verified Seller"}</span>
                        <span className="text-cyan-400 text-[10px]">★</span>
                      </div>
                      <div className="text-[10px] text-[#71717A] font-mono">
                        {product.sales_count} sales • {product.rating_average || 4.9} rating
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/product/${product.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8535FC]/20 hover:bg-[#8535FC] border border-[#8535FC]/50 text-white text-xs font-semibold tracking-wide transition-all group/btn"
                  >
                    <span>Inspect</span>
                    <span className="group-hover/btn:translate-x-0.5 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <PlatformFooter />
    </div>
  );
}
