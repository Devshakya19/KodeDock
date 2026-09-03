"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Heart,
  Bell,
  Wallet,
  ChevronDown,
  Menu,
  Package,
  Download,
  LifeBuoy,
  Settings,
  LogOut,
  LayoutDashboard,
  ArrowUpRight,
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { apiGet } from "@/shared/lib/api/client";
import { WalletPopup } from "@/components/wallet/wallet-popup";
import { NotificationPopup } from "@/components/notifications/notification-popup";
import { CartPopup } from "@/components/cart/cart-popup";

interface BrowseHeaderProps {
  email?: string;
  fullName?: string;
  onOpenMobileSidebar?: () => void;
}

function getCartCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    return JSON.parse(localStorage.getItem("kodedock_cart") || "[]").length;
  } catch {
    return 0;
  }
}

export function BrowseHeader({ email = "", fullName, onOpenMobileSidebar }: BrowseHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  // Popups
  const [showWallet, setShowWallet] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const displayName = fullName || email.split("@")[0] || "User";
  const firstName = displayName.split(" ")[0];
  const initial = displayName.charAt(0).toUpperCase();

  // Fetch wallet & listen to cart updates
  useEffect(() => {
    apiGet<{ balance_paise: number }>("/wallet").then((res) => {
      if (res.data) setWalletBalance(res.data.balance_paise);
    });

    setCartCount(getCartCount());
    const handleCartUpdate = () => setCartCount(getCartCount());
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  // Keyboard shortcut cmd+k / ctrl+k
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    router.push(`/browse?${params.toString()}`);
  }

  return (
    <>
      <header className="sticky top-0 z-30 w-full h-16 md:h-20 bg-[#08070d]/85 backdrop-blur-xl border-b border-[#1e1b2e] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile Sidebar Trigger */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={onOpenMobileSidebar}
            className="w-10 h-10 rounded-full bg-[#141220] border border-[#232038] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Center/Left: Search Bar with Command Shortcut */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative group">
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates, UI kits, projects, boilerplates..."
              className="h-11 pl-11 pr-16 rounded-full bg-[#110f1c] border-[#232038] text-[13px] md:text-[14px] text-white placeholder:text-slate-500 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 shadow-inner transition-all w-full"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-[#1a172c] border border-[#2b2744] rounded-md shadow-sm">
                <span className="text-[11px]">⌘</span>K
              </kbd>
            </div>
          </div>
        </form>

        {/* Right: Quick Action Controls & Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Wallet Balance Pill */}
          <button
            onClick={() => setShowWallet(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/25 text-violet-300 hover:text-white transition-all group shadow-sm"
            title="Wallet Balance"
          >
            <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-3 h-3" />
            </div>
            <span className="text-[13px] font-bold tracking-tight text-slate-100">
              ₹{walletBalance !== null ? (walletBalance / 100).toLocaleString() : "0"}
            </span>
          </button>

          {/* Shopping Cart */}
          <button
            onClick={() => setShowCart(true)}
            className="relative w-10 h-10 rounded-full bg-[#131122] hover:bg-[#1b1730] border border-[#26223d] hover:border-violet-500/40 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md shadow-violet-900/50 ring-2 ring-[#08070d]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Wishlist Link */}
          <Link
            href="/dashboard/wishlist"
            className="hidden sm:flex w-10 h-10 rounded-full bg-[#131122] hover:bg-[#1b1730] border border-[#26223d] hover:border-violet-500/40 items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Wishlist"
          >
            <Heart className="w-4 h-4" />
          </Link>

          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative w-10 h-10 rounded-full bg-[#131122] hover:bg-[#1b1730] border border-[#26223d] hover:border-violet-500/40 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-[#131122] hover:bg-[#1c1733] border border-[#26223d] hover:border-violet-500/50 transition-all shadow-sm group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center text-white text-[13px] font-black shadow-md shadow-violet-900/30 ring-2 ring-[#221c38] group-hover:ring-violet-500/50 transition-all">
                {initial}
              </div>

              <span className="hidden md:inline-block text-[13px] font-bold text-slate-200 group-hover:text-white max-w-[100px] truncate">
                {firstName}
              </span>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-violet-300 transition-transform duration-200 ${
                  profileOpen ? "rotate-180 text-violet-400" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2.5 w-[280px] bg-[#0e0c1a]/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9),0_0_30px_-5px_rgba(139,92,246,0.15)] border border-[#282244] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Profile Header Card */}
                  <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-[#161226] border border-[#2b2446]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md ring-2 ring-[#332a54]">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-bold text-white truncate">{displayName}</p>
                        <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase">
                          Buyer
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{email}</p>
                    </div>
                  </div>

                  {/* Quick Stat Pill inside menu */}
                  <div className="grid grid-cols-2 gap-2 mb-2 px-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setShowWallet(true);
                      }}
                      className="p-2 rounded-xl bg-[#130f24] border border-[#231b38] hover:border-violet-500/40 text-left transition-all group"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Wallet
                      </span>
                      <span className="text-[13px] font-extrabold text-violet-300 group-hover:text-violet-200">
                        ₹{walletBalance !== null ? (walletBalance / 100).toLocaleString() : "0"}
                      </span>
                    </button>

                    <Link
                      href="/dashboard/purchases"
                      onClick={() => setProfileOpen(false)}
                      className="p-2 rounded-xl bg-[#130f24] border border-[#231b38] hover:border-violet-500/40 text-left transition-all group"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Purchases
                      </span>
                      <span className="text-[13px] font-extrabold text-slate-200 group-hover:text-white flex items-center gap-1">
                        View <ArrowUpRight className="w-3 h-3 text-violet-400" />
                      </span>
                    </Link>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-300 hover:bg-[#1b1633] hover:text-white rounded-xl transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-violet-400" /> Buyer Dashboard
                    </Link>
                    <Link
                      href="/dashboard/purchases"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-300 hover:bg-[#1b1633] hover:text-white rounded-xl transition-colors"
                    >
                      <Package className="w-4 h-4 text-violet-400" /> My Purchases
                    </Link>
                    <Link
                      href="/dashboard/downloads"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-300 hover:bg-[#1b1633] hover:text-white rounded-xl transition-colors"
                    >
                      <Download className="w-4 h-4 text-violet-400" /> Downloads &amp; Licenses
                    </Link>
                    <Link
                      href="/dashboard/wishlist"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-300 hover:bg-[#1b1633] hover:text-white rounded-xl transition-colors"
                    >
                      <Heart className="w-4 h-4 text-violet-400" /> My Wishlist
                    </Link>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-[#282244] to-transparent my-1.5" />

                  {/* Settings & Support */}
                  <div className="space-y-0.5">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-300 hover:bg-[#1b1633] hover:text-white rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" /> Account Settings
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-300 hover:bg-[#1b1633] hover:text-white rounded-xl transition-colors"
                    >
                      <LifeBuoy className="w-4 h-4 text-slate-400" /> Help Center
                    </Link>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-[#282244] to-transparent my-1.5" />

                  {/* Logout */}
                  <form
                    action="/api/auth/logout"
                    method="post"
                    className="p-0.5"
                    onSubmit={() => {
                      try {
                        localStorage.removeItem("kodedock_cart");
                      } catch {}
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" /> Log out
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Popups */}
      {showCart && <CartPopup onClose={() => setShowCart(false)} />}
      {showNotifications && <NotificationPopup onClose={() => setShowNotifications(false)} />}
      {showWallet && <WalletPopup onClose={() => setShowWallet(false)} />}
    </>
  );
}
