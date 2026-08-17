"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search, Menu, ShoppingCart, Bell, Wallet, User, Package, ChevronDown,
  Settings, LogOut, LayoutDashboard, LifeBuoy, Store, Star, Sparkles,
  Heart, Download, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeHaatLogo } from "@/components/brand/codehaat-logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { apiGet } from "@/lib/api/client";
import { WalletPopup } from "@/components/wallet/wallet-popup";
import { NotificationPopup } from "@/components/notifications/notification-popup";
import { CartPopup } from "@/components/cart/cart-popup";

// Navigation configs
const BUYER_NAV_PILLS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Purchases", href: "/dashboard/purchases", icon: ShoppingCart },
  { label: "Browse", href: "/browse", icon: Store },
];

const SELLER_NAV_ITEMS = [
  { label: "Dashboard", href: "/seller", icon: LayoutDashboard },
  { label: "Products", href: "/seller/products", icon: Package },
  { label: "Orders", href: "/seller/orders", icon: ShoppingCart },
  { label: "Reviews", href: "/seller/reviews", icon: Star },
  { label: "Wallet", href: "/seller/wallet", icon: Wallet },
];

function getShortName(fullName?: string, email?: string): string {
  if (fullName && fullName.trim()) return fullName.trim().split(/\s+/)[0];
  if (email) return email.split("@")[0];
  return "User";
}

function getCartCount(): number {
  if (typeof window === "undefined") return 0;
  try { return JSON.parse(localStorage.getItem("codehaat_cart") || "[]").length; } catch { return 0; }
}

interface NavbarProps {
  variant: "browse" | "dashboard" | "seller";
  email?: string;
  fullName?: string;
  searchQuery?: string;
}

