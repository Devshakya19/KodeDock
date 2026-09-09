"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  Code2,
  ShieldCheck,
  Zap,
  Lock,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { apiGet } from "@/shared/lib/api/client";
import ProductCard, { ProductSummary } from "@/components/product/product-card";
import HeroCarousel from "@/components/shop/hero-carousel";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order?: number;
}

function ExploreInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("cat") || "all";
  const sortParam = searchParams.get("sort") || "featured";
  const priceTypeParam = searchParams.get("price") || "all"; // 'all' | 'free' | 'paid'

  // Component state
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter input state
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [selectedPriceType, setSelectedPriceType] = useState(priceTypeParam);

  // Sync state with URL params if they change
  useEffect(() => {
    setSearchQuery(queryParam);
    setSelectedCategory(categoryParam);
    setSelectedSort(sortParam);
    setSelectedPriceType(priceTypeParam);
  }, [queryParam, categoryParam, sortParam, priceTypeParam]);

  // Load real data from backend
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiGet<ProductSummary[]>("/products"),
        apiGet<Category[]>("/categories"),
      ]);

      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data);
      } else {
        setError(productsRes.error || "Failed to load marketplace products");
      }

      if (categoriesRes.success && categoriesRes.data) {
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
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.q !== undefined) {
      if (updates.q) params.set("q", updates.q);
      else params.delete("q");
    }
    if (updates.cat !== undefined) {
      if (updates.cat && updates.cat !== "all") params.set("cat", updates.cat);
      else params.delete("cat");
    }
    if (updates.sort !== undefined) {
      if (updates.sort && updates.sort !== "featured")
        params.set("sort", updates.sort);
      else params.delete("sort");
    }
    if (updates.price !== undefined) {
      if (updates.price && updates.price !== "all")
        params.set("price", updates.price);
      else params.delete("price");
    }

    const queryString = params.toString();
    router.push(`/explore${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  // Pure filtering & sorting logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Search Query filter (matches title, description, or tech stack tags)
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

    // 2. Category filter
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => {
        const matchedCat = categories.find((c) => c.slug === selectedCategory);
        if (!matchedCat) return true;
        return (
          p.category_name?.toLowerCase() === matchedCat.name.toLowerCase()
        );
      });
    }

    // 3. Price type filter
    if (selectedPriceType === "free") {
      result = result.filter((p) => p.price_paise === 0);
    } else if (selectedPriceType === "paid") {
      result = result.filter((p) => p.price_paise > 0);
    }

    // 4. Sorting logic
    result.sort((a, b) => {
      switch (selectedSort) {
        case "top_rated":
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.review_count - a.review_count;
        case "price_asc":
          return a.price_paise - b.price_paise;
        case "price_desc":
          return b.price_paise - a.price_paise;
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
    selectedSort,
  ]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateFilters({ q: value });
  };

  const handleCategorySelect = (catSlug: string) => {
    setSelectedCategory(catSlug);
    updateFilters({ cat: catSlug });
  };

  const handleSortSelect = (sortValue: string) => {
    setSelectedSort(sortValue);
    updateFilters({ sort: sortValue });
  };

  const handlePriceTypeSelect = (priceType: string) => {
    setSelectedPriceType(priceType);
    updateFilters({ price: priceType });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSort("featured");
    setSelectedPriceType("all");
    router.push("/explore", { scroll: false });
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== "all" ||
    selectedPriceType !== "all" ||
    selectedSort !== "featured";

  return (
    <div className="pt-3 md:pt-4 pb-12 space-y-6">
      {/* Hero Carousel Banner (5 Slides auto-advancing every 4 seconds) */}
      <section>
        <HeroCarousel />
      </section>

      {/* Filter Bar (Categories, Pricing, Sorting) */}
      <section className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Pills (Horizontal Scroll) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-1">
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-[#8535FC] text-white"
                  : "bg-[#27272A] text-[#A1A1AA] hover:text-[#EDEDF0] border border-[#414146] hover:border-[#52525B]"
              }`}
            >
              All Categories ({products.length})
            </button>

            {categories.map((cat) => {
              const count = products.filter(
                (p) => p.category_name?.toLowerCase() === cat.name.toLowerCase()
              ).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat.slug
                      ? "bg-[#8535FC] text-white"
                      : "bg-[#27272A] text-[#A1A1AA] hover:text-[#EDEDF0] border border-[#414146] hover:border-[#52525B]"
                  }`}
                >
                  {cat.name} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Pricing & Sorting */}
          <div className="flex flex-row items-center justify-between gap-2.5 w-full md:w-auto shrink-0">
            {/* Pricing Selector (All / Free / Paid) */}
            <div className="inline-flex p-1 rounded-lg bg-[#141417] border border-[#414146] shrink-0">
              <button
                type="button"
                onClick={() => handlePriceTypeSelect("all")}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedPriceType === "all"
                    ? "bg-[#8535FC] text-white"
                    : "text-[#A1A1AA] hover:text-[#EDEDF0]"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handlePriceTypeSelect("paid")}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedPriceType === "paid"
                    ? "bg-[#8535FC] text-white"
                    : "text-[#A1A1AA] hover:text-[#EDEDF0]"
                }`}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => handlePriceTypeSelect("free")}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedPriceType === "free"
                    ? "bg-[#8535FC] text-white"
                    : "text-[#A1A1AA] hover:text-[#EDEDF0]"
                }`}
              >
                Free
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[130px] sm:min-w-[160px]">
              <select
                value={selectedSort}
                onChange={(e) => handleSortSelect(e.target.value)}
                className="w-full h-9 px-3 pr-8 rounded-lg bg-[#27272A] border border-[#414146] text-xs font-medium text-[#EDEDF0] focus:outline-none focus:border-[#8535FC] appearance-none cursor-pointer truncate"
              >
                <option value="featured">Sort: Featured</option>
                <option value="top_rated">Sort: Top Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ArrowUpDown
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Summary Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#A1A1AA] pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono">
              Showing{" "}
              <span className="text-[#EDEDF0] font-semibold">
                {filteredProducts.length}
              </span>{" "}
              of {products.length} verified codebases
            </span>

            {/* Active Search Query Chip */}
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#8535FC]/10 border border-[#8535FC]/30 text-xs text-[#EDEDF0]">
                Search: <strong className="text-[#8535FC]">"{searchQuery}"</strong>
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="p-0.5 hover:text-[#EF4444] transition-colors"
                  aria-label="Clear search filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[#8535FC] hover:underline font-medium"
            >
              <RefreshCw size={11} />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </section>

      {/* Product Grid Area */}
      <section>
        {loading ? (
          /* Loading Skeletons strictly adhering to #27272A surface and #141417 inset */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-[#27272A] border border-[#414146] rounded-lg p-5 space-y-4 animate-pulse"
              >
                <div className="aspect-[16/9] w-full bg-[#141417] rounded-md" />
                <div className="h-5 w-3/4 bg-[#141417] rounded" />
                <div className="h-3 w-full bg-[#141417] rounded" />
                <div className="h-3 w-2/3 bg-[#141417] rounded" />
                <div className="pt-3 border-t border-[#414146] flex items-center justify-between">
                  <div className="h-4 w-20 bg-[#141417] rounded" />
                  <div className="h-7 w-24 bg-[#141417] rounded" />
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
          <div className="py-16 px-6 rounded-lg bg-[#27272A] border border-[#414146] text-center space-y-4">
            <div className="size-12 rounded-lg bg-[#141417] border border-[#414146] text-[#A1A1AA] flex items-center justify-center mx-auto">
              <SlidersHorizontal size={22} />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-[#EDEDF0]">
                No codebases match your criteria
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm mx-auto leading-relaxed">
                Try clearing your search query or selecting a different category to view available repositories.
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
          /* Active Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.public_id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Trust & Architecture Guarantee Banner */}
      <section className="pt-6 border-t border-[#414146]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-lg bg-[#27272A] border border-[#414146] space-y-2">
            <div className="size-8 rounded-lg bg-[#141417] border border-[#414146] text-[#8535FC] flex items-center justify-center">
              <Zap size={16} />
            </div>
            <h4 className="font-heading font-semibold text-sm text-[#EDEDF0]">
              Instant GitHub Transfer
            </h4>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Upon purchase, repository invites or clones are automated directly to your authenticated GitHub account.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#27272A] border border-[#414146] space-y-2">
            <div className="size-8 rounded-lg bg-[#141417] border border-[#414146] text-[#10B981] flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <h4 className="font-heading font-semibold text-sm text-[#EDEDF0]">
              Static Secret Auditing
            </h4>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Every codebase undergoes AST regex checks ensuring zero API keys, private tokens, or vulnerable dependencies.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#27272A] border border-[#414146] space-y-2">
            <div className="size-8 rounded-lg bg-[#141417] border border-[#414146] text-[#8535FC] flex items-center justify-center">
              <Lock size={16} />
            </div>
            <h4 className="font-heading font-semibold text-sm text-[#EDEDF0]">
              PostgreSQL Escrow
            </h4>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Double-entry balanced ledger journaling with Section 194-O TDS tax compliance guarantees safe buyer checkout.
            </p>
          </div>
        </div>
      </section>
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
