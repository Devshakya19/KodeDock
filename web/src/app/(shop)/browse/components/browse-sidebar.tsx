"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Sparkles,
  LayoutGrid,
  TrendingUp,
  Clock,
  Tag,
  MessageSquareText,
  FolderHeart,
  HelpCircle,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { GithubIcon } from "@/shared/components/icons/github";

interface BrowseSidebarProps {
  activeTab?: string;
  onSelectCategory?: (category: string) => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  isActive: boolean;
  badge?: string;
}

export function BrowseSidebar({
  activeTab = "browse",
  onSelectCategory,
  isMobile = false,
  onCloseMobile,
}: BrowseSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "";
  const currentPrice = searchParams.get("price") || "";

  const navItems: NavItem[] = [
    {
      id: "browse",
      label: "Browse",
      icon: Sparkles,
      href: "/browse",
      isActive:
        pathname === "/browse" && !currentCategory && !currentSort && currentPrice !== "free",
    },
    {
      id: "categories",
      label: "Categories",
      icon: LayoutGrid,
      href: "/browse?category=web-templates",
      isActive: Boolean(currentCategory),
    },
    {
      id: "top-sellers",
      label: "Top Sellers",
      icon: TrendingUp,
      href: "/browse?sort=top_sellers",
      isActive: currentSort === "top_sellers",
    },
    {
      id: "new-releases",
      label: "New Releases",
      icon: Clock,
      href: "/browse?sort=newest",
      isActive: currentSort === "newest",
    },
    {
      id: "free-assets",
      label: "Free Assets",
      icon: Tag,
      href: "/browse?price=free",
      isActive: currentPrice === "free",
    },
    {
      id: "requests",
      label: "Requests",
      icon: MessageSquareText,
      href: "/dashboard",
      isActive: false,
    },
    {
      id: "collections",
      label: "Collections",
      icon: FolderHeart,
      href: "/dashboard/wishlist",
      isActive: false,
    },
  ];

  return (
    <aside
      className={`flex flex-col h-full bg-[#08070d] border-r border-[#1e1b2e] ${
        isMobile ? "w-full p-4" : "w-[260px] p-5 shrink-0"
      } select-none`}
    >
      {/* Brand Header */}
      <div className="flex items-center px-2 mb-8">
        <Link
          href="/browse"
          className="flex items-center group py-1"
          onClick={() => isMobile && onCloseMobile && onCloseMobile()}
        >
          <Image
            src="/icons/logo/full-logo-light.svg"
            alt="KodeDock"
            width={165}
            height={26}
            className="h-7 w-auto object-contain group-hover:opacity-90 transition-opacity"
            priority
          />
        </Link>
      </div>

      {/* Main Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => isMobile && onCloseMobile && onCloseMobile()}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                item.isActive
                  ? "bg-violet-600/15 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_-3px_rgba(139,92,246,0.25)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#141220] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    item.isActive ? "text-violet-400" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Widgets Section */}
      <div className="space-y-3 pt-6 pb-4">
        {/* GitHub Connected Card */}
        <div className="p-3.5 rounded-2xl bg-[#110f1c] border border-[#232038] relative overflow-hidden group hover:border-violet-500/30 transition-colors">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-6 h-6 rounded-lg bg-[#1a172c] flex items-center justify-center text-slate-300 border border-[#2b2744]">
              <GithubIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[13px] font-bold text-white tracking-tight">GitHub Connected</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Instant access to private repositories &amp; updates.
          </p>
          <Link
            href="/dashboard/settings/connections"
            onClick={() => isMobile && onCloseMobile && onCloseMobile()}
            className="block w-full py-1.5 px-3 rounded-lg text-center text-[12px] font-semibold text-slate-200 bg-[#1b182e] hover:bg-violet-600/20 hover:text-violet-300 border border-[#2d2948] transition-colors"
          >
            Configure
          </Link>
        </div>


      </div>

      {/* Footer Navigation Links */}
      <div className="pt-3 border-t border-[#1e1b2e] space-y-1">
        <Link
          href="/contact"
          onClick={() => isMobile && onCloseMobile && onCloseMobile()}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-400 hover:text-slate-200 hover:bg-[#141220] transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help Center</span>
        </Link>
        <Link
          href="/dashboard/settings"
          onClick={() => isMobile && onCloseMobile && onCloseMobile()}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-400 hover:text-slate-200 hover:bg-[#141220] transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
