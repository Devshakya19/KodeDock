"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";
import {
  LayoutDashboard,
  ShoppingCart,
  User,
  Settings,
  LogOut,
  Store,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Browse Marketplace", href: "/browse", icon: Store },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Purchases", href: "/dashboard/purchases", icon: ShoppingCart },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// Only 4 items for mobile bottom nav
const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Purchases", href: "/dashboard/purchases", icon: ShoppingCart },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
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

interface DashboardSidebarProps {
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export function DashboardSidebar({
  email,
  fullName,
  avatarUrl,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const shortName = getShortName(fullName, email);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-slate-200">
        <div className="flex items-center h-16 px-6 border-b border-slate-200">
          <CodeHaatLogo />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-200">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                shortName[0]?.toUpperCase() || "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-950 truncate">{shortName}</div>
              <div className="text-xs text-slate-500 truncate">{email}</div>
            </div>
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Bottom Nav - only 4 items */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 min-w-0 ${
                  isActive ? "text-slate-950" : "text-slate-400"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-slate-950" : ""}`} />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
