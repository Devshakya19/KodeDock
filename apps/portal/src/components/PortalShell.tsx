"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAutoAvatar } from "@/lib/avatars";
import { syncAuthStorage, clearAuthStorage, signOut } from "@kodedock/auth/client";
import {
  Package,
  Key,
  Receipt,
  KeyRound,
  Bell,
  User,
  Settings,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from "lucide-react";

interface PortalShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/",             label: "My Library",        icon: Package,         section: "main" },
  { href: "/licenses",     label: "License Vault",     icon: Key,             section: "main" },
  { href: "/billing",      label: "Billing & Orders",  icon: Receipt,         section: "main" },
  { href: "/tokens",       label: "API Keys & Access", icon: KeyRound,        section: "main" },
  { href: "/notifications",label: "Notifications",     icon: Bell,            section: "account" },
  { href: "/profile",      label: "Profile",           icon: User,            section: "account" },
  { href: "/settings",     label: "Settings",          icon: Settings,        section: "account" },
];

export const PortalShell: React.FC<PortalShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [libraryCount, setLibraryCount] = useState<number>(0);
  const [notifCount, setNotifCount] = useState<number>(0);
  const [buyerName, setBuyerName] = useState<string>("Developer");
  const [buyerEmail, setBuyerEmail] = useState<string>("developer@kodedock.local");
  const [buyerAvatar, setBuyerAvatar] = useState<string>("");
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<any>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    // Init Lenis ultra-smooth scroll with liquid exponential physics
    let rafId: number;
    let resizeObserver: ResizeObserver | null = null;

    const initLenis = async () => {
      try {
        const Lenis = (await import("lenis")).default;
        const lenis = new Lenis({
          duration: 1.1,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.6,
          infinite: false,
        });
        lenisRef.current = lenis;

        function raf(time: number) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        // Auto-recalculate scroll limits when async data or DOM heights change
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => {
            lenis.resize();
          });
          resizeObserver.observe(document.body);
        }
      } catch {
        // Lenis optional; page still works without it
      }
    };

    initLenis();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      lenisRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      requestAnimationFrame(() => {
        lenisRef.current?.resize();
      });
    }
  }, [pathname]);


  useEffect(() => {
    // Fetch live library count
    fetch("/api/portal/library")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) setLibraryCount(d.data.length);
      })
      .catch(() => {});

    // Fetch live buyer profile
    fetch("/api/portal/profile")
      .then((r) => {
        if (r.status === 401) {
          clearAuthStorage();
        }
        return r.json();
      })
      .then((d) => {
        if (d.success && d.data) {
          setBuyerName(d.data.name || "Developer");
          if (d.data.email) setBuyerEmail(d.data.email);
          setBuyerAvatar(d.data.image || getAutoAvatar(d.data.id || d.data.email || d.data.name));

          // Populate localStorage and sessionStorage on portal origin (port 3002)
          syncAuthStorage({
            user: d.data,
            role: d.data.role || "BUYER",
          });
        }
      })
      .catch(() => {});
  }, []);

  const activeItem = NAV_ITEMS.find((i) => i.href === pathname) ?? NAV_ITEMS[0];

  const mainItems    = NAV_ITEMS.filter((i) => i.section === "main");
  const accountItems = NAV_ITEMS.filter((i) => i.section === "account");

  return (
    <div className="portal-root">
      {/* Atmospheric glows */}
      <div className="portal-glow-1" aria-hidden="true" />
      <div className="portal-glow-2" aria-hidden="true" />

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className="portal-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <Link href="/" className="sidebar-logo-link">
            <img src="/kd.svg" alt="KodeDock Logo" className="sidebar-logo-img" />
            <span className="sidebar-logo-name">KodeDock</span>
          </Link>
          <span className="sidebar-portal-chip">Portal</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Portal navigation">
          <span className="sidebar-nav-section-label">Workspace</span>

          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const badge = item.href === "/" ? libraryCount
                        : item.href === "/licenses" ? libraryCount
                        : undefined;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  className={`nav-item${isActive ? " active" : ""}`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="nav-active-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <Icon size={16} className="nav-item-icon" aria-hidden="true" />
                  <span>{item.label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className="nav-badge">{badge}</span>
                  )}
                </motion.div>
              </Link>
            );
          })}

          <span className="sidebar-nav-section-label" style={{ marginTop: "0.75rem" }}>Account</span>

          {accountItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const badge = item.href === "/notifications" ? notifCount || undefined : undefined;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  className={`nav-item${isActive ? " active" : ""}`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="nav-active-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <Icon size={16} className="nav-item-icon" aria-hidden="true" />
                  <span>{item.label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className="nav-badge">{badge}</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User footer with profile link and prominent Sign Out button */}
        <div className="sidebar-footer">
          <Link href="/profile" className="sidebar-user-row" style={{ textDecoration: "none", width: "100%" }}>
            <div className="user-avatar" aria-hidden="true">
              <img src={buyerAvatar || getAutoAvatar(buyerName)} alt={buyerName} />
            </div>
            <div className="user-info">
              <div className="user-name">{buyerName}</div>
              <div className="user-badge">Verified Developer</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              clearAuthStorage();
              const wwwUrl = process.env.NEXT_PUBLIC_WWW_URL || "http://localhost:3000";
              window.location.href = `${wwwUrl}/login`;
            }}
            className="sidebar-signout-btn"
            title="Sign out of developer account"
            aria-label="Sign Out"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────── */}
      <div className="portal-main">
        {/* Top bar */}
        <header className="portal-topbar">
          <div className="topbar-breadcrumb" aria-label="Breadcrumb">
            <span className="crumb-root">Portal</span>
            <ChevronRight size={13} className="crumb-sep" aria-hidden="true" />
            <span className="crumb-current">{activeItem.label}</span>
          </div>

          <div className="topbar-right">
            <div className="db-status" aria-label="Database status: connected">
              <div className="db-dot" aria-hidden="true" />
              <span>PG16 SYNCED</span>
            </div>
            <a
              href={process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3003"}
              className="topbar-store-btn"
              target="_blank"
              rel="noopener noreferrer"
              title="Browse Marketplace Store"
            >
              <span>Browse Store</span>
              <ExternalLink size={12} aria-hidden="true" />
            </a>

            {/* Topbar User Profile Menu & Sign Out */}
            <div className="user-profile-menu-container" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="user-profile-trigger-btn"
                aria-label="User profile and account options"
                aria-expanded={isProfileOpen}
              >
                <img
                  src={buyerAvatar || getAutoAvatar(buyerName)}
                  alt={buyerName}
                  className="user-profile-avatar-circle"
                />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {buyerName}
                </span>
                <ChevronDown
                  size={13}
                  style={{
                    color: "var(--text-muted)",
                    transition: "transform 0.2s ease",
                    transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Obsidian Dropdown Card */}
              {isProfileOpen && (
                <div className="user-profile-dropdown-card">
                  <div className="user-dropdown-header">
                    <img
                      src={buyerAvatar || getAutoAvatar(buyerName)}
                      alt={buyerName}
                      className="user-dropdown-avatar-lg"
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="user-dropdown-name">{buyerName}</div>
                      <div className="user-dropdown-email">{buyerEmail}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                    <Link
                      href="/profile"
                      className="user-dropdown-item-link"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={15} color="var(--accent-primary)" />
                      <span>Developer Profile</span>
                    </Link>

                    <Link
                      href="/settings"
                      className="user-dropdown-item-link"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings size={15} color="var(--text-muted)" />
                      <span>Account Settings</span>
                    </Link>

                    <a
                      href={process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3001"}
                      className="user-dropdown-item-link"
                    >
                      <Sparkles size={15} color="var(--status-warning)" />
                      <span>Creator Studio</span>
                    </a>
                  </div>

                  <div className="user-dropdown-divider" />

                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      clearAuthStorage();
                      const wwwUrl = process.env.NEXT_PUBLIC_WWW_URL || "http://localhost:3000";
                      window.location.href = `${wwwUrl}/login`;
                    }}
                    className="user-dropdown-item-link"
                    style={{
                      color: "#f87171",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content with ultra-smooth entry animation */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={pathname}
            className="page-transition-wrapper"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as any }}
          >
            {children}
          </motion.main>
        </AnimatePresence>

      </div>
    </div>
  );
};