export function Navbar({ variant, email = "", fullName, searchQuery = "" }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shortName = getShortName(fullName, email);
  
  // States
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Variant specific states
  const [search, setSearch] = useState(searchParams?.get("search") || searchQuery);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Popups
  const [showWallet, setShowWallet] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch variant specific data
  useEffect(() => {
    if (variant === "browse") {
      apiGet<{ balance_paise: number }>("/wallet").then((res) => {
        if (res.data) setWalletBalance(res.data.balance_paise);
      });
      setCartCount(getCartCount());
      const handleCartUpdate = () => setCartCount(getCartCount());
      window.addEventListener("cart-updated", handleCartUpdate);
      return () => window.removeEventListener("cart-updated", handleCartUpdate);
    }
    
    if (variant === "seller") {
      const fetchUnread = async () => {
        try {
          const res = await apiGet<any[]>("/notifications");
          if (res.success && res.data) {
            setUnreadCount(res.data.filter((n: any) => !n.is_read).length);
          }
        } catch (e) {}
      };
      fetchUnread();
      const timer = setInterval(fetchUnread, 30000);
      return () => clearInterval(timer);
    }
  }, [variant]);

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

  const renderProfileDropdown = () => (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
      <div className="absolute right-0 mt-2.5 w-[280px] bg-white rounded-2xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 px-3 py-3.5 mb-1.5 rounded-xl bg-slate-50/80 border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white">
            <span className="text-sm font-bold text-white">{shortName[0]?.toUpperCase() || "U"}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-slate-900 truncate">{fullName || shortName}</p>
            <p className="text-[12px] font-medium text-slate-500 truncate">{email}</p>
          </div>
        </div>

        <div className="space-y-0.5">
          {variant === "seller" ? (
            SELLER_NAV_ITEMS.map((item) => {
              const isActive = item.href === "/seller" ? pathname === "/seller" : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setProfileDropdownOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-colors ${isActive ? "bg-slate-100/80 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"}`}>
                  <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })
          ) : (
            <>
              <Link href="/dashboard" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"><LayoutDashboard className="w-[18px] h-[18px] text-slate-400" /> Buyer Dashboard</Link>
              <Link href="/dashboard/purchases" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"><Package className="w-[18px] h-[18px] text-slate-400" /> My Purchases</Link>
              <Link href="/dashboard/downloads" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"><Download className="w-[18px] h-[18px] text-slate-400" /> Downloads & Licenses</Link>
              <Link href="/dashboard/wishlist" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"><Heart className="w-[18px] h-[18px] text-slate-400" /> Wishlist</Link>
              <Link href="/dashboard/wallet" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"><Wallet className="w-[18px] h-[18px] text-slate-400" /> Wallet & Transactions</Link>
            </>
          )}
        </div>

        <div className="h-px bg-slate-100 my-2 mx-3" />

        <div className="space-y-0.5">
          {variant === "seller" ? (
            <>
              <Link href="/browse" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"><Store className="w-[18px] h-[18px] text-slate-400" /> Browse Shop</Link>
              <Link href="/seller/settings" onClick={() => setProfileDropdownOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-colors ${pathname.startsWith("/seller/settings") ? "bg-slate-100/80 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"}`}><Settings className={`w-[18px] h-[18px] ${pathname.startsWith("/seller/settings") ? "text-slate-900" : "text-slate-400"}`} /> Account Settings</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/billing" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"><FileText className="w-[18px] h-[18px] text-slate-400" /> Billing & Invoices</Link>
              <Link href="/dashboard/settings" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"><Settings className="w-[18px] h-[18px] text-slate-400" /> Account Settings</Link>
              <Link href="/contact" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"><LifeBuoy className="w-[18px] h-[18px] text-slate-400" /> Help Center</Link>
            </>
          )}
        </div>

        <div className="h-px bg-slate-100 my-2 mx-3" />
        <form action="/api/auth/logout" method="post" className="px-1 pb-1 pt-0.5">
          <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors">
            <LogOut className="w-[18px] h-[18px] text-rose-500" /> Log out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/50" : "bg-[#F8FAFC] border-b border-transparent"}`}>
        <nav className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 h-16 md:h-20 flex items-center justify-between">
          
          {/* LEFT: Logo */}
          <div className="flex items-center flex-1 min-w-0">
            <CodeHaatLogo href={variant === "seller" ? "/seller" : variant === "dashboard" ? "/dashboard" : "/browse"} />
          </div>

          {/* MIDDLE: Search */}
          {(variant === "browse" || variant === "dashboard") && (
            <div className="hidden md:flex w-full max-w-[500px] lg:max-w-[600px] px-4">
              <form onSubmit={handleSearch} className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <Input placeholder="Search templates, UI kits, projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 md:h-12 pl-11 pr-24 rounded-full border-slate-200/60 bg-white/60 focus:bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] focus-visible:ring-4 focus-visible:ring-blue-600/10 focus-visible:border-blue-600 transition-all text-[15px] font-medium" />
                <div className="absolute inset-y-0 right-1.5 flex items-center">
                  <Button type="submit" size="sm" className="h-8 md:h-9 px-4 md:px-5 rounded-full bg-slate-900 text-white text-[13px] font-bold hover:bg-blue-600 shadow-sm hover:shadow-blue-600/20 transition-all">Search</Button>
                </div>
              </form>
            </div>
          )}
          
          {variant === "seller" && <div className="hidden md:flex w-full max-w-[500px] lg:max-w-[600px] px-4" />}

          {/* RIGHT: Actions */}
          <div className="hidden md:flex items-center justify-end gap-3 lg:gap-4 flex-1 min-w-0">
            {(variant === "browse" || variant === "dashboard") && (
              <div className="flex items-center gap-3 bg-white px-2 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
                <button onClick={() => setShowWallet(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer group">
                  <div className="w-5 h-5 rounded-full bg-emerald-200/50 flex items-center justify-center"><Wallet className="w-3 h-3 text-emerald-700" /></div>
                  <div className="flex items-center">
                    {walletBalance !== null ? <span className="text-[13px] font-bold text-emerald-900 tracking-tight">₹{(walletBalance / 100).toLocaleString()}</span> : <span className="text-[13px] font-bold text-emerald-900/50 tracking-tight">...</span>}
                  </div>
                </button>
                <div className="w-px h-5 bg-slate-200/80" />
                <button onClick={() => setShowCart(true)} className="relative flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm ring-2 ring-white">{cartCount}</span>}
                </button>
                <button onClick={() => setShowNotifications(true)} className="relative flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            )}

            {variant === "seller" && (
              <Link href="/notifications" className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200/60 transition-colors cursor-pointer relative shadow-sm">
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </Link>
            )}

            <div className="relative">
              <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200/60 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[13px] font-bold text-white shadow-inner">{shortName[0]?.toUpperCase() || "U"}</div>
                <span className="text-[13px] font-bold text-slate-700 max-w-[80px] truncate">{shortName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {profileDropdownOpen && renderProfileDropdown()}
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2 shrink-0">
            {(variant === "browse" || variant === "dashboard") && (
              <button onClick={() => setShowCart(true)} className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60 shadow-sm">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm ring-2 ring-white">{cartCount}</span>}
              </button>
            )}
            
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-slate-200/60 bg-white shadow-sm"><Menu className="h-5 w-5 text-slate-700" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0 border-l border-slate-200">
                <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full bg-white">
                  <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                    <Link href={variant === "seller" ? "/seller/settings/profile" : "/dashboard/profile"} onClick={closeMobile} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center shadow-md ring-4 ring-white">
                        <span className="text-lg font-bold text-white">{shortName[0]?.toUpperCase() || "U"}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-slate-900 truncate">{fullName || shortName}</p>
                        <p className="text-[13px] font-medium text-slate-500 truncate">{email}</p>
                      </div>
                    </Link>
                    
                    {(variant === "browse" || variant === "dashboard") && (
                      <button onClick={() => { setShowWallet(true); closeMobile(); }} className="mt-6 flex items-center justify-between w-full p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-200/50 flex items-center justify-center"><Wallet className="w-4 h-4 text-emerald-700" /></div>
                          <span className="text-[14px] font-bold text-emerald-900">Wallet Balance</span>
                        </div>
                        <span className="text-[16px] font-black text-emerald-700 tracking-tight">₹{((walletBalance ?? 0) / 100).toLocaleString()}</span>
                      </button>
                    )}
                  </div>

                  {variant === "browse" && (
                    <div className="p-4 bg-white border-b border-slate-200/60">
                      <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="Search marketplace..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 pl-11 rounded-full border-slate-200 bg-slate-50 text-[15px] font-medium" />
                      </form>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">Menu</p>
                      
                      {variant === "seller" ? (
                        SELLER_NAV_ITEMS.map((item) => {
                          const isActive = item.href === "/seller" ? pathname === "/seller" : pathname.startsWith(item.href);
                          return (
                            <Link key={item.href} href={item.href} onClick={closeMobile} className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-semibold transition-all ${isActive ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                              <item.icon className={`w-5 h-5 ${isActive ? "text-slate-300" : "text-slate-400"}`} /> {item.label}
                            </Link>
                          );
                        })
                      ) : (
                        <>
                          {(variant === "browse" || variant === "dashboard") && (
                            <>
                              <button onClick={() => { setShowCart(true); closeMobile(); }} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-[14px] font-bold text-slate-700 hover:bg-slate-50 transition-all text-left">
                                <ShoppingCart className="w-4.5 h-4.5 text-slate-400" /> Cart {cartCount > 0 && <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
                              </button>
                              <button onClick={() => { setShowNotifications(true); closeMobile(); }} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-[14px] font-bold text-slate-700 hover:bg-slate-50 transition-all text-left">
                                <Bell className="w-4.5 h-4.5 text-slate-400" /> Notifications
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                    
                    {variant !== "browse" && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">Quick Links</p>
                        {variant === "seller" && <Link href="/browse" onClick={closeMobile} className="flex items-center gap-3.5 px-4 py-3 text-[15px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-colors"><Store className="w-5 h-5 text-slate-400" /> Browse Shop</Link>}
                        <Link href={variant === "seller" ? "/seller/settings" : "/dashboard/settings"} onClick={closeMobile} className={`flex items-center gap-3.5 px-4 py-3 text-[15px] font-medium rounded-2xl transition-colors ${pathname.startsWith(variant === "seller" ? "/seller/settings" : "/dashboard/settings") ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}><Settings className="w-5 h-5 text-slate-400" /> Account Settings</Link>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <form action="/api/auth/logout" method="post">
                      <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-bold shadow-sm bg-white hover:bg-slate-50">
                        <LogOut className="w-4 h-4 mr-2.5 text-rose-500" /> Log out
                      </Button>
                    </form>
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
