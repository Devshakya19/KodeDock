"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Menu, ShoppingCart, Bell, Wallet, User, Package, ChevronDown, Settings, LogOut, LayoutDashboard, LifeBuoy } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { apiGet } from "@/shared/lib/api";
import { WalletPopup } from "@/features/wallet/components/wallet-popup";
import { NotificationPopup } from "@/features/notifications/components/notification-popup";
import { CartPopup } from "@/features/cart/components/cart-popup";

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

function getCartCount(): number {
  if (typeof window === "undefined") return 0;
  try { return JSON.parse(localStorage.getItem("codehaat_cart") || "[]").length; } catch { return 0; }
}

interface BrowseNavbarProps {
  email: string;
  fullName?: string;
  searchQuery?: string;
}

export function BrowseNavbar({
  email,
  fullName,
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
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    apiGet<{ balance_paise: number }>("/wallet").then((res) => {
      if (res.data) setWalletBalance(res.data.balance_paise);
    });
    setCartCount(getCartCount());

    const handleCartUpdate = () => setCartCount(getCartCount());
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const currentParams = new URLSearchParams(window.location.search);
    const category = currentParams.get("category");
    if (category) params.set("category", category);
    
    router.push(`/browse?${params.toString()}`);
    setMobileOpen(false);
  }

  function closeMobile() { setMobileOpen(false); }

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/50" : "bg-[#F8FAFC] border-b border-transparent"}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <CodeHaatLogo href="/browse" />
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <Input
                placeholder="Search templates, UI kits, projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-11 pr-24 rounded-full border-slate-200/60 bg-white/60 focus:bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] focus-visible:ring-4 focus-visible:ring-blue-600/10 focus-visible:border-blue-600 transition-all text-[15px] font-medium"
              />
              <div className="absolute inset-y-0 right-1.5 flex items-center">
                <Button type="submit" size="sm" className="h-9 px-5 rounded-full bg-slate-900 text-white text-[13px] font-bold hover:bg-blue-600 shadow-sm hover:shadow-blue-600/20 transition-all">
                  Search
                </Button>
              </div>
            </form>
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            
            {/* Wallet Pill */}
            <button 
              onClick={() => setShowWallet(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50/80 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-200/50 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="flex items-center pr-1">
                {walletBalance !== null ? (
                  <span className="text-[14px] font-bold text-emerald-900 tracking-tight">₹{(walletBalance / 100).toLocaleString()}</span>
                ) : (
                  <span className="text-[14px] font-bold text-emerald-900/50 tracking-tight">...</span>
                )}
              </div>
            </button>

            <div className="w-px h-6 bg-slate-200/80 mx-1" />

            {/* Quick Actions Container */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowCart(true)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => setShowNotifications(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="ml-2 flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200/60 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[13px] font-bold text-white shadow-inner">
                  {shortName[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-[13px] font-bold text-slate-700 max-w-[80px] truncate">{shortName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {profileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-3 border-b border-slate-100 mb-1">
                      <p className="text-[13px] font-bold text-slate-900">{fullName || shortName}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{email}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Buyer Dashboard
                      </Link>

                      <Link
                        href="/dashboard/purchases"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        My Purchases
                      </Link>

                      <Link
                        href="/dashboard/wallet"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <Wallet className="w-4 h-4 text-slate-400" />
                        Wallet & Transactions
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 my-1 py-1">
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>

                      <Link
                        href="/dashboard/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Account Settings
                      </Link>
                      
                      <Link
                        href="/contact"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <LifeBuoy className="w-4 h-4 text-slate-400" />
                        Help Center
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <form action="/api/auth/logout" method="post">
                        <button
                          type="submit"
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Right Actions */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <button 
              onClick={() => setShowCart(true)} 
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-slate-200/60 bg-white shadow-sm"><Menu className="h-5 w-5 text-slate-700" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 bg-[#F8FAFC]">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Mobile Profile Header */}
                  <div className="p-6 bg-white border-b border-slate-200/60">
                    <Link href="/dashboard" onClick={closeMobile} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-[16px] font-bold text-white shadow-sm">{shortName[0]?.toUpperCase() || "U"}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[16px] font-bold text-slate-900 truncate">{shortName}</div>
                        <div className="text-[12px] text-slate-500 truncate">{email}</div>
                      </div>
                    </Link>
                    
                    <button onClick={() => { setShowWallet(true); closeMobile(); }} className="mt-6 flex items-center justify-between w-full p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-200/50 flex items-center justify-center"><Wallet className="w-4 h-4 text-emerald-700" /></div>
                        <span className="text-[14px] font-bold text-emerald-900">Wallet Balance</span>
                      </div>
                      <span className="text-[16px] font-black text-emerald-700 tracking-tight">₹{((walletBalance ?? 0) / 100).toLocaleString()}</span>
                    </button>
                  </div>

                  {/* Mobile Search */}
                  <div className="p-4 bg-white border-b border-slate-200/60">
                    <form onSubmit={handleSearch} className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input placeholder="Search marketplace..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 pl-11 rounded-full border-slate-200 bg-slate-50 text-[15px] font-medium" />
                    </form>
                  </div>

                  {/* Mobile Menu Links */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3 mt-2">Menu</p>
                    
                    <Link href="/dashboard" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[14px] font-bold text-slate-700 hover:bg-white hover:shadow-sm transition-all">
                      <User className="w-4.5 h-4.5 text-slate-400" /> Dashboard
                    </Link>
                    <Link href="/dashboard/purchases" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[14px] font-bold text-slate-700 hover:bg-white hover:shadow-sm transition-all">
                      <Package className="w-4.5 h-4.5 text-slate-400" /> My Purchases
                    </Link>
                    <button onClick={() => { setShowCart(true); closeMobile(); }} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-[14px] font-bold text-slate-700 hover:bg-white hover:shadow-sm transition-all text-left">
                      <ShoppingCart className="w-4.5 h-4.5 text-slate-400" /> Cart 
                      {cartCount > 0 && <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
                    </button>
                    <button onClick={() => { setShowNotifications(true); closeMobile(); }} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-[14px] font-bold text-slate-700 hover:bg-white hover:shadow-sm transition-all text-left">
                      <Bell className="w-4.5 h-4.5 text-slate-400" /> Notifications
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      {showCart && <CartPopup onClose={() => setShowCart(false)} />}
      {showNotifications && <NotificationPopup onClose={() => setShowNotifications(false)} />}
      {showWallet && <WalletPopup onClose={() => setShowWallet(false)} />}
    </>
  );
}
