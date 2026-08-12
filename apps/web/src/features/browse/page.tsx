"use client";

import { useEffect, useState } from "react";
import { BrowseNavbar } from "./components/browse-navbar";
import { ProductGrid } from "./components/product-grid";
import { BrowseFilters } from "./components/browse-filters";
import { Sparkles, ArrowRight, Zap, Code2, Cpu } from "lucide-react";
import { auth, type User } from "@/shared/lib/auth";

interface BrowsePageProps {
  searchParams?: { search?: string; category?: string };
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

  const searchQuery = searchParams?.search || "";
  const categoryFilter = searchParams?.category || "";
  const fullName = user.full_name || user.email.split("@")[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900">
      <BrowseNavbar
        email={user.email}
        fullName={fullName}
        searchQuery={searchQuery}
      />

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

      {/* Premium Footer */}
      <footer className="border-t border-slate-200/60 bg-white mt-20 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
            
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-6 h-6 text-blue-600" />
                <span className="text-[18px] font-black tracking-tight text-slate-900">CodeHaat</span>
              </div>
              <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-6 max-w-xs">
                India's premium marketplace for developers. Buy and sell production-grade code assets with instant GitHub delivery.
              </p>
              <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
                <span>Made with ❤️ in India</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-bold text-slate-900 uppercase tracking-wider mb-2">Marketplace</span>
              <a href="/browse" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">All Products</a>
              <a href="/browse?category=web-templates" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Web Templates</a>
              <a href="/browse?category=ui-kits" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">UI Kits</a>
              <a href="/browse?category=mobile-apps" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Mobile Apps</a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-bold text-slate-900 uppercase tracking-wider mb-2">Resources</span>
              <a href="/developer" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Become a Seller</a>
              <a href="/blog" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Blog & News</a>
              <a href="/contact" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Help Center</a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-bold text-slate-900 uppercase tracking-wider mb-2">Legal</span>
              <a href="/terms" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Terms of Service</a>
              <a href="/privacy" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Privacy Policy</a>
              <a href="/license" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">License Details</a>
              <a href="/cookies" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Cookie Policy</a>
            </div>
            
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-100 gap-4">
            <p className="text-[13px] font-medium text-slate-400">
              &copy; {new Date().getFullYear()} CodeHaat. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
