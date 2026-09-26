"use client";

import React, { useState, useMemo } from "react";
import type { StoreProduct, StoreCategory } from "../../types/store";
import { ProductCard } from "../product/ProductCard";
import { FilterSidebar, type FilterState } from "./FilterSidebar";
import { CatalogToolbar } from "./CatalogToolbar";
import { PackageOpen, PlusCircle, RotateCcw } from "lucide-react";

interface CatalogViewProps {
  initialProducts: StoreProduct[];
  categories: StoreCategory[];
  initialFilters?: Partial<FilterState>;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialProducts,
  categories,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    category: initialFilters?.category || "all",
    priceRange: initialFilters?.priceRange || "all",
    techStacks: initialFilters?.techStacks || [],
    search: initialFilters?.search || "",
    sort: initialFilters?.sort || "popular",
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: "all",
      priceRange: "all",
      techStacks: [],
      search: "",
      sort: "popular",
    });
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Search Filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.tagline?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.seller_name?.toLowerCase().includes(q) ||
          (Array.isArray(p.tech_stack) &&
            p.tech_stack.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // 2. Category Filter
    if (filters.category !== "all") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // 3. Price Range Filter (standard_price is stored in paise)
    if (filters.priceRange !== "all") {
      result = result.filter((p) => {
        const paise = p.standard_price || 0;
        switch (filters.priceRange) {
          case "free":
            return paise === 0;
          case "under-1000":
            return paise > 0 && paise < 100000;
          case "1000-5000":
            return paise >= 100000 && paise <= 500000;
          case "5000-10000":
            return paise > 500000 && paise <= 1000000;
          case "above-10000":
            return paise > 1000000;
          default:
            return true;
        }
      });
    }

    // 4. Tech Stack Filter
    if (filters.techStacks.length > 0) {
      result = result.filter(
        (p) =>
          Array.isArray(p.tech_stack) &&
          filters.techStacks.every((stack) =>
            p.tech_stack.some((t) => t.toLowerCase() === stack.toLowerCase())
          )
      );
    }

    // 5. Sorting
    result.sort((a, b) => {
      switch (filters.sort) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "rating":
          return Number(b.avg_rating || 0) - Number(a.avg_rating || 0);
        case "price-low":
          return a.standard_price - b.standard_price;
        case "price-high":
          return b.standard_price - a.standard_price;
        case "popular":
        default:
          return (b.total_sales || 0) - (a.total_sales || 0);
      }
    });

    return result;
  }, [initialProducts, filters]);

  return (
    <div className="catalog-page-wrapper w-full">
      <div className="store-container store-container-full">
        {/* Page Header */}
        <header className="catalog-header-section">
          <div className="catalog-header-tagline">
            <span className="catalog-tagline-dot"></span>
            <span>VERIFIED REPOSITORIES &amp; ARCHITECTURES</span>
          </div>
          <h1 className="catalog-title">
            Explore <span className="catalog-title-accent">Marketplace</span>
          </h1>
          <p className="catalog-subtitle">
            Browse verified production codebases, microservice architectures, and developer tooling.
            100% real database with cryptographic licensing.
          </p>
        </header>

        {/* Toolbar with Results Count, Active Chips, Mobile Filter Trigger, Desktop Hide/Show & Sort Dropdown */}
        <CatalogToolbar
          totalResults={filteredProducts.length}
          filters={filters}
          showFilters={showFilters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onToggleMobileFilters={() => setIsMobileFiltersOpen(true)}
          onToggleFiltersVisibility={() => setShowFilters((prev) => !prev)}
        />

        {/* 2-Column Content Layout: Main Grid (Left, full width) + Filters Sidebar (Right, Epic Games Style) */}
        <div className={`catalog-content-grid${!showFilters ? " filters-hidden" : ""}`}>
          {/* Main Product Grid (Left Column) */}
          <main className="catalog-main-area">
            {filteredProducts.length > 0 ? (
              <div className="catalog-products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="catalog-empty-state">
                <div className="catalog-empty-icon">
                  <PackageOpen size={28} />
                </div>
                <h2 className="catalog-empty-title">No Software Packages Found</h2>
                <p className="catalog-empty-description">
                  {initialProducts.length === 0
                    ? "There are currently no published software packages in the marketplace. Be the first creator to publish your verified architecture on Creator Studio!"
                    : "No codebases match your selected filter criteria. Try adjusting keywords, clearing category filters, or selecting a wider price bracket."}
                </p>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                  {initialProducts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="btn btn-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <RotateCcw size={14} />
                      <span>Reset All Filters</span>
                    </button>
                  )}

                  <a
                    href="http://localhost:3001"
                    className="btn btn-primary"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <PlusCircle size={14} />
                    <span>Publish in Creator Studio</span>
                  </a>
                </div>
              </div>
            )}
          </main>

          {/* Right Filter Sidebar (renders when showFilters is true or mobile drawer is open) */}
          {(showFilters || isMobileFiltersOpen) && (
            <FilterSidebar
              filters={filters}
              categories={categories}
              totalProductsCount={initialProducts.length}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              isOpenOnMobile={isMobileFiltersOpen}
              onCloseMobile={() => setIsMobileFiltersOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
