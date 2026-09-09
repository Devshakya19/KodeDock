"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
  Star,
  ShieldCheck,
  Zap,
  RotateCcw,
  Search,
} from "lucide-react";

export interface FilterCategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface PriceRangeOption {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const PRICE_RANGES: PriceRangeOption[] = [
  { id: "all", label: "All Budgets", min: 0, max: Infinity },
  { id: "under_1000", label: "Under ₹1,000", min: 0, max: 100000 },
  { id: "1000_2500", label: "₹1,000 – ₹2,500", min: 100000, max: 250000 },
  { id: "2500_5000", label: "₹2,500 – ₹5,000", min: 250000, max: 500000 },
  { id: "above_5000", label: "Above ₹5,000", min: 500000, max: Infinity },
];

export const RATING_TIERS = [
  { value: 0, label: "Any Rating" },
  { value: 4.5, label: "4.5 & up" },
  { value: 4.0, label: "4.0 & up" },
  { value: 3.0, label: "3.0 & up" },
];

export interface ExploreFiltersProps {
  categories: FilterCategory[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;

  selectedPriceType: string; // 'all' | 'paid' | 'free'
  onSelectPriceType: (type: string) => void;

  selectedPriceRange: string;
  onSelectPriceRange: (rangeId: string) => void;

  availableLanguages: string[];
  selectedTechs: string[];
  onToggleTech: (tech: string) => void;
  onClearTechs: () => void;

  selectedRating: number;
  onSelectRating: (rating: number) => void;

  verifiedOnly: boolean;
  onToggleVerified: (val: boolean) => void;

  astOnly: boolean;
  onToggleAst: (val: boolean) => void;

  activeFiltersCount: number;
  onResetAll: () => void;

  totalProductsCount: number;
  filteredCount: number;

  getCategoryCount?: (catName: string) => number;
  getTechCount?: (tech: string) => number;
  getRatingCount?: (minRating: number) => number;
}

export default function ExploreFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedPriceType,
  onSelectPriceType,
  selectedPriceRange,
  onSelectPriceRange,
  availableLanguages,
  selectedTechs,
  onToggleTech,
  onClearTechs,
  selectedRating,
  onSelectRating,
  verifiedOnly,
  onToggleVerified,
  astOnly,
  onToggleAst,
  activeFiltersCount,
  onResetAll,
  totalProductsCount,
  filteredCount,
  getCategoryCount,
  getTechCount,
  getRatingCount,
}: ExploreFiltersProps) {
  // Collapsible section visibility states
  const [openSections, setOpenSections] = useState({
    categories: true,
    languages: true,
    pricing: true,
    ratings: true,
    verification: true,
  });

  // Expand / view more states
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Filter languages by search term if user types in search box
  const filteredLanguages = availableLanguages.filter((lang) =>
    lang.toLowerCase().includes(languageSearch.toLowerCase().trim())
  );

  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, 5);

  const displayedLanguages = showAllLanguages
    ? filteredLanguages
    : filteredLanguages.slice(0, 6);

  return (
    <div className="w-full space-y-5 text-xs text-[#EDEDF0]">
      {/* 1. Sidebar Header: Title, Active Badge & Reset Action */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#414146]">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-[#141417] border border-[#414146] flex items-center justify-center text-[#8535FC]">
            <SlidersHorizontal size={14} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-[#EDEDF0] leading-none">
              Filters
            </h3>
            <p className="text-[10px] text-[#71717A] font-mono mt-0.5">
              {filteredCount} of {totalProductsCount} packages
            </p>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#8535FC]/10 hover:bg-[#8535FC]/20 text-[#8535FC] text-[11px] font-mono font-medium transition-colors"
            title="Reset all filters"
          >
            <RotateCcw size={11} />
            <span>Reset ({activeFiltersCount})</span>
          </button>
        )}
      </div>

      {/* 2. Categories Section */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection("categories")}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#A1A1AA] group-hover:text-[#EDEDF0] font-semibold transition-colors">
            Categories
          </span>
          <div className="flex items-center gap-1.5 text-[#71717A]">
            <span className="text-[10px] font-mono">({categories.length})</span>
            {openSections.categories ? (
              <ChevronUp size={13} />
            ) : (
              <ChevronDown size={13} />
            )}
          </div>
        </button>

        {openSections.categories && (
          <div className="space-y-1 pt-1">
            {/* "All Categories" Pill */}
            <button
              type="button"
              onClick={() => onSelectCategory("all")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                selectedCategory === "all"
                  ? "bg-[#8535FC] text-white font-semibold shadow-sm"
                  : "text-[#A1A1AA] hover:text-[#EDEDF0] hover:bg-[#141417]"
              }`}
            >
              <span className="text-xs">All Categories</span>
              <span
                className={`text-[11px] font-mono ${
                  selectedCategory === "all" ? "text-white/80" : "text-[#71717A]"
                }`}
              >
                {totalProductsCount}
              </span>
            </button>

            {/* Individual Category Options */}
            {displayedCategories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              const count = getCategoryCount ? getCategoryCount(cat.name) : cat.count || 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(isSelected ? "all" : cat.slug)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-all ${
                    isSelected
                      ? "bg-[#8535FC]/15 text-[#8535FC] font-semibold border border-[#8535FC]/30"
                      : "text-[#A1A1AA] hover:text-[#EDEDF0] hover:bg-[#141417]"
                  }`}
                >
                  <span className="truncate pr-2 text-xs">{cat.name}</span>
                  <span
                    className={`text-[11px] font-mono shrink-0 ${
                      isSelected ? "text-[#8535FC]" : "text-[#71717A]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {/* View More / Less Categories */}
            {categories.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllCategories((prev) => !prev)}
                className="w-full flex items-center justify-center gap-1 py-1.5 mt-1 rounded-md text-[11px] font-mono text-[#8535FC] hover:bg-[#8535FC]/10 transition-colors"
              >
                <span>
                  {showAllCategories
                    ? "Show fewer"
                    : `+ View ${categories.length - 5} more`}
                </span>
                {showAllCategories ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Programming Languages & Tech Stacks */}
      <div className="space-y-2 pt-3 border-t border-[#414146]/60">
        <button
          type="button"
          onClick={() => toggleSection("languages")}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#A1A1AA] group-hover:text-[#EDEDF0] font-semibold transition-colors">
              Languages & Stacks
            </span>
            {selectedTechs.length > 0 && (
              <span className="size-4 rounded-full bg-[#8535FC] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                {selectedTechs.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[#71717A]">
            {selectedTechs.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onClearTechs();
                }}
                className="text-[10px] font-mono text-[#8535FC] hover:underline cursor-pointer"
              >
                Clear
              </span>
            )}
            {openSections.languages ? (
              <ChevronUp size={13} />
            ) : (
              <ChevronDown size={13} />
            )}
          </div>
        </button>

        {openSections.languages && (
          <div className="space-y-2 pt-1">
            {/* Quick search input for languages if list > 6 */}
            {availableLanguages.length > 6 && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter languages..."
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  className="w-full h-7 pl-7 pr-2.5 rounded-md bg-[#141417] border border-[#414146] text-[11px] text-[#EDEDF0] placeholder-[#71717A] focus:outline-none focus:border-[#8535FC]"
                />
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717A]"
                />
              </div>
            )}

            <div className="space-y-1">
              {displayedLanguages.map((tech) => {
                const isChecked = selectedTechs.includes(tech);
                const count = getTechCount ? getTechCount(tech) : 0;

                return (
                  <label
                    key={tech}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors select-none ${
                      isChecked
                        ? "bg-[#8535FC]/10 text-[#EDEDF0]"
                        : "text-[#A1A1AA] hover:text-[#EDEDF0] hover:bg-[#141417]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`size-3.5 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-[#8535FC] border-[#8535FC] text-white"
                            : "border-[#414146] bg-[#141417]"
                        }`}
                      >
                        {isChecked && <Check size={10} strokeWidth={3} />}
                      </div>
                      <span className="truncate text-xs font-medium">{tech}</span>
                    </div>
                    {count > 0 && (
                      <span className="text-[11px] font-mono text-[#71717A] shrink-0 ml-2">
                        {count}
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleTech(tech)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>

            {/* View More / Less Languages */}
            {filteredLanguages.length > 6 && !languageSearch && (
              <button
                type="button"
                onClick={() => setShowAllLanguages((prev) => !prev)}
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-mono text-[#8535FC] hover:bg-[#8535FC]/10 transition-colors"
              >
                <span>
                  {showAllLanguages
                    ? "Show fewer"
                    : `+ View ${filteredLanguages.length - 6} more`}
                </span>
                {showAllLanguages ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. Pricing & License Type */}
      <div className="space-y-2.5 pt-3 border-t border-[#414146]/60">
        <button
          type="button"
          onClick={() => toggleSection("pricing")}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#A1A1AA] group-hover:text-[#EDEDF0] font-semibold transition-colors">
            Price & License
          </span>
          <div className="text-[#71717A]">
            {openSections.pricing ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        </button>

        {openSections.pricing && (
          <div className="space-y-2.5 pt-1">
            {/* Segmented Switcher: All / Paid / Free */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#141417] rounded-lg border border-[#414146]">
              <button
                type="button"
                onClick={() => onSelectPriceType("all")}
                className={`py-1.5 text-center rounded-md font-medium text-xs transition-all ${
                  selectedPriceType === "all"
                    ? "bg-[#8535FC] text-white font-semibold shadow-sm"
                    : "text-[#A1A1AA] hover:text-[#EDEDF0]"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => onSelectPriceType("paid")}
                className={`py-1.5 text-center rounded-md font-medium text-xs transition-all ${
                  selectedPriceType === "paid"
                    ? "bg-[#8535FC] text-white font-semibold shadow-sm"
                    : "text-[#A1A1AA] hover:text-[#EDEDF0]"
                }`}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => onSelectPriceType("free")}
                className={`py-1.5 text-center rounded-md font-medium text-xs transition-all ${
                  selectedPriceType === "free"
                    ? "bg-[#10B981] text-white font-semibold shadow-sm"
                    : "text-[#A1A1AA] hover:text-[#EDEDF0]"
                }`}
              >
                Free
              </button>
            </div>

            {/* Curated Budget Ranges */}
            <div className="space-y-1 pt-1">
              {PRICE_RANGES.map((range) => {
                const isSelected = selectedPriceRange === range.id;
                return (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() =>
                      onSelectPriceRange(isSelected ? "all" : range.id)
                    }
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-all ${
                      isSelected
                        ? "bg-[#8535FC]/15 text-[#8535FC] font-semibold border border-[#8535FC]/30"
                        : "text-[#A1A1AA] hover:text-[#EDEDF0] hover:bg-[#141417]"
                    }`}
                  >
                    <span className="text-xs">{range.label}</span>
                    {isSelected && (
                      <Check size={12} className="text-[#8535FC] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. Customer Rating */}
      <div className="space-y-2 pt-3 border-t border-[#414146]/60">
        <button
          type="button"
          onClick={() => toggleSection("ratings")}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#A1A1AA] group-hover:text-[#EDEDF0] font-semibold transition-colors">
            Customer Rating
          </span>
          <div className="text-[#71717A]">
            {openSections.ratings ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        </button>

        {openSections.ratings && (
          <div className="space-y-1 pt-1">
            {RATING_TIERS.map((tier) => {
              const isSelected = selectedRating === tier.value;
              const count = getRatingCount ? getRatingCount(tier.value) : 0;

              return (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => onSelectRating(isSelected ? 0 : tier.value)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-all ${
                    isSelected
                      ? "bg-[#8535FC]/15 text-[#8535FC] font-semibold border border-[#8535FC]/30"
                      : "text-[#A1A1AA] hover:text-[#EDEDF0] hover:bg-[#141417]"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {tier.value > 0 ? (
                      <div className="flex items-center gap-1 text-[#F59E0B]">
                        <Star size={12} className="fill-[#F59E0B]" />
                        <span className="text-xs text-[#EDEDF0] font-medium">
                          {tier.label}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs">{tier.label}</span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-mono ${
                      isSelected ? "text-[#8535FC]" : "text-[#71717A]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. KodeDock Verified & Security Trust */}
      <div className="space-y-2 pt-3 border-t border-[#414146]/60">
        <button
          type="button"
          onClick={() => toggleSection("verification")}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#A1A1AA] group-hover:text-[#EDEDF0] font-semibold transition-colors">
            Security & Guarantee
          </span>
          <div className="text-[#71717A]">
            {openSections.verification ? (
              <ChevronUp size={13} />
            ) : (
              <ChevronDown size={13} />
            )}
          </div>
        </button>

        {openSections.verification && (
          <div className="space-y-1.5 pt-1">
            {/* KodeDock Verified */}
            <label
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all border ${
                verifiedOnly
                  ? "bg-[#8535FC]/10 border-[#8535FC]/40 text-[#EDEDF0]"
                  : "border-transparent text-[#A1A1AA] hover:text-[#EDEDF0] hover:bg-[#141417]"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`size-3.5 rounded border flex items-center justify-center transition-colors ${
                    verifiedOnly
                      ? "bg-[#8535FC] border-[#8535FC] text-white"
                      : "border-[#414146] bg-[#141417]"
                  }`}
                >
                  {verifiedOnly && <Check size={10} strokeWidth={3} />}
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#10B981]" />
                  <span className="text-xs font-medium">KodeDock Verified</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={() => onToggleVerified(!verifiedOnly)}
                className="sr-only"
              />
            </label>

            {/* AST Secret Audit Clean */}
            <label
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all border ${
                astOnly
                  ? "bg-[#10B981]/10 border-[#10B981]/40 text-[#EDEDF0]"
                  : "border-transparent text-[#A1A1AA] hover:text-[#EDEDF0] hover:bg-[#141417]"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`size-3.5 rounded border flex items-center justify-center transition-colors ${
                    astOnly
                      ? "bg-[#10B981] border-[#10B981] text-white"
                      : "border-[#414146] bg-[#141417]"
                  }`}
                >
                  {astOnly && <Check size={10} strokeWidth={3} />}
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={13} className="text-[#8535FC]" />
                  <span className="text-xs font-medium">AST Secret Audited</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={astOnly}
                onChange={() => onToggleAst(!astOnly)}
                className="sr-only"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
