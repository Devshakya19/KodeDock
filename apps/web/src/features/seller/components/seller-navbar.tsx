"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Package,
  Settings,
  User,
  Store,
  ShoppingCart,
  Bell,
  Menu,
  Wallet,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { useState } from "react";

const SELLER_NAV_ITEMS = [
  { label: "Dashboard", href: "/seller", icon: LayoutDashboard },
  { label: "Products", href: "/seller/products", icon: Package },
  { label: "Orders", href: "/seller/orders", icon: ShoppingCart },
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

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-2.5 w-1/3">
          <CodeHaatLogo href="/seller" />
          <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-[10px] font-bold text-white tracking-wide uppercase shadow-sm">
            <Sparkles className="w-2.5 h-2.5 text-blue-400" />
            Creator Studio
          </span>
        </div>

        {/* Center: Navigation Pills */}
        <div className="hidden md:flex items-center justify-center gap-1 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/50">
          {SELLER_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/seller"
                ? pathname === "/seller"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-[13px] font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm shadow-slate-900/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span className="hidden lg:inline">{item.label}</span>
                <span className="lg:hidden" title={item.label}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right Side: Quick Actions & Profile */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/3">
          <Link
            href="/browse"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100/60 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-200/50"
          >
            <Store className="w-3.5 h-3.5 text-slate-500" />
            Browse Shop
          </Link>

          <Link
            href="/notifications"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all relative border border-slate-200/50"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
          </Link>

          {/* Profile Dropdown Menu */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pr-2.5 rounded-xl hover:bg-slate-100/80 transition-all border border-slate-200/50"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-xs font-extrabold text-white shadow-sm">
                {shortName[0]?.toUpperCase() || "S"}
              </div>
              <span className="text-xs font-bold text-slate-800">{shortName}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {profileDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">{fullName || shortName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{email}</p>
                  </div>

                  <Link
                    href="/seller/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Public Profile
                  </Link>

                  <Link
                    href="/seller/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Account Settings
                  </Link>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <form action="/api/auth/logout" method="post">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
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
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-slate-200/60">
                <Menu className="h-5 w-5 text-slate-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6">
              <SheetTitle className="sr-only">Seller Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-5 mt-4">
                <Link
                  href="/seller/profile"
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 text-white shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white border border-white/20">
                    {shortName[0]?.toUpperCase() || "S"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate">{shortName}</div>
                    <div className="text-[11px] text-slate-300 truncate">{email}</div>
                  </div>
                </Link>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
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
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-1">
                  <Link
                    href="/browse"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl"
                  >
                    <Store className="w-4 h-4 text-slate-400" />
                    Browse Shop
                  </Link>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl"
                  >
                    <Bell className="w-4 h-4 text-slate-400" />
                    Notifications
                  </Link>
                </div>

                <form action="/api/auth/logout" method="post" className="pt-2">
                  <Button variant="outline" className="w-full h-11 rounded-xl border-slate-200 text-slate-700 font-semibold">
                    <LogOut className="w-4 h-4 mr-2 text-rose-500" />
                    Log out
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </nav>
    </header>
  );
}
