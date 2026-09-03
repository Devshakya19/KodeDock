"use client";

import { useState } from "react";
import { BrowseSidebar } from "./components/browse-sidebar";
import { BrowseHeader } from "./components/browse-header";
import { BrowseHero } from "./components/browse-hero";
import { BrowseFilters } from "./components/browse-filters";
import { ProductGrid } from "./components/product-grid";
import { Sheet, SheetContent, SheetTitle } from "@/shared/ui/sheet";

interface BrowseClientShellProps {
  email: string;
  fullName?: string;
  searchQuery: string;
  categoryFilter: string;
  sortFilter: string;
  priceFilter: string;
}

export function BrowseClientShell({
  email,
  fullName,
  searchQuery,
  categoryFilter,
  sortFilter,
  priceFilter,
}: BrowseClientShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#07060b] text-slate-900 dark:text-slate-100 font-sans selection:bg-violet-500/30 selection:text-white transition-colors duration-200">
      {/* Desktop Left Sidebar (Fixed) */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40">
        <BrowseSidebar />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="p-0 w-[280px] bg-white dark:bg-[#08070d] border-r border-slate-200 dark:border-[#1e1b2e]"
        >
          <SheetTitle className="sr-only">Browse Navigation</SheetTitle>
          <BrowseSidebar isMobile={true} onCloseMobile={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-w-0">
        {/* Top Header */}
        <BrowseHeader
          email={email}
          fullName={fullName}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-[1600px] mx-auto">
          {/* Hero Section */}
          <BrowseHero />

          {/* Filter Bar & Section Heading */}
          <BrowseFilters
            activeCategory={categoryFilter}
            activeSort={sortFilter}
            activeSearch={searchQuery}
          />

          {/* Product Cards Grid */}
          <ProductGrid
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            sortFilter={sortFilter}
            priceFilter={priceFilter}
          />
        </main>
      </div>
    </div>
  );
}
