import React from "react";
import { CatalogView } from "../components/catalog/CatalogView";
import type { StoreProduct, StoreCategory } from "../types/store";

export const dynamic = "force-dynamic";

const API_BASE = process.env.INTERNAL_API_URL || "http://localhost:4000";

async function fetchProducts(): Promise<StoreProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Failed to fetch products from PostgreSQL backend:", error);
    return [];
  }
}

async function fetchCategories(): Promise<StoreCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Failed to fetch categories from PostgreSQL backend:", error);
    return [];
  }
}

interface PageProps {
  searchParams?: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    priceRange?: string;
  }>;
}

export default async function ExploreBrowsePage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  const initialFilters = {
    category: resolvedSearchParams.category || "all",
    search: resolvedSearchParams.search || "",
    sort: resolvedSearchParams.sort || "popular",
    priceRange: resolvedSearchParams.priceRange || "all",
  };

  return (
    <CatalogView
      initialProducts={products}
      categories={categories}
      initialFilters={initialFilters}
    />
  );
}
