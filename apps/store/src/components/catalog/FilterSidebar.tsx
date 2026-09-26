"use client";

import React, { useState } from "react";
import { Filter, Search, RotateCcw, Check, ChevronDown, X } from "lucide-react";
import type { StoreCategory } from "../../types/store";

export interface FilterState {
  category: string;
  priceRange: string;
  techStacks: string[];
  search: string;
  sort: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  categories: StoreCategory[];
  totalProductsCount: number;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

const PRICE_OPTIONS = [
  { id: "all", label: "All Prices" },
  { id: "free", label: "Free (₹0)" },
  { id: "under-1000", label: "Under ₹1,000" },
  { id: "1000-5000", label: "₹1,000 – ₹5,000" },
  { id: "5000-10000", label: "₹5,000 – ₹10,000" },
  { id: "above-10000", label: "Above ₹10,000" },
];

const POPULAR_TECH_STACKS = [
  "Next.js",
  "TypeScript",
  "PostgreSQL",
  "Docker",
  "Tailwind CSS",
  "Python",
  "Go",
  "React Native",
  "Supabase",
  "Redis",
];

const KNOWN_CATEGORIES = [
  "SaaS",
  "AI",
  "Developer Tools",
  "Mobile",
  "APIs & Microservices",
  "Design Systems",
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  categories,
  totalProductsCount,
  onFilterChange,
  onResetFilters,
  isOpenOnMobile = false,
  onCloseMobile,
}) => {
  // Collapsible sections state (Epic Games Accordion)
  const [collapsedSections, setCollapsedSections] = useState<{
    categories: boolean;
    price: boolean;
    techStacks: boolean;
  }>({
    categories: false,
    price: false,
    techStacks: false,
  });

  const toggleSection = (section: "categories" | "price" | "techStacks") => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Build lookup map for category counts
  const categoryCountMap = new Map<string, number>();
  categories.forEach((c) => {
    categoryCountMap.set(c.category.toLowerCase(), c.count);
  });

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.priceRange !== "all" ||
    filters.techStacks.length > 0 ||
    filters.search.trim().length > 0;

  const toggleTechStack = (tech: string) => {
    const exists = filters.techStacks.includes(tech);
    const updated = exists
      ? filters.techStacks.filter((t) => t !== tech)
      : [...filters.techStacks, tech];
    onFilterChange({ techStacks: updated });
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div
          className="mobile-filter-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Filter Sidebar Container (Sticky on desktop, Slide drawer on mobile) */}
      <aside
        className={`catalog-filter-sidebar${isOpenOnMobile ? " mobile-open" : ""}`}
        aria-label="Catalog filters"
      >
        {/* Header with Title, Reset Button & Mobile Close Button */}
        <div className="filter-sidebar-header">
          <div className="filter-sidebar-title">
            <Filter size={16} color="var(--accent-primary)" />
            <span>Filters</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="filter-reset-btn"
                title="Reset all filters"
              >
                Reset
              </button>
            )}

            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="btn btn-ghost btn-icon"
                style={{ width: 28, height: 28, padding: 0 }}
                aria-label="Close filters"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Keywords / Instant Search */}
        <div className="filter-group-block">
          <label htmlFor="catalog-keywords-input" className="filter-group-title">
            Keywords
          </label>
          <div style={{ position: "relative" }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              id="catalog-keywords-input"
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Search codebases..."
              style={{
                width: "100%",
                padding: "0.45rem 0.75rem 0.45rem 2rem",
                background: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                fontSize: "0.8125rem",
                outline: "none",
                fontFamily: "var(--font-sans)",
              }}
            />
          </div>
        </div>

        {/* Categories Group (Collapsible / Hideable) */}
        <div className="filter-group-block">
          <button
            type="button"
            onClick={() => toggleSection("categories")}
            className="filter-group-title filter-group-toggle-btn"
            aria-expanded={!collapsedSections.categories}
          >
            <span>Architecture Categories</span>
            <ChevronDown
              size={14}
              style={{
                transition: "transform 0.2s ease",
                transform: collapsedSections.categories
                  ? "rotate(-90deg)"
                  : "rotate(0deg)",
              }}
            />
          </button>

          {!collapsedSections.categories && (
            <div className="filter-group-list">
              {/* All Categories Option */}
              <button
                type="button"
                onClick={() => onFilterChange({ category: "all" })}
                className={`filter-option-item${filters.category === "all" ? " selected" : ""}`}
              >
                <span>All Architectures</span>
                <span className="filter-option-count">{totalProductsCount}</span>
              </button>

              {/* Individual Categories */}
              {KNOWN_CATEGORIES.map((catName) => {
                const count = categoryCountMap.get(catName.toLowerCase()) || 0;
                const isSelected = filters.category.toLowerCase() === catName.toLowerCase();

                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        category: isSelected ? "all" : catName,
                      })
                    }
                    className={`filter-option-item${isSelected ? " selected" : ""}`}
                  >
                    <span>{catName}</span>
                    <span className="filter-option-count">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Price Range Group (Collapsible / Hideable) */}
        <div className="filter-group-block">
          <button
            type="button"
            onClick={() => toggleSection("price")}
            className="filter-group-title filter-group-toggle-btn"
            aria-expanded={!collapsedSections.price}
          >
            <span>Price Bracket</span>
            <ChevronDown
              size={14}
              style={{
                transition: "transform 0.2s ease",
                transform: collapsedSections.price
                  ? "rotate(-90deg)"
                  : "rotate(0deg)",
              }}
            />
          </button>

          {!collapsedSections.price && (
            <div className="filter-group-list">
              {PRICE_OPTIONS.map((opt) => {
                const isSelected = filters.priceRange === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onFilterChange({ priceRange: opt.id })}
                    className={`filter-option-item${isSelected ? " selected" : ""}`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={13} color="var(--accent-primary)" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tech Stack Tags Cloud (Collapsible / Hideable) */}
        <div className="filter-group-block">
          <button
            type="button"
            onClick={() => toggleSection("techStacks")}
            className="filter-group-title filter-group-toggle-btn"
            aria-expanded={!collapsedSections.techStacks}
          >
            <span>Popular Tech Stack</span>
            <ChevronDown
              size={14}
              style={{
                transition: "transform 0.2s ease",
                transform: collapsedSections.techStacks
                  ? "rotate(-90deg)"
                  : "rotate(0deg)",
              }}
            />
          </button>

          {!collapsedSections.techStacks && (
            <div className="filter-tags-cloud">
              {POPULAR_TECH_STACKS.map((tech) => {
                const isActive = filters.techStacks.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTechStack(tech)}
                    className={`filter-tag-chip${isActive ? " active" : ""}`}
                  >
                    {tech}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Apply Results CTA */}
        {onCloseMobile && (
          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              onClick={onCloseMobile}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.75rem", fontSize: "0.875rem" }}
            >
              Apply &amp; View Results
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
