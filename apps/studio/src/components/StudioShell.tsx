"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAutoAvatar } from "@/lib/avatars";
import {
  LayoutDashboard,
  Package,
  Sparkles,
  GitBranch,
  Wallet,
  TrendingUp,
  Settings,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Store,
} from "lucide-react";

interface StudioShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/",             label: "Overview",            icon: LayoutDashboard, section: "main" },
  { href: "/products",     label: "My Boilerplates",     icon: Package,         section: "main" },
  { href: "/products/new", label: "Publish Codebase",    icon: Sparkles,        section: "main" },
  { href: "/releases",     label: "Version Releases",    icon: GitBranch,       section: "main" },
  { href: "/payouts",      label: "Payouts & Revenue",   icon: Wallet,          section: "finance" },
  { href: "/analytics",    label: "Sales Analytics",     icon: TrendingUp,      section: "finance" },
  { href: "/settings",     label: "Studio Settings",     icon: Settings,        section: "account" },
];

export const StudioShell: React.FC<StudioShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [activeProductsCount, setActiveProductsCount] = useState<number>(0);
  const [creatorName, setCreatorName] = useState<string>("Verified Creator");
  const [creatorAvatar, setCreatorAvatar] = useState<string>("");
  const lenisRef = useRef<any>(null);

  useEffect(() => {
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

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => {
            lenis.resize();
          });
          resizeObserver.observe(document.body);
        }
      } catch {
        // Lenis optional
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

  // Fetch creator profile and listings count
  useEffect(() => {
    fetch("/api/portal/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setCreatorName(d.data.name || "Verified Creator");
          setCreatorAvatar(d.data.image || getAutoAvatar(d.data.email || "creator@kodedock.local"));
        } else {
          setCreatorAvatar(getAutoAvatar("creator@kodedock.local"));
        }
      })
      .catch(() => {
        setCreatorAvatar(getAutoAvatar("creator@kodedock.local"));
      });

    fetch("/api/studio/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setActiveProductsCount(d.data.length);
        }
      })
      .catch(() => {});
  }, []);

  const activeItem = NAV_ITEMS.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  ) ?? NAV_ITEMS[0];

  const mainItems    = NAV_ITEMS.filter((item) => item.section === "main");
  const financeItems = NAV_ITEMS.filter((item) => item.section === "finance");
  const accountItems = NAV_ITEMS.filter((item) => item.section === "account");

  return (
    <div className="portal-root">
      {/* Atmospheric depth glows */}
      <div className="portal-glow-1" aria-hidden="true" />
      <div className="portal-glow-2" aria-hidden="true" />

      {/* ── Fixed Sidebar ─────────────────────────────────────────────────── */}
      <aside className="portal-sidebar">
        {/* Brand & Studio Chip */}
        <div className="sidebar-brand">
          <Link href="/" className="sidebar-logo-link">
            <img src="/kd.svg" alt="KodeDock Logo" className="sidebar-logo-img" />
            <span className="sidebar-logo-name">KodeDock</span>
          </Link>
          <span
            className="sidebar-portal-chip"
            style={{
              color: "var(--accent-primary)",
              background: "rgba(139, 92, 246, 0.15)",
              border: "1px solid rgba(139, 92, 246, 0.35)",
            }}
          >
            Studio
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav" aria-label="Studio navigation">
          <span className="sidebar-nav-section-label">Management</span>
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const badge =
              item.href === "/products"
                ? activeProductsCount || undefined
                : undefined;

            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
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
                  {item.href === "/products/new" && (
                    <span
                      className="nav-badge"
                      style={{
                        background: "rgba(139, 92, 246, 0.2)",
                        color: "var(--accent-primary)",
                      }}
                    >
                      NEW
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}

          <span className="sidebar-nav-section-label" style={{ marginTop: "0.75rem" }}>
            Financials (95% Share)
          </span>
          {financeItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
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
                </motion.div>
              </Link>
            );
          })}

          <span className="sidebar-nav-section-label" style={{ marginTop: "0.75rem" }}>
            Creator Identity
          </span>
          {accountItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
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
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Storefront link and Creator Profile */}
        <div className="sidebar-footer">
          <a
            href="http://localhost:3003"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-user-row"
            style={{
              textDecoration: "none",
              marginBottom: "0.75rem",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-canvas-alt)",
            }}
          >
            <Store size={15} color="var(--accent-cyan)" />
            <div style={{ flex: 1, minWidth: 0, fontSize: "0.8rem", fontWeight: 600, color: "#ffffff" }}>
              Buyer Storefront
            </div>
            <ExternalLink size={12} color="var(--text-muted)" />
          </a>

          <Link href="/settings" className="sidebar-user-row" style={{ textDecoration: "none" }}>
            <div className="user-avatar" aria-hidden="true">
              <img src={creatorAvatar || getAutoAvatar(creatorName)} alt={creatorName} />
            </div>
            <div className="user-info">
              <div className="user-name">{creatorName}</div>
              <div
                className="user-badge"
                style={{
                  color: "var(--accent-cyan)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <ShieldCheck size={11} />
                <span>Verified Creator</span>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main Viewport Content ─────────────────────────────────────────── */}
      <div className="portal-main">
        <header className="portal-topbar">
          <div className="topbar-breadcrumb" aria-label="Breadcrumb">
            <span className="crumb-root">Creator Studio</span>
            <ChevronRight size={13} className="crumb-sep" aria-hidden="true" />
            <span className="crumb-current">{activeItem.label}</span>
          </div>

          <div className="topbar-right">
            <div className="db-status" aria-label="Database status: connected">
              <div className="db-dot" aria-hidden="true" />
              <span>PG16 SYNCED</span>
            </div>
            <Link
              href="/products/new"
              className="btn btn-primary"
              style={{ padding: "0.45rem 0.95rem", fontSize: "0.78rem" }}
            >
              <Sparkles size={13} />
              <span>Publish Template</span>
            </Link>
          </div>
        </header>

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

