"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  User,
  Settings,
  Store,
  Menu,
  ChevronDown,
  Sparkles,
  Bell,
  Wallet,
  Package,
  LifeBuoy
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { useState, useEffect } from "react";

const BUYER_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Purchases", href: "/dashboard/purchases", icon: ShoppingCart },
  { label: "Browse", href: "/browse", icon: Store },
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

interface DashboardNavbarProps {
  email: string;
  fullName?: string;
}

export function DashboardNavbar({
  email,
  fullName,
}: DashboardNavbarProps) {
  const pathname = usePathname();
  const shortName = getShortName(fullName, email);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/50" : "bg-[#F8FAFC] border-b border-transparent"}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
        
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-2.5 w-1/3">
          <CodeHaatLogo href="/dashboard" />
          <span className="hidden lg:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-[11px] font-bold text-blue-600 tracking-wide uppercase">
            <Sparkles className="w-3 h-3 text-blue-500" />
            Buyer
          </span>
        </div>

        {/* Center: Navigation Pills */}
        <div className="hidden md:flex items-center justify-center gap-1 bg-slate-200/40 p-1 rounded-full border border-slate-200/60 shadow-inner">
          {BUYER_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span className="hidden lg:inline">{item.label}</span>
                <span className="lg:hidden" title={item.label}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right Side: Quick Actions & Profile */}
        <div className="flex items-center justify-end gap-2 w-1/3">
          
          <Link
            href="/notifications"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer mr-2"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
          </Link>

          {/* Profile Dropdown Menu */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200/60 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[13px] font-bold text-white shadow-inner">
                {shortName[0]?.toUpperCase() || "B"}
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

          {/* Mobile Navigation Trigger */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-slate-200/60 bg-white shadow-sm">
                <Menu className="h-5 w-5 text-slate-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0 bg-[#F8FAFC]">
              <SheetTitle className="sr-only">Buyer Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full">
                
                <div className="p-6 bg-white border-b border-slate-200/60">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-[16px] font-bold text-white shadow-sm">
                      {shortName[0]?.toUpperCase() || "B"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[16px] font-bold text-slate-900 truncate">{shortName}</div>
                      <div className="text-[12px] text-slate-500 truncate">{email}</div>
                    </div>
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3 mt-2">
                    Buyer Menu
                  </p>
                  {BUYER_NAV_ITEMS.map((item) => {
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all ${
                          isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-700 hover:text-slate-900 hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        <item.icon className={`w-4.5 h-4.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                  
                  <div className="my-2 border-t border-slate-200/60" />

                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-3.5 text-[14px] font-bold text-slate-700 hover:bg-white hover:shadow-sm rounded-2xl"
                  >
                    <User className="w-4.5 h-4.5 text-slate-400" />
                    My Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3.5 text-[14px] font-bold text-slate-700 hover:bg-white hover:shadow-sm rounded-2xl"
                  >
                    <Settings className="w-4.5 h-4.5 text-slate-400" />
                    Account Settings
                  </Link>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-3 px-4 py-3.5 text-[14px] font-bold text-slate-700 hover:bg-white hover:shadow-sm rounded-2xl"
                  >
                    <Bell className="w-4.5 h-4.5 text-slate-400" />
                    Notifications
                  </Link>
                </div>

                <div className="p-4 bg-white border-t border-slate-200/60">
                  <form action="/api/auth/logout" method="post">
                    <button type="submit" className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors font-bold text-[14px]">
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
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
