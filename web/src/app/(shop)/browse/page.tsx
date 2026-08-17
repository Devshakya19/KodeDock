"use client";

import { useEffect, useState, use } from "react";
import { Navbar } from "@/components/layout/navbar";
import { ProductGrid } from "@/app/(shop)/browse/components/product-grid";
import { BrowseFilters } from "@/app/(shop)/browse/components/browse-filters";
import { Sparkles, ArrowRight, Zap, Code2, Cpu } from "lucide-react";
import { auth, type User } from "@/lib/auth/client";

interface BrowsePageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

export default function BrowsePage({ searchParams }: BrowsePageProps) {
  const [user, setUser] = useState<User | null>(null);
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          Loading marketplace...
        </div>
      </div>
    );
  }

  if (!user) return null;

  const params = use(searchParams);
  const searchQuery = params?.search || "";
  const categoryFilter = params?.category || "";
  const fullName = user.full_name || user.email.split("@")[0];

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {/* Clean Minimal Hero Section */}
        <div className="bg-white rounded-3xl p-8 md:p-14 mb-10 border border-slate-200/60 shadow-sm relative overflow-hidden">
          
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
          
          <div className="relative z-10 grid md:grid-cols-5 gap-8 items-center">
            
            <div className="md:col-span-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-bold uppercase tracking-wider mb-6 text-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
                Premium Marketplace
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tight text-slate-900">
                Welcome back, {fullName ? fullName.split(" ")[0] : "Creator"}.
              </h1>
              
              <p className="text-slate-500 text-[15px] md:text-[17px] leading-relaxed max-w-xl mb-8 font-medium">
                Discover production-ready templates, UI kits, and boilerplates from top developers. Delivered instantly to your GitHub.
              </p>
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200/60">
                    <Code2 className="w-4.5 h-4.5 text-slate-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-slate-900">2,400+</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Premium Assets</span>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-slate-200/80 hidden sm:block" />
                
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200/60">
                    <Zap className="w-4.5 h-4.5 text-amber-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-slate-900">Instant</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">GitHub Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Graphic Element (Hidden on small screens) */}
            <div className="hidden md:flex md:col-span-2 justify-end relative">
              <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center bg-[#F8FAFC] rounded-3xl border border-slate-200/50 shadow-inner group overflow-hidden">
                <div className="absolute top-5 left-5 flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                </div>
                <Cpu className="w-24 h-24 text-slate-200 group-hover:scale-110 group-hover:text-blue-100 transition-all duration-500" />
                
                {/* Decorative Code Lines */}
                <div className="absolute bottom-6 left-6 space-y-2 opacity-50">
                  <div className="w-24 h-1.5 rounded-full bg-slate-200" />
                  <div className="w-16 h-1.5 rounded-full bg-slate-200" />
                  <div className="w-32 h-1.5 rounded-full bg-slate-200" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : categoryFilter
                ? `${categoryFilter.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}`
                : "Trending Products"}
              
              {!searchQuery && !categoryFilter && (
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              )}
            </h2>
            <p className="text-[15px] text-slate-500 font-medium mt-1">
              {searchQuery || categoryFilter ? "Showing filtered assets from the marketplace" : "Most popular digital assets this week"}
            </p>
          </div>
          
          {!searchQuery && !categoryFilter && (
            <button className="hidden sm:flex items-center gap-1.5 text-[14px] font-bold text-blue-600 hover:text-blue-700 transition-colors group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Filters Bar */}
        <BrowseFilters activeCategory={categoryFilter} />

        {/* Product Grid Area */}
        <ProductGrid searchQuery={searchQuery} categoryFilter={categoryFilter} />
      </main>
    </>
  );
}
