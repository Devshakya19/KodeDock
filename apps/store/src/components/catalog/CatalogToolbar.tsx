"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import type { FilterState } from "./FilterSidebar";

interface CatalogToolbarProps {
  totalResults: number;
  filters: FilterState;
  showFilters?: boolean;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onToggleMobileFilters?: () => void;
  onToggleFiltersVisibility?: () => void;
}

const SORT_OPTIONS = [
  { id: "popular", label: "Top Sellers" },
  { id: "newest", label: "New Releases" },
  { id: "rating", label: "Highest Rated" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
];

export const CatalogToolbar: React.FC<CatalogToolbarProps> = ({
  totalResults,
  filters,
  showFilters = true,
  onFilterChange,
  onResetFilters,
  onToggleMobileFilters,
  onToggleFiltersVisibility,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSortOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeSort =
    SORT_OPTIONS.find((s) => s.id === filters.sort) || SORT_OPTIONS[0];

  const activeFiltersCount =
    (filters.category !== "all" ? 1 : 0) +
    (filters.priceRange !== "all" ? 1 : 0) +
    filters.techStacks.length +
    (filters.search.trim().length > 0 ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  const removeTechStack = (tech: string) => {
    onFilterChange({
      techStacks: filters.techStacks.filter((t) => t !== tech),
    });
  };

  const getPriceLabel = (id: string) => {
    switch (id) {
      case "free":
        return "Free (₹0)";
      case "under-1000":
        return "Under ₹1,000";
      case "1000-5000":
        return "₹1,000 – ₹5,000";
      case "5000-10000":
        return "₹5,000 – ₹10,000";
      case "above-10000":
        return "Above ₹10,000";
      default:
        return id;
    }
  };

  return (
    <div>
      {/* Primary Toolbar Row */}
      <div className="catalog-control-toolbar">
        {/* Left: Results Count & Mobile Filter Trigger */}
        <div className="catalog-toolbar-left">
          <div className="catalog-results-badge">
            <span className="catalog-results-label">Showing</span>
            <span className="catalog-results-count">{totalResults}</span>
            <span className="catalog-results-noun">
              {totalResults === 1 ? "Software Package" : "Software Packages"}
            </span>
          </div>

          {onToggleMobileFilters && (
            <button
              type="button"
              onClick={onToggleMobileFilters}
              className="btn btn-secondary mobile-filter-btn"
              aria-label="Open filter settings"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="mobile-filter-count-badge">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Right: Hide/Show Filters Button & Custom Sort Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
          {onToggleFiltersVisibility && (
            <button
              type="button"
              onClick={onToggleFiltersVisibility}
              className="btn btn-secondary desktop-filter-toggle-btn"
              aria-label={showFilters ? "Hide filters sidebar" : "Show filters sidebar"}
              style={{ fontSize: "0.8125rem", padding: "0.45rem 0.85rem" }}
            >
              <SlidersHorizontal size={14} />
              <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
            </button>
          )}

          {/* Minimal Sort Dropdown (Clean, Understated Epic Style) */}
          <div className="minimal-sort-container" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              className={`minimal-sort-trigger${isSortOpen ? " is-open" : ""}`}
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
              aria-label="Sort by"
            >
              <span className="minimal-sort-prefix">Sort by:</span>
              <span className="minimal-sort-val">{activeSort.label}</span>
              <ChevronDown
                size={14}
                className={`minimal-sort-chevron${isSortOpen ? " is-rotated" : ""}`}
              />
            </button>

            {isSortOpen && (
              <div className="minimal-sort-menu" role="listbox">
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = filters.sort === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onFilterChange({ sort: opt.id });
                        setIsSortOpen(false);
                      }}
                      className={`minimal-sort-item${isSelected ? " selected" : ""}`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <Check
                          size={13}
                          color="var(--accent-primary)"
                          style={{ flexShrink: 0 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips / Badges */}
      {hasActiveFilters && (
        <div className="active-filters-row">
          {filters.search.trim() && (
            <span className="active-filter-chip">
              <span className="active-filter-prefix">Search:</span>
              <span className="active-filter-val">&quot;{filters.search}&quot;</span>
              <button
                type="button"
                onClick={() => onFilterChange({ search: "" })}
                className="active-filter-remove-btn"
                aria-label="Remove keyword filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.category !== "all" && (
            <span className="active-filter-chip">
              <span className="active-filter-prefix">Category:</span>
              <span className="active-filter-val">{filters.category}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ category: "all" })}
                className="active-filter-remove-btn"
                aria-label="Remove category filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.priceRange !== "all" && (
            <span className="active-filter-chip">
              <span className="active-filter-prefix">Price:</span>
              <span className="active-filter-val">{getPriceLabel(filters.priceRange)}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ priceRange: "all" })}
                className="active-filter-remove-btn"
                aria-label="Remove price filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.techStacks.map((tech) => (
            <span key={tech} className="active-filter-chip">
              <span className="active-filter-prefix">Stack:</span>
              <span className="active-filter-val">{tech}</span>
              <button
                type="button"
                onClick={() => removeTechStack(tech)}
                className="active-filter-remove-btn"
                aria-label={`Remove ${tech} filter`}
              >
                <X size={12} />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={onResetFilters}
            className="active-filter-clear-all"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};
