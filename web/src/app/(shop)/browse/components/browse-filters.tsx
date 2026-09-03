"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ArrowRight, ChevronDown, Check } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface BrowseFiltersProps {
  activeCategory: string;
  activeSort?: string;
  activeSearch?: string;
}

const DEFAULT_CATEGORIES = [
  { label: "All Assets", value: "" },
  { label: "API Templates", value: "api-templates" },
  { label: "B.Tech Projects", value: "btech-projects" },
  { label: "Boilerplates", value: "boilerplates" },
  { label: "Mobile Apps", value: "mobile-apps" },
  { label: "UI Kits", value: "ui-kits" },
  { label: "Web Templates", value: "web-templates" },
];

const SORT_OPTIONS = [
  { label: "Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_low" },
  { label: "Price: High to Low", value: "price_high" },
  { label: "Top Rated", value: "rating" },
];

export function BrowseFilters({
  activeCategory,
  activeSort = "popular",
  activeSearch = "",
}: BrowseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic categories from backend
  useEffect(() => {
    fetch("/api/proxy/public/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && Array.isArray(data.data)) {
          const fetchedCats = data.data.map((c: any) => ({
            label: c.name,
            value: c.slug,
          }));
          setCategories([{ label: "All Assets", value: "" }, ...fetchedCats]);
        }
      })
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCategoryChange(categoryValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryValue) {
      params.set("category", categoryValue);
    } else {
      params.delete("category");
    }
    router.push(`/browse?${params.toString()}`);
  }

  function handleSortChange(sortValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (sortValue && sortValue !== "popular") {
      params.set("sort", sortValue);
    } else {
      params.delete("sort");
    }
    setSortOpen(false);
    router.push(`/browse?${params.toString()}`);
  }

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === (searchParams.get("sort") || "popular"))?.label ||
    "Popular";

  return (
    <div className="space-y-6 mb-8">
      {/* Section Header: Trending Products ● + View All */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] sm:text-[24px] font-black text-white tracking-tight">
            {activeSearch
              ? `Search Results for "${activeSearch}"`
              : activeCategory
                ? categories.find((c) => c.value === activeCategory)?.label || "Filtered Products"
                : "Trending Products"}
          </h2>
          <p className="text-[13px] sm:text-[14px] text-slate-400 font-medium mt-1">
            Handpicked digital assets loved by developers this week.
          </p>
        </div>

        <Link
          href="/browse"
          className="inline-flex items-center gap-1 text-[13px] sm:text-[14px] font-bold text-violet-400 hover:text-violet-300 transition-colors group"
        >
          View All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Filter Tabs Bar + Sort Dropdown */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Horizontal Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-2 text-[13px] font-bold rounded-xl whitespace-nowrap shrink-0 transition-all duration-200 ${
                  isActive
                    ? "bg-violet-600 text-white shadow-[0_0_20px_-3px_rgba(139,92,246,0.5)] border border-violet-400/40"
                    : "bg-[#120f20] text-slate-400 hover:text-slate-200 hover:bg-[#1a162e] border border-[#231f38]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right Sort Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto" ref={sortRef}>
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold text-slate-300 bg-[#120f20] hover:bg-[#1a162e] border border-[#231f38] transition-colors"
            >
              <span className="text-slate-400">Sort by:</span>
              <span className="text-white font-bold">{currentSortLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  sortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#110f1c] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-[#27233c] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortChange(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-[12px] font-semibold rounded-xl transition-colors ${
                      (searchParams.get("sort") || "popular") === opt.value
                        ? "bg-violet-600/20 text-violet-300 font-bold"
                        : "text-slate-300 hover:bg-[#1b172e] hover:text-white"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {(searchParams.get("sort") || "popular") === opt.value && (
                      <Check className="w-3.5 h-3.5 text-violet-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="w-9 h-9 rounded-xl bg-[#120f20] hover:bg-[#1a162e] border border-[#231f38] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            title="Filter Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
