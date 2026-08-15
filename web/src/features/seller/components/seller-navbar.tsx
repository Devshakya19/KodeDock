"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  ShoppingCart,
  Bell,
  Menu,
  Wallet,
  ChevronDown,
  Star
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { useState, useEffect } from "react";
import { apiGet } from "@/shared/lib/api";

const SELLER_NAV_ITEMS = [
  { label: "Dashboard", href: "/seller", icon: LayoutDashboard },
  { label: "Products", href: "/seller/products", icon: Package },
  { label: "Orders", href: "/seller/orders", icon: ShoppingCart },
  { label: "Reviews", href: "/seller/reviews", icon: Star },
  { label: "Wallet", href: "/seller/wallet", icon: Wallet },
];

function getShortName(fullName?: string, email?: string): string {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    return parts[0];
  }
  if (email) {
    return email.split("@")[0];
  }
  return "User";
}

export function SellerNavbar({
  email,
  fullName,
}: {
  email: string;
  fullName?: string;
}) {
  const pathname = usePathname();
  const shortName = getShortName(fullName, email);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await apiGet<any[]>("/notifications");
        if (res.success && res.data) {
          setUnreadCount(res.data.filter((n: any) => !n.is_read).length);
        }
      } catch (e) {
        console.error("Failed to fetch notifications");
      }
    };
    fetchUnread();
    
    // Auto-refresh every 30 seconds
    const timer = setInterval(fetchUnread, 30000);
    return () => clearInterval(timer);
  }, []);


  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
        
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-2.5 w-1/3">
          <CodeHaatLogo href="/seller" />
        </div>

        {/* Center: Empty for minimal look */}
        <div className="hidden md:flex flex-1" />

        {/* Right Side: Quick Actions & Profile */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/3">
          <Link
            href="/notifications"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile Dropdown Menu */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-full transition-all border ${
                profileDropdownOpen ? "bg-slate-50 border-slate-200" : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shadow-sm">
                <span className="text-[13px] font-bold text-white tracking-wide">
                  {shortName[0]?.toUpperCase() || "S"}
                </span>
              </div>
              <span className="text-[14px] font-semibold text-slate-700">{shortName}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {profileDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2.5 w-[280px] bg-white rounded-2xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  
                  {/* User Profile Header */}
                  <div className="flex items-center gap-3 px-3 py-3.5 mb-1.5 rounded-xl bg-slate-50/80 border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white">
                      <span className="text-sm font-bold text-white">
                        {shortName[0]?.toUpperCase() || "S"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-slate-900 truncate">{fullName || shortName}</p>
                      <p className="text-[12px] font-medium text-slate-500 truncate">{email}</p>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    {SELLER_NAV_ITEMS.map((item) => {
                      const isActive =
                        item.href === "/seller"
                          ? pathname === "/seller"
                          : pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setProfileDropdownOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-colors ${
                            isActive
                              ? "bg-slate-100/80 text-slate-900 font-semibold"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                          }`}
                        >
                          <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="h-px bg-slate-100 my-2 mx-3" />

                  <div className="space-y-0.5">
                    <Link
                      href="/browse"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Store className="w-[18px] h-[18px] text-slate-400" />
                      Browse Shop
                    </Link>

                    <Link
                      href="/seller/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-colors ${
                        pathname.startsWith("/seller/settings")
                          ? "bg-slate-100/80 text-slate-900 font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      }`}
                    >
                      <Settings className={`w-[18px] h-[18px] ${pathname.startsWith("/seller/settings") ? "text-slate-900" : "text-slate-400"}`} />
                      Account Settings
                    </Link>
                  </div>

                  <div className="h-px bg-slate-100 my-2 mx-3" />

                  <form action="/api/auth/logout" method="post" className="px-1 pb-1 pt-0.5">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    >
                      <LogOut className="w-[18px] h-[18px] text-rose-500" />
                      Log out
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* Mobile Navigation Trigger */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-slate-200/60 bg-white">
                <Menu className="h-5 w-5 text-slate-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 border-l border-slate-200">
              <SheetTitle className="sr-only">Seller Navigation Menu</SheetTitle>
              
              <div className="flex flex-col h-full bg-white">
                <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center shadow-md ring-4 ring-white">
                      <span className="text-lg font-bold text-white">
                        {shortName[0]?.toUpperCase() || "S"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-slate-900 truncate">{fullName || shortName}</p>
                      <p className="text-[13px] font-medium text-slate-500 truncate">{email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">
                      Studio Menu
                    </p>
                    {SELLER_NAV_ITEMS.map((item) => {
                      const isActive =
                        item.href === "/seller"
                          ? pathname === "/seller"
                          : pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-semibold transition-all ${
                            isActive
                              ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <item.icon className={`w-5 h-5 ${isActive ? "text-slate-300" : "text-slate-400"}`} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">
                      Quick Links
                    </p>
                    <Link
                      href="/browse"
                      className="flex items-center gap-3.5 px-4 py-3 text-[15px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-colors"
                    >
                      <Store className="w-5 h-5 text-slate-400" />
                      Browse Shop
                    </Link>
                    <Link
                      href="/seller/settings"
                      className={`flex items-center gap-3.5 px-4 py-3 text-[15px] font-medium rounded-2xl transition-colors ${
                        pathname.startsWith("/seller/settings")
                          ? "bg-slate-100 text-slate-900 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Settings className={`w-5 h-5 ${pathname.startsWith("/seller/settings") ? "text-slate-900" : "text-slate-400"}`} />
                      Account Settings
                    </Link>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <form action="/api/auth/logout" method="post">
                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-bold shadow-sm bg-white hover:bg-slate-50">
                      <LogOut className="w-4 h-4 mr-2.5 text-rose-500" />
                      Log out
                    </Button>
                  </form>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </nav>
    </header>
  );
}
