"use client";

import { useEffect, useState } from "react";
import { BrowseNavbar } from "./components/browse-navbar";
import { ProductGrid } from "./components/product-grid";
import { Sparkles, TrendingUp, Zap } from "lucide-react";
import { auth } from "@/shared/lib/auth";

interface BrowsePageProps {
  searchParams?: Promise<{ search?: string; category?: string }> | { search?: string; category?: string };
}

export default function BrowsePage({ searchParams }: BrowsePageProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const userData = await auth.getUser();
      if (!userData) {
        window.location.href = "/login";
        return;
      }
      setUser(userData);
      setLoading(false);
    }
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  // Handle both Promise and regular object for searchParams
  const params = searchParams && typeof searchParams === 'object' && 'then' in searchParams
    ? {} // Will be resolved by the parent
    : searchParams || {};
  const searchQuery = (params as any)?.search || "";
  const categoryFilter = (params as any)?.category || "";
  const fullName = user.full_name || "";

  return (
    <div className="min-h-screen bg-slate-50">
      <BrowseNavbar
        email={user.email}
        fullName={fullName}
        activeCategory={categoryFilter}
        searchQuery={searchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {fullName ? fullName.split(" ")[0] : "there"}!
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-lg">
              Discover production-ready code assets from top Indian developers. GitHub delivery, instant access.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>2,400+ products</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>New arrivals daily</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Instant GitHub delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : categoryFilter
                ? `${categoryFilter.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}`
                : "Trending Products"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || categoryFilter ? "Filtered results" : "Most popular this week"}
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid searchQuery={searchQuery} categoryFilter={categoryFilter} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} CodeHaat. All rights reserved. Made with ♥ in India.
          </p>
        </div>
      </footer>
    </div>
  );
}
