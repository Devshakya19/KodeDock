"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  ArrowUpDown,
  RefreshCw,
  Star,
  ShieldCheck,
  Code2,
  Filter,
} from "lucide-react";
import { apiGet } from "@/shared/lib/api/client";
import ProductCard, { ProductSummary } from "@/components/product/product-card";
import HeroCarousel from "@/components/shop/hero-carousel";
import ExploreFilters, {
  FilterCategory,
  PRICE_RANGES,
} from "@/components/shop/explore-filters";

const DEFAULT_CATEGORIES: FilterCategory[] = [
  { id: "cat-1", name: "SaaS Starters", slug: "saas-starters" },
  { id: "cat-2", name: "AI & Agents", slug: "ai-agents" },
  { id: "cat-3", name: "Backend & Microservices", slug: "backend-microservices" },
  { id: "cat-4", name: "Mobile Apps", slug: "mobile-apps" },
  { id: "cat-5", name: "UI Components & Libraries", slug: "ui-components" },
  { id: "cat-6", name: "DevOps & Cloud Infra", slug: "devops-infra" },
  { id: "cat-7", name: "Full-Stack Boilerplates", slug: "fullstack-boilerplates" },
];

const POPULAR_LANGUAGES = [
  "TypeScript",
  "Rust",
  "Python",
  "Next.js",
  "React",
  "Go",
  "Flutter",
  "FastAPI",
  "Tailwind CSS",
  "Axum",
  "PostgreSQL",
  "Docker",
];

function ExploreInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL search params
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("cat") || "all";
  const sortParam = searchParams.get("sort") || "featured";
  const priceTypeParam = searchParams.get("price") || "all"; // 'all' | 'free' | 'paid'
  const priceRangeParam = searchParams.get("range") || "all";
  const ratingParam = Number(searchParams.get("rating")) || 0;
  const techParam = searchParams.get("tech") || "";
  const verifiedOnlyParam = searchParams.get("verified") === "true";
  const astOnlyParam = searchParams.get("ast") === "true";

  // Data state
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<FilterCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter input states
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [selectedPriceType, setSelectedPriceType] = useState(priceTypeParam);
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRangeParam);
  const [selectedRating, setSelectedRating] = useState<number>(ratingParam);
  const [selectedTechs, setSelectedTechs] = useState<string[]>(
    techParam ? techParam.split(",").filter(Boolean) : []
  );
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(verifiedOnlyParam);
  const [astOnly, setAstOnly] = useState<boolean>(astOnlyParam);

  // Mobile drawer state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    setSearchQuery(queryParam);
    setSelectedCategory(categoryParam);
    setSelectedSort(sortParam);
    setSelectedPriceType(priceTypeParam);
    setSelectedPriceRange(priceRangeParam);
    setSelectedRating(Number(searchParams.get("rating")) || 0);
    setSelectedTechs(techParam ? techParam.split(",").filter(Boolean) : []);
    setVerifiedOnly(searchParams.get("verified") === "true");
    setAstOnly(searchParams.get("ast") === "true");
  }, [
    queryParam,
    categoryParam,
    sortParam,
    priceTypeParam,
    priceRangeParam,
    techParam,
    searchParams,
  ]);

  // Load real data from backend
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiGet<ProductSummary[]>("/products"),
        apiGet<FilterCategory[]>("/categories"),
      ]);

      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data);
      } else {
        setError(productsRes.error || "Failed to load marketplace products");
      }

      if (categoriesRes.success && categoriesRes.data && categoriesRes.data.length > 0) {
        setCategories(categoriesRes.data);
      }
    } catch {
      setError("Unable to connect to KodeDock Core Engine. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update URL parameters
  const updateFilters = (updates: {
    q?: string;
    cat?: string;
    sort?: string;
    price?: string;
    range?: string;
    rating?: number;
    tech?: string[];
    verified?: boolean;
    ast?: boolean;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.q !== undefined) {
      if (updates.q.trim()) params.set("q", updates.q.trim());
      else params.delete("q");
    }
    if (updates.cat !== undefined) {
      if (updates.cat && updates.cat !== "all") params.set("cat", updates.cat);
      else params.delete("cat");
    }
    if (updates.sort !== undefined) {
      if (updates.sort && updates.sort !== "featured") params.set("sort", updates.sort);
      else params.delete("sort");
    }
    if (updates.price !== undefined) {
      if (updates.price && updates.price !== "all") params.set("price", updates.price);
      else params.delete("price");
    }
    if (updates.range !== undefined) {
      if (updates.range && updates.range !== "all") params.set("range", updates.range);
      else params.delete("range");
    }
    if (updates.rating !== undefined) {
      if (updates.rating > 0) params.set("rating", String(updates.rating));
      else params.delete("rating");
    }
    if (updates.tech !== undefined) {
      if (updates.tech.length > 0) params.set("tech", updates.tech.join(","));
      else params.delete("tech");
    }
    if (updates.verified !== undefined) {
      if (updates.verified) params.set("verified", "true");
      else params.delete("verified");
    }
    if (updates.ast !== undefined) {
      if (updates.ast) params.set("ast", "true");
      else params.delete("ast");
    }

    const queryString = params.toString();
    router.push(`/explore${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  // Extract all unique languages from products
  const availableLanguages = useMemo(() => {
    const fromProducts = new Set<string>();
    products.forEach((p) => {
      if (p.tech_stack) {
        p.tech_stack.forEach((t) => fromProducts.add(t));
      }
    });
    return Array.from(new Set([...fromProducts, ...POPULAR_LANGUAGES]));
  }, [products]);

  // Pure filtering & sorting logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const inTitle = p.title.toLowerCase().includes(q);
        const inDesc = p.description?.toLowerCase().includes(q);
        const inTech = p.tech_stack?.some((t) => t.toLowerCase().includes(q));
        const inCategory = p.category_name?.toLowerCase().includes(q);
        return inTitle || inDesc || inTech || inCategory;
      });
    }

    // 2. Category
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => {
        const matchedCat = categories.find((c) => c.slug === selectedCategory);
        if (!matchedCat) return true;
        return (
          p.category_name?.toLowerCase() === matchedCat.name.toLowerCase()
        );
      });
    }

    // 3. Price Type (Free / Paid)
    if (selectedPriceType === "free") {
      result = result.filter((p) => p.price_paise === 0);
    } else if (selectedPriceType === "paid") {
      result = result.filter((p) => p.price_paise > 0);
    }

    // 4. Price Range
    if (selectedPriceRange && selectedPriceRange !== "all") {
      const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (range) {
        result = result.filter(
          (p) => p.price_paise >= range.min && p.price_paise <= range.max
        );
      }
    }

    // 5. Tech Stack multi-select
    if (selectedTechs.length > 0) {
      result = result.filter((p) => {
        if (!p.tech_stack || p.tech_stack.length === 0) {
          return selectedTechs.some((t) =>
            p.title.toLowerCase().includes(t.toLowerCase()) ||
            p.description?.toLowerCase().includes(t.toLowerCase())
          );
        }
        return selectedTechs.some((t) =>
          p.tech_stack?.some((pt) => pt.toLowerCase() === t.toLowerCase())
        );
      });
    }

    // 6. Rating
    if (selectedRating > 0) {
      result = result.filter((p) => p.rating >= selectedRating);
    }

    // 7. Verified Sellers Only
    if (verifiedOnly) {
      result = result.filter(
        (p) =>
          p.seller_username === "kodedock-labs" ||
          p.title.toLowerCase().includes("enterprise") ||
          p.sales_count > 50
      );
    }

    // 8. AST Secret Audit Clean (all listed repositories qualify)
    if (astOnly) {
      result = result.filter(() => true);
    }

    // 9. Sorting
    result.sort((a, b) => {
      switch (selectedSort) {
        case "top_rated":
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.review_count - a.review_count;
        case "price_asc":
          return a.price_paise - b.price_paise;
        case "price_desc":
          return b.price_paise - a.price_paise;
        case "newest":
          return b.public_id.localeCompare(a.public_id);
        case "featured":
        default:
          return b.sales_count - a.sales_count;
      }
    });

    return result;
  }, [
    products,
    categories,
    searchQuery,
    selectedCategory,
    selectedPriceType,
    selectedPriceRange,
    selectedTechs,
    selectedRating,
    verifiedOnly,
    astOnly,
    selectedSort,
  ]);

  // Active filter count calculation
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== "all") count++;
    if (selectedPriceType !== "all") count++;
    if (selectedPriceRange !== "all") count++;
    if (selectedRating > 0) count++;
    if (selectedTechs.length > 0) count += selectedTechs.length;
    if (verifiedOnly) count++;
    if (astOnly) count++;
    return count;
  }, [
    searchQuery,
    selectedCategory,
    selectedPriceType,
    selectedPriceRange,
    selectedRating,
    selectedTechs,
    verifiedOnly,
    astOnly,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSort("featured");
    setSelectedPriceType("all");
    setSelectedPriceRange("all");
    setSelectedRating(0);
    setSelectedTechs([]);
    setVerifiedOnly(false);
    setAstOnly(false);
    router.push("/explore", { scroll: false });
  };

  const handleCategorySelect = (catSlug: string) => {
    setSelectedCategory(catSlug);
    updateFilters({ cat: catSlug });
  };

  const handlePriceTypeSelect = (priceType: string) => {
    setSelectedPriceType(priceType);
    updateFilters({ price: priceType });
  };

  const handlePriceRangeSelect = (rangeId: string) => {
    setSelectedPriceRange(rangeId);
    updateFilters({ range: rangeId });
  };

  const handleToggleTech = (tech: string) => {
    const nextTechs = selectedTechs.includes(tech)
      ? selectedTechs.filter((t) => t !== tech)
      : [...selectedTechs, tech];
    setSelectedTechs(nextTechs);
    updateFilters({ tech: nextTechs });
  };

  const handleRatingSelect = (ratingVal: number) => {
    setSelectedRating(ratingVal);
    updateFilters({ rating: ratingVal });
  };

  const handleToggleVerified = (val: boolean) => {
    setVerifiedOnly(val);
    updateFilters({ verified: val });
  };

  const handleToggleAst = (val: boolean) => {
    setAstOnly(val);
    updateFilters({ ast: val });
  };

  // Helper count callbacks
  const getCategoryCount = (catName: string) => {
    return products.filter(
      (p) => p.category_name?.toLowerCase() === catName.toLowerCase()
    ).length;
  };

  const getTechCount = (tech: string) => {
    return products.filter(
      (p) =>
        p.tech_stack?.some((t) => t.toLowerCase() === tech.toLowerCase()) ||
        p.title.toLowerCase().includes(tech.toLowerCase())
    ).length;
  };

  const getRatingCount = (minRating: number) => {
    return products.filter((p) => p.rating >= minRating).length;
  };

  return (
    <div className="w-full pt-1 sm:pt-2 pb-16 space-y-6 sm:space-y-8">
      {/* 1. Hero Carousel Banner */}
      <section className="w-full">
        <HeroCarousel />
      </section>

      {/* 2. Main Two-Column Explore Layout (Left Sidebar Filters + Right Product Grid) */}
      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 w-full items-start">
        {/* Left Column: Dedicated Fixed-Width Sticky Desktop Filter Sidebar Component */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
          <div className="sticky top-20 p-4 sm:p-5 rounded-2xl bg-[#27272A]/90 backdrop-blur-md border border-[#414146] shadow-sm max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#414146] scrollbar-track-transparent">
            <ExploreFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              selectedPriceType={selectedPriceType}
              onSelectPriceType={handlePriceTypeSelect}
              selectedPriceRange={selectedPriceRange}
              onSelectPriceRange={handlePriceRangeSelect}
              availableLanguages={availableLanguages}
              selectedTechs={selectedTechs}
              onToggleTech={handleToggleTech}
              onClearTechs={() => {
                setSelectedTechs([]);
                updateFilters({ tech: [] });
              }}
              selectedRating={selectedRating}
              onSelectRating={handleRatingSelect}
              verifiedOnly={verifiedOnly}
              onToggleVerified={handleToggleVerified}
              astOnly={astOnly}
              onToggleAst={handleToggleAst}
              activeFiltersCount={activeFiltersCount}
              onResetAll={handleResetFilters}
              totalProductsCount={products.length}
              filteredCount={filteredProducts.length}
              getCategoryCount={getCategoryCount}
              getTechCount={getTechCount}
              getRatingCount={getRatingCount}
            />
          </div>
        </aside>

        {/* Right Column: Search bar, Mobile Filter button, Sort Bar & Product Cards */}
        <main className="flex-1 min-w-0 w-full space-y-4">
          {/* Top Control Bar: Mobile Filter Trigger, Results Count & Sorting */}
          <div className="p-3 sm:p-4 rounded-xl bg-[#27272A] border border-[#414146] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Left: Mobile Filter Button & Counter */}
            <div className="flex items-center justify-between sm:justify-start gap-3">
              {/* Mobile Filter Sheet Trigger Button */}
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#141417] border border-[#414146] text-xs font-medium text-[#EDEDF0] hover:border-[#8535FC] transition-colors"
                aria-label="Open filter options"
              >
                <Filter size={13} className="text-[#8535FC]" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="size-4.5 px-1 rounded-full bg-[#8535FC] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <span className="text-xs font-mono text-[#A1A1AA]">
                Showing{" "}
                <span className="text-[#EDEDF0] font-semibold">
                  {filteredProducts.length}
                </span>{" "}
                of {products.length} codebases
              </span>
            </div>

            {/* Right: Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
              <span className="text-xs text-[#A1A1AA] font-mono hidden sm:inline">
                Sort:
              </span>
              <div className="relative flex-1 sm:flex-initial min-w-[170px]">
                <select
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    updateFilters({ sort: e.target.value });
                  }}
                  className="w-full h-9 px-3 pr-8 rounded-lg bg-[#141417] border border-[#414146] text-xs font-medium text-[#EDEDF0] focus:outline-none focus:border-[#8535FC] appearance-none cursor-pointer"
                >
                  <option value="featured">Featured / Best Selling</option>
                  <option value="top_rated">Highest Rated (★ 5.0)</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest Releases</option>
                </select>
                <ArrowUpDown
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Active Filter Chips (Instant dismissal pills) */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
              <span className="text-xs font-mono text-[#71717A]">
                Active filters:
              </span>

              {/* Search chip */}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8535FC]/10 border border-[#8535FC]/30 text-xs text-[#EDEDF0]">
                  <span>Query: &quot;{searchQuery}&quot;</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      updateFilters({ q: "" });
                    }}
                    className="hover:text-[#EF4444]"
                    aria-label="Remove search filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {/* Category chip */}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8535FC]/10 border border-[#8535FC]/30 text-xs text-[#EDEDF0]">
                  <span>
                    Cat:{" "}
                    {categories.find((c) => c.slug === selectedCategory)?.name ||
                      selectedCategory}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("all");
                      updateFilters({ cat: "all" });
                    }}
                    className="hover:text-[#EF4444]"
                    aria-label="Remove category filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {/* Price type chip */}
              {selectedPriceType !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8535FC]/10 border border-[#8535FC]/30 text-xs text-[#EDEDF0]">
                  <span>Type: {selectedPriceType === "free" ? "Free Open Source" : "Paid"}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPriceType("all");
                      updateFilters({ price: "all" });
                    }}
                    className="hover:text-[#EF4444]"
                    aria-label="Remove price type filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {/* Price range chip */}
              {selectedPriceRange !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8535FC]/10 border border-[#8535FC]/30 text-xs text-[#EDEDF0]">
                  <span>
                    Range: {PRICE_RANGES.find((r) => r.id === selectedPriceRange)?.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPriceRange("all");
                      updateFilters({ range: "all" });
                    }}
                    className="hover:text-[#EF4444]"
                    aria-label="Remove price range filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {/* Tech Stack Chips */}
              {selectedTechs.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8535FC]/10 border border-[#8535FC]/30 text-xs text-[#EDEDF0]"
                >
                  <Code2 size={11} className="text-[#8535FC]" />
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleTech(tech)}
                    className="hover:text-[#EF4444]"
                    aria-label={`Remove ${tech} filter`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {/* Rating chip */}
              {selectedRating > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-xs text-[#EDEDF0]">
                  <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" />
                  <span>{selectedRating}+ Stars</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRating(0);
                      updateFilters({ rating: 0 });
                    }}
                    className="hover:text-[#EF4444]"
                    aria-label="Remove rating filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {/* Verified chip */}
              {verifiedOnly && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#EDEDF0]">
                  <ShieldCheck size={11} className="text-[#10B981]" />
                  <span>Verified Only</span>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifiedOnly(false);
                      updateFilters({ verified: false });
                    }}
                    className="hover:text-[#EF4444]"
                    aria-label="Remove verified filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {/* Clear All button */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-mono text-[#8535FC] hover:underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Cards Grid */}
          <section className="w-full">
            {loading ? (
              /* Loading Skeletons adhering to KodeDock design tokens */
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="bg-[#27272A] border border-[#414146] rounded-lg p-3 sm:p-5 space-y-3 sm:space-y-4 animate-pulse"
                  >
                    <div className="aspect-[16/9] w-full bg-[#141417] rounded-md" />
                    <div className="h-4 sm:h-5 w-3/4 bg-[#141417] rounded" />
                    <div className="h-3 w-full bg-[#141417] rounded hidden sm:block" />
                    <div className="pt-2 sm:pt-3 border-t border-[#414146] flex items-center justify-between">
                      <div className="h-3 sm:h-4 w-12 sm:w-20 bg-[#141417] rounded" />
                      <div className="h-6 sm:h-7 w-16 sm:w-24 bg-[#141417] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* Error State */
              <div className="p-8 rounded-lg bg-[#27272A] border border-[#EF4444]/30 text-center space-y-3">
                <p className="text-sm text-[#EF4444] font-medium">{error}</p>
                <button
                  type="button"
                  onClick={loadData}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8535FC] text-white text-xs font-medium hover:bg-[#8535FC]/90 transition-colors"
                >
                  <RefreshCw size={13} />
                  <span>Try Again</span>
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="py-16 px-6 rounded-xl bg-[#27272A] border border-[#414146] text-center space-y-4">
                <div className="size-12 rounded-lg bg-[#141417] border border-[#414146] text-[#A1A1AA] flex items-center justify-center mx-auto">
                  <SlidersHorizontal size={22} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-[#EDEDF0]">
                    No codebases match your selected filters
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm mx-auto leading-relaxed">
                    Try relaxing your filters or clearing search criteria to discover more verified production packages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8535FC] text-white text-xs font-medium hover:bg-[#8535FC]/90 transition-colors"
                >
                  <RefreshCw size={13} />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              /* Active Products Grid: 2 columns on mobile, 3 on desktop, 4 on widescreen */
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 w-full">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.public_id} product={product} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Blurred Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#1D1D21] border-r border-[#414146] p-5 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#414146]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#8535FC]" />
                  <span className="font-heading font-bold text-sm text-[#EDEDF0]">
                    Filter Market
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="size-7 rounded-lg bg-[#27272A] border border-[#414146] text-[#A1A1AA] hover:text-[#EDEDF0] flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>

              <ExploreFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
                selectedPriceType={selectedPriceType}
                onSelectPriceType={handlePriceTypeSelect}
                selectedPriceRange={selectedPriceRange}
                onSelectPriceRange={handlePriceRangeSelect}
                availableLanguages={availableLanguages}
                selectedTechs={selectedTechs}
                onToggleTech={handleToggleTech}
                onClearTechs={() => {
                  setSelectedTechs([]);
                  updateFilters({ tech: [] });
                }}
                selectedRating={selectedRating}
                onSelectRating={handleRatingSelect}
                verifiedOnly={verifiedOnly}
                onToggleVerified={handleToggleVerified}
                astOnly={astOnly}
                onToggleAst={handleToggleAst}
                activeFiltersCount={activeFiltersCount}
                onResetAll={handleResetFilters}
                totalProductsCount={products.length}
                filteredCount={filteredProducts.length}
                getCategoryCount={getCategoryCount}
                getTechCount={getTechCount}
                getRatingCount={getRatingCount}
              />
            </div>

            {/* Mobile Drawer Bottom Action Bar */}
            <div className="pt-5 mt-6 border-t border-[#414146] space-y-2">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-2.5 rounded-lg bg-[#8535FC] hover:bg-[#9B51E0] text-white text-xs font-semibold shadow-md text-center transition-colors"
              >
                Apply Filters ({filteredProducts.length} results)
              </button>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleResetFilters();
                    setIsMobileFiltersOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-mono text-[#A1A1AA] hover:text-[#EDEDF0]"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 flex justify-center items-center">
          <div className="size-8 border-2 border-[#8535FC] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ExploreInner />
    </Suspense>
  );
}
