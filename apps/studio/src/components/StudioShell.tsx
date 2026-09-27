"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { getAutoAvatar } from "@/lib/avatars";
import {
  LayoutDashboard,
  Boxes,
  UploadCloud,
  GitBranch,
  Coins,
  TrendingUp,
  Sliders,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Store,
} from "lucide-react";

interface StudioShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/",             label: "Live Telemetry",       icon: LayoutDashboard, section: "engineering" },
  { href: "/products",     label: "Architecture Catalog", icon: Boxes,           section: "engineering" },
  { href: "/products/new", label: "Deploy Architecture",  icon: UploadCloud,     section: "engineering" },
  { href: "/releases",     label: "Release Control",      icon: GitBranch,       section: "engineering" },
  { href: "/payouts",      label: "Payouts & Ledger",     icon: Coins,           section: "financials" },
  { href: "/analytics",    label: "Marketplace Radar",    icon: TrendingUp,      section: "financials" },
  { href: "/settings",     label: "Studio Settings",      icon: Sliders,         section: "preferences" },
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
          duration: 0.85,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1.15,
          touchMultiplier: 1.0,
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

  const isRouteActive = (itemHref: string, currentPath: string): boolean => {
    if (itemHref === "/") {
      return currentPath === "/";
    }
    if (itemHref === "/products") {
      return currentPath === "/products" || (currentPath.startsWith("/products/") && !currentPath.startsWith("/products/new"));
    }
    return currentPath === itemHref || currentPath.startsWith(itemHref + "/");
  };

  const activeItem = NAV_ITEMS.find((item) => isRouteActive(item.href, pathname)) ?? NAV_ITEMS[0];

  const engineeringItems = NAV_ITEMS.filter((item) => item.section === "engineering");
  const financialItems   = NAV_ITEMS.filter((item) => item.section === "financials");
  const preferenceItems  = NAV_ITEMS.filter((item) => item.section === "preferences");

  return (
    <div className="portal-root">
      {/* Atmospheric depth glows */}
      <div className="portal-glow-1" aria-hidden="true" />
      <div className="portal-glow-2" aria-hidden="true" />

      {/* ── Fixed Sidebar ─────────────────────────────────────────────────── */}
      <aside className="portal-sidebar">
        {/* Brand Header (Clean Logo without Studio chip) */}
        <div className="sidebar-brand">
          <Link href="/" className="sidebar-logo-link">
            <img src="/kd.svg" alt="KodeDock Logo" className="sidebar-logo-img" />
            <span className="sidebar-logo-name">KodeDock</span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav" aria-label="Studio navigation">
          <span className="sidebar-nav-section-label">Engineering &amp; Blueprints</span>
          {engineeringItems.map((item) => {
            const Icon = item.icon;
            const isActive = isRouteActive(item.href, pathname);
            const badge =
              item.href === "/products"
                ? activeProductsCount || undefined
                : undefined;

            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div className={`nav-item${isActive ? " active" : ""}`}>
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="nav-active-pill"
                      transition={{ type: "spring", stiffness: 460, damping: 35 }}
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
                        letterSpacing: "0.05em",
                        fontWeight: 700,
                      }}
                    >
                      SHIP
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          <span className="sidebar-nav-section-label" style={{ marginTop: "0.75rem" }}>
            Commerce &amp; Settlements
          </span>
          {financialItems.map((item) => {
            const Icon = item.icon;
            const isActive = isRouteActive(item.href, pathname);

            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div className={`nav-item${isActive ? " active" : ""}`}>
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="nav-active-pill"
                      transition={{ type: "spring", stiffness: 460, damping: 35 }}
                    />
                  )}
                  <Icon size={16} className="nav-item-icon" aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}

          <span className="sidebar-nav-section-label" style={{ marginTop: "0.75rem" }}>
            Preferences
          </span>
          {preferenceItems.map((item) => {
            const Icon = item.icon;
            const isActive = isRouteActive(item.href, pathname);

            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div className={`nav-item${isActive ? " active" : ""}`}>
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="nav-active-pill"
                      transition={{ type: "spring", stiffness: 460, damping: 35 }}
                    />
                  )}
                  <Icon size={16} className="nav-item-icon" aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
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
            <span className="crumb-root">KodeDock</span>
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
              className="island-cta-btn"
              style={{ padding: "0.35rem 0.5rem 0.35rem 0.95rem", fontSize: "0.78rem" }}
            >
              <span>Deploy Architecture</span>
              <div className="island-icon-pod" style={{ width: "22px", height: "22px" }}>
                <UploadCloud size={12} strokeWidth={1.8} />
              </div>
            </Link>
          </div>
        </header>

        <main className="page-transition-wrapper">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

