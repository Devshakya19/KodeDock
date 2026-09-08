"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { auth, User } from "@/shared/lib/auth/client";
import {
  Search,
  X,
  User as UserIcon,
  UploadCloud,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Menu,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  Command,
} from "lucide-react";

// Centered Search Bar Component with Keyboard Shortcut Support
function NavbarSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  // Sync state if URL query changes
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Global keyboard shortcut: Cmd+K, Ctrl+K, or "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "/" && !e.shiftKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const executeSearch = (val: string) => {
    const trimmed = val.trim();
    const params = new URLSearchParams(
      pathname === "/explore" ? searchParams.toString() : ""
    );

    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }

    const queryString = params.toString();
    router.push(`/explore${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  const handleClear = () => {
    setQuery("");
    executeSearch("");
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="relative w-full max-w-md lg:max-w-lg"
    >
      <div className="relative flex items-center">
        <Search
          size={15}
          className="absolute left-3.5 text-[#A1A1AA] pointer-events-none transition-colors group-focus-within:text-[#8535FC]"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search codebases, tech stacks, templates..."
          className="w-full h-9 sm:h-10 pl-9 pr-14 rounded-lg bg-[#141417] border border-[#414146] hover:border-[#52525B] focus:border-[#8535FC] focus:ring-1 focus:ring-[#8535FC] text-xs sm:text-sm text-[#EDEDF0] placeholder:text-[#71717A] outline-none transition-all"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[#A1A1AA] hover:text-[#EDEDF0] rounded hover:bg-[#27272A] transition-colors"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#27272A] border border-[#414146] text-[10px] font-mono text-[#A1A1AA] select-none pointer-events-none">
              <Command size={10} />K
            </kbd>
          )}
        </div>
      </div>
    </form>
  );
}

// Skeleton UI for User Profile / Auth Action to prevent layout shifts (CLS)
function ProfileSkeleton() {
  return (
    <div
      className="flex items-center gap-2.5 p-1 rounded-xl animate-pulse select-none"
      aria-hidden="true"
    >
      {/* Avatar circle skeleton matching exact size-8 */}
      <div className="size-8 rounded-full bg-[#27272A] border border-[#414146] shrink-0" />

      {/* Name and role text lines skeleton matching text dimensions */}
      <div className="hidden md:flex flex-col gap-1.5 w-20">
        <div className="h-3 w-16 bg-[#27272A] rounded" />
        <div className="h-2 w-10 bg-[#27272A]/70 rounded" />
      </div>

      {/* Chevron placeholder */}
      <div className="size-3.5 bg-[#27272A] rounded hidden sm:block opacity-60" />
    </div>
  );
}

export default function ShopNavbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load user session
  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        const u = await auth.getUser();
        if (mounted) {
          setUser(u);
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadUser();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 180);
  };

  const handleClick = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } finally {
      setUser(null);
      setIsDropdownOpen(false);
      router.push("/login");
    }
  };

  const isDeveloper = user?.role === "developer";
  const isAdmin = user?.role === "admin";
  const isBuyer = user?.role === "user";

  const userDisplayName =
    user?.github_username ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "Developer";

  const userInitials = (userDisplayName || "KD")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 left-0 right-0 w-full h-16 bg-[#1D1D21]/95 backdrop-blur-md border-b border-[#414146] z-50 transition-colors">
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Clean Brand Identity (Wordmark Only, No Icon Box) */}
        <div className="flex items-center shrink-0">
          <Link
            href="/explore"
            className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-[#8535FC] rounded-lg py-1 px-1 transition-opacity hover:opacity-90"
            aria-label="KodeDock Home"
          >
            <Image
              src="/icons/logo/KodeDock-theme.svg"
              alt="KodeDock"
              width={136}
              height={22}
              className="h-5 sm:h-5.5 w-auto object-contain"
              priority
            />
            <span className="hidden sm:inline-block font-mono text-[9px] tracking-widest uppercase text-[#8535FC] bg-[#8535FC]/10 border border-[#8535FC]/20 px-1.5 py-0.5 rounded">
              Store
            </span>
          </Link>
        </div>

        {/* Middle: Centered Search Bar */}
        <div className="flex-1 max-w-lg lg:max-w-2xl mx-4 hidden sm:flex justify-center">
          <Suspense
            fallback={
              <div className="w-full h-10 rounded-lg bg-[#141417] border border-[#414146] animate-pulse" />
            }
          >
            <NavbarSearch />
          </Suspense>
        </div>

        {/* Right: User Profile & Authentication State */}
        <div className="flex items-center gap-3 shrink-0">
          {loading ? (
            <ProfileSkeleton />
          ) : user ? (
            /* Logged-In User Profile Trigger */
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={handleClick}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#27272A] border border-transparent hover:border-[#414146] transition-all focus:outline-none"
                aria-expanded={isDropdownOpen}
              >
                {/* Avatar with Status Indicator (Clean #27272A, No Purple Box) */}
                <div className="relative">
                  <div className="size-8 rounded-full bg-[#27272A] border border-[#414146] text-xs font-mono font-bold text-[#EDEDF0] flex items-center justify-center shadow-sm">
                    {userInitials}
                  </div>
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[#10B981] border-2 border-[#1D1D21]" />
                </div>

                {/* User Details */}
                <div className="hidden md:flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold text-[#EDEDF0] truncate max-w-[120px]">
                    {userDisplayName}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#A1A1AA]">
                    {user.role}
                  </span>
                </div>

                <ChevronDown
                  size={14}
                  className={`text-[#A1A1AA] transition-transform duration-200 hidden sm:block ${
                    isDropdownOpen ? "rotate-180 text-[#EDEDF0]" : ""
                  }`}
                />
              </button>

              {/* Redesigned Floating User Profile Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#27272A]/95 backdrop-blur-md border border-[#414146] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-[#414146]/50">
                  {/* Invisible bridge to prevent mouse leaving hover target */}
                  <div className="absolute -top-3 left-0 right-0 h-3" />

                  {/* Header info */}
                  <div className="px-3.5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-[#141417] border border-[#414146] text-sm font-mono font-bold text-[#EDEDF0] flex items-center justify-center shrink-0">
                        {userInitials}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="text-xs font-semibold text-[#EDEDF0] truncate">
                            {userDisplayName}
                          </p>
                          <span
                            className={`font-mono text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                              isDeveloper
                                ? "text-[#8535FC] bg-[#8535FC]/10 border-[#8535FC]/30"
                                : isAdmin
                                ? "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30"
                                : "text-[#A1A1AA] bg-[#141417] border-[#414146]"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A1A1AA] font-mono truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Section */}
                  <div className="py-1.5">
                    {/* Common Purchases / Vault link */}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#EDEDF0] hover:bg-[#141417] hover:text-[#8535FC] transition-colors"
                    >
                      <Layers size={14} className="text-[#A1A1AA]" />
                      <span>My Purchases & Licenses</span>
                    </Link>

                    {/* Developer Specific Links */}
                    {isDeveloper && (
                      <>
                        <Link
                          href="/seller/dashboard"
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#EDEDF0] hover:bg-[#141417] hover:text-[#8535FC] transition-colors"
                        >
                          <LayoutDashboard size={14} className="text-[#A1A1AA]" />
                          <span>Seller HQ Dashboard</span>
                        </Link>
                        <Link
                          href="/seller/upload"
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#EDEDF0] hover:bg-[#141417] hover:text-[#8535FC] transition-colors"
                        >
                          <UploadCloud size={14} className="text-[#A1A1AA]" />
                          <span>Upload New Codebase</span>
                        </Link>
                        <Link
                          href="/seller/payouts"
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#EDEDF0] hover:bg-[#141417] hover:text-[#8535FC] transition-colors"
                        >
                          <Package size={14} className="text-[#A1A1AA]" />
                          <span>Ledger & Payouts</span>
                        </Link>
                      </>
                    )}

                    {/* Admin Specific Links */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#EDEDF0] hover:bg-[#141417] hover:text-[#10B981] transition-colors"
                      >
                        <ShieldCheck size={14} className="text-[#10B981]" />
                        <span>Admin Control HQ</span>
                      </Link>
                    )}

                    {/* Buyer Specific Links */}
                    {isBuyer && (
                      <Link
                        href="/developer-register"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#8535FC] hover:bg-[#141417] transition-colors font-medium"
                      >
                        <Sparkles size={14} />
                        <span>Become a Verified Seller</span>
                      </Link>
                    )}

                    {/* Settings & Profile */}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#EDEDF0] hover:bg-[#141417] hover:text-[#8535FC] transition-colors"
                    >
                      <UserIcon size={14} className="text-[#A1A1AA]" />
                      <span>Account Settings</span>
                    </Link>
                  </div>

                  {/* Sign out Section */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors text-left"
                    >
                      <LogOut size={14} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Guest State */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#EDEDF0] hover:bg-[#27272A] border border-[#414146] hover:border-[#52525B] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[#8535FC] hover:bg-[#9B51E0] text-white shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg text-[#A1A1AA] hover:text-[#EDEDF0] hover:bg-[#27272A] border border-[#414146] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8535FC]"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Visible on small screens) */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-b border-[#414146] bg-[#1D1D21] px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
          {/* Mobile Search Input */}
          <div>
            <Suspense
              fallback={
                <div className="w-full h-10 rounded-lg bg-[#141417] border border-[#414146] animate-pulse" />
              }
            >
              <NavbarSearch />
            </Suspense>
          </div>

          {loading ? (
            <div className="pt-2 border-t border-[#414146] space-y-3 animate-pulse">
              <div className="flex items-center gap-2.5 px-1">
                <div className="size-8 rounded-full bg-[#27272A] border border-[#414146] shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-28 bg-[#27272A] rounded" />
                  <div className="h-2.5 w-20 bg-[#27272A]/70 rounded" />
                </div>
              </div>
              <div className="h-9 w-full bg-[#27272A] rounded-lg" />
            </div>
          ) : user ? (
            <div className="pt-2 border-t border-[#414146] space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-[#8535FC]/20 border border-[#8535FC]/50 text-xs font-mono font-bold text-[#EDEDF0] flex items-center justify-center">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#EDEDF0]">
                      {userDisplayName}
                    </p>
                    <p className="text-[11px] font-mono text-[#A1A1AA]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[9px] uppercase font-semibold text-[#8535FC] bg-[#8535FC]/10 px-2 py-0.5 rounded border border-[#8535FC]/20">
                  {user.role}
                </span>
              </div>

              <div className="space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#EDEDF0] bg-[#27272A] border border-[#414146]"
                >
                  <Layers size={14} />
                  <span>My Purchases & Licenses</span>
                </Link>

                {isDeveloper && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/seller/dashboard"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#EDEDF0] bg-[#27272A] border border-[#414146]"
                    >
                      <LayoutDashboard size={14} />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/seller/upload"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#8535FC] text-white"
                    >
                      <UploadCloud size={14} />
                      <span>Upload</span>
                    </Link>
                  </div>
                )}

                {isBuyer && (
                  <Link
                    href="/developer-register"
                    className="block text-center px-3 py-2 rounded-lg text-xs font-medium text-[#8535FC] bg-[#8535FC]/10 border border-[#8535FC]/30"
                  >
                    Become a Verified Seller
                  </Link>
                )}
              </div>

              <div className="pt-2 border-t border-[#414146] flex items-center justify-between">
                <Link
                  href="/profile"
                  className="text-xs text-[#A1A1AA] hover:text-[#EDEDF0]"
                >
                  Account Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-[#EF4444] hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <LogOut size={13} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#414146] grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-[#EDEDF0] bg-[#27272A] border border-[#414146]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium bg-[#8535FC] text-white"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

