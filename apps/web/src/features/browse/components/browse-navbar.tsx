"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Menu, ShoppingCart, Bell, Wallet, User, Package } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { apiGet } from "@/shared/lib/api";
import { WalletPopup } from "@/features/wallet/components/wallet-popup";
import { NotificationPopup } from "@/features/notifications/components/notification-popup";
import { CartPopup } from "@/features/cart/components/cart-popup";

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
    return parts[0];
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
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    apiGet<{ balance_paise: number }>("/wallet").then((res) => {
      if (res.data) setWalletBalance(res.data.balance_paise);
    });
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (activeCategory) params.set("category", activeCategory);
    router.push(`/browse?${params.toString()}`);
    setMobileOpen(false);
  }

  function handleCategoryChange(categoryValue: string) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryValue) params.set("category", categoryValue);
    router.push(`/browse?${params.toString()}`);
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center gap-4 md:gap-6">
          <CodeHaatLogo href="/browse" />

          {/* Desktop search */}
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

          {/* Desktop right icons */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setShowCart(true)}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowNotifications(true)}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowWallet(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              {walletBalance !== null && (
                <span className="text-xs font-semibold">₹{(walletBalance / 100).toLocaleString()}</span>
              )}
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <Link
              href="/dashboard/profile"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-950 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
            >
              {shortName[0]?.toUpperCase() || "U"}
            </Link>
          </div>

          {/* Mobile: hamburger + wallet */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <button
              onClick={() => setShowWallet(true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Wallet className="w-4 h-4" />
              {walletBalance !== null && (
                <span className="text-xs font-semibold">₹{(walletBalance / 100).toLocaleString()}</span>
              )}
            </button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Profile header */}
                  <Link
                    href="/dashboard/profile"
                    onClick={closeMobile}
                    className="flex items-center gap-3 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-full bg-slate-950 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {shortName[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-950 truncate">{shortName}</div>
                      <div className="text-xs text-slate-500 truncate">{email}</div>
                    </div>
                  </Link>

                  {/* Search */}
                  <div className="p-4 border-b border-slate-100">
                    <form onSubmit={handleSearch} className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-10 pl-10 border-slate-300 bg-slate-50 text-sm"
                      />
                    </form>
                  </div>

                  {/* Nav links */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    <button
                      onClick={() => { setShowCart(true); closeMobile(); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors text-left"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Cart
                    </button>
                    <button
                      onClick={() => { setShowNotifications(true); closeMobile(); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors text-left"
                    >
                      <Bell className="w-4 h-4" />
                      Notifications
                    </button>
                    <Link
                      href="/dashboard/purchases"
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      My Purchases
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
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

      {showCart && <CartPopup onClose={() => setShowCart(false)} />}
      {showNotifications && <NotificationPopup onClose={() => setShowNotifications(false)} />}
      {showWallet && <WalletPopup onClose={() => setShowWallet(false)} />}
    </>
  );
}
