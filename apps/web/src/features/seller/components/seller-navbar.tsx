"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Package, Settings, User, Store, ShoppingCart, Bell, Menu, Wallet } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";

const SELLER_NAV_ITEMS = [
  { label: "Dashboard", href: "/seller", icon: LayoutDashboard },
  { label: "Products", href: "/seller/products", icon: Package },
  { label: "Orders", href: "/seller/orders", icon: ShoppingCart },
  { label: "Wallet", href: "/seller/wallet", icon: Wallet },
  { label: "Profile", href: "/seller/profile", icon: User },
  { label: "Settings", href: "/seller/settings", icon: Settings },
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

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <CodeHaatLogo href="/seller" />
          <div className="hidden md:flex items-center gap-1">
            {SELLER_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/seller"
                  ? pathname === "/seller"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/browse"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          >
            <Store className="w-4 h-4" />
            Browse
          </Link>
          <Link
            href="/notifications"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
          </Link>
          <Link
            href="/seller/profile"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-sm font-bold text-white">
              {shortName[0]?.toUpperCase() || "U"}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{shortName}</span>
          </Link>
          <form action="/api/auth/logout" method="post" className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-slate-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </form>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col gap-4 mt-8">
                <Link
                  href="/seller/profile"
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
                {SELLER_NAV_ITEMS.map((item) => {
                  const isActive =
                    item.href === "/seller"
                      ? pathname === "/seller"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-slate-100 text-slate-950"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <div className="border-t border-slate-200 pt-4">
                  <Link href="/browse" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-lg">
                    <Store className="w-4 h-4" />
                    Browse Marketplace
                  </Link>
                  <Link href="/notifications" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-lg">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </Link>
                </div>
                <form action="/api/auth/logout" method="post">
                  <Button variant="outline" className="w-full border-slate-300 text-slate-700">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
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
