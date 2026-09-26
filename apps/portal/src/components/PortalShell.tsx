"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Key,
  Receipt,
  Terminal,
  Bell,
  User,
  Settings,
  ExternalLink,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

interface PortalShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/",             label: "My Library",        icon: Package,         section: "main" },
  { href: "/licenses",     label: "License Vault",     icon: Key,             section: "main" },
  { href: "/billing",      label: "Billing & Orders",  icon: Receipt,         section: "main" },
  { href: "/tokens",       label: "API Tokens",         icon: Terminal,        section: "main" },
  { href: "/notifications",label: "Notifications",     icon: Bell,            section: "account" },
  { href: "/profile",      label: "Profile",       icon: User,            section: "account" },
  { href: "/settings",     label: "Settings",          icon: Settings,        section: "account" },
];

export const PortalShell: React.FC<PortalShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [libraryCount, setLibraryCount] = useState<number>(0);
  const [notifCount, setNotifCount] = useState<number>(0);
  const [buyerName, setBuyerName] = useState<string>("Developer");
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // Init Lenis smooth scroll with liquid physics
    let rafId: number;
    const initLenis = async () => {
      try {
        const Lenis = (await import("lenis")).default;
        const lenis = new Lenis({
          lerp: 0.08,
          duration: 1.4,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
          smoothWheel: true,
          wheelMultiplier: 0.85,
          touchMultiplier: 1.6,
          infinite: false,
        });
        lenisRef.current = lenis;

        function raf(time: number) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
      } catch {
        // Lenis optional; page still works without it
      }
    };

    initLenis();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenisRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
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
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setBuyerName(d.data.name || "Developer");
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
                className={`nav-item${isActive ? " active" : ""}`}
              >
                <Icon size={16} className="nav-item-icon" aria-hidden="true" />
                <span>{item.label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="nav-badge">{badge}</span>
                )}
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
                className={`nav-item${isActive ? " active" : ""}`}
              >
                <Icon size={16} className="nav-item-icon" aria-hidden="true" />
                <span>{item.label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="nav-badge">{badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <Link href="/profile" className="sidebar-user-row" style={{ textDecoration: "none" }}>
            <div className="user-avatar" aria-hidden="true">
              {buyerName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{buyerName}</div>
              <div className="user-badge">Verified Developer</div>
            </div>
          </Link>
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
              href="http://localhost:3003"
              className="topbar-store-btn"
              target="_blank"
              rel="noopener noreferrer"
              title="Browse Marketplace Store"
            >
              <span>Browse Store</span>
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        </header>

        {/* Page content with ultra-smooth entry animation */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as any }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
};
