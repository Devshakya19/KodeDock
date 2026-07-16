"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Menu, ShoppingCart, Bell, LayoutDashboard } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Web Templates", value: "web-templates" },
  { label: "Mobile Apps", value: "mobile-apps" },
  { label: "UI Kits", value: "ui-kits" },
  { label: "B.Tech Projects", value: "btech-projects" },
  { label: "Boilerplates", value: "boilerplates" },
  { label: "API Templates", value: "api-templates" },
];

function getShortName(fullName?: string, email?: string): string {
  if (fullName && fullName.trim()) {
    const parts = fullName.trim().split(/\s+/);
    return parts[0]; // First name only
  }
  if (email) {
    return email.split("@")[0];
  }
  return "User";
}

interface BrowseNavbarProps {
  email: string;
  fullName?: string;
  activeCategory?: string;
  searchQuery?: string;
}

export function BrowseNavbar({
  email,
  fullName,
  activeCategory = "",
  searchQuery = "",
}: BrowseNavbarProps) {
  const router = useRouter();
  const [search, setSearch] = useState(searchQuery);
  const shortName = getShortName(fullName, email);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (activeCategory) params.set("category", activeCategory);
    router.push(`/browse?${params.toString()}`);
  }

  function handleCategoryChange(categoryValue: string) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryValue) params.set("category", categoryValue);
    router.push(`/browse?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">
        <CodeHaatLogo href="/browse" />

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search templates, UI kits, projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-10 pr-20 border-slate-300 bg-slate-50 text-sm"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 text-xs font-semibold"
            >
              Search
            </Button>
          </form>
        </div>

        {/* Right side - Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden lg:inline">Dashboard</span>
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden lg:inline">Cart</span>
          </Link>
          <Link
            href="/notifications"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden lg:inline">Notifications</span>
          </Link>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-sm font-bold text-white">
              {shortName[0]?.toUpperCase() || "U"}
            </div>
            <span className="text-sm font-medium text-slate-700">{shortName}</span>
          </Link>
          <form action="/api/auth/logout" method="post">
            <Button variant="ghost" size="sm" className="text-slate-500 text-xs">
              Logout
            </Button>
          </form>
        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden ml-auto">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex flex-col gap-4 mt-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 pl-10 border-slate-300 bg-slate-50 text-sm"
                />
              </form>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
              >
                <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-sm font-bold text-white">
                  {shortName[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-950">{shortName}</div>
                  <div className="text-xs text-slate-500">{email}</div>
                </div>
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                My Dashboard
              </Link>
              <Link href="/dashboard/purchases" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                My Purchases
              </Link>
              <Link href="/cart" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                Cart
              </Link>
              <Link href="/notifications" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                Notifications
              </Link>
              <form action="/api/auth/logout" method="post">
                <Button variant="outline" className="w-full border-slate-300 text-slate-700">
                  Logout
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </nav>

      {/* Category tabs */}
      <div className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeCategory === cat.value
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
