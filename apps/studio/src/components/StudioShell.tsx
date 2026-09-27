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
  Zap,
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

  const renderNavGroup = (section: string, title?: string) => {
    const items = NAV_ITEMS.filter((item) => item.section === section);
    return (
      <div className="nav-group" key={section}>
        {title && <span className="nav-group-title">{title}</span>}
        <ul className="nav-list">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>

                  {item.href === "/products" && activeProductsCount > 0 && (
                    <span className="nav-badge">{activeProductsCount}</span>
                  )}
                  {item.href === "/products/new" && (
                    <span className="nav-badge" style={{ background: "rgba(139, 92, 246, 0.2)", color: "var(--accent-primary)" }}>
                      NEW
                    </span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="nav-active-pip"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="portal-layout">
      {/* ── Fixed Sidebar ─────────────────────────────────────────────────── */}
      <aside className="portal-sidebar">
        {/* Brand & Studio Chip */}
        <div className="sidebar-brand">
          <Link href="/" className="brand-logo-link">
            <img src="/kd.svg" alt="KodeDock" className="brand-icon" />
            <span className="brand-name">KodeDock</span>
          </Link>
          <span className="studio-pill-badge" style={{
            fontSize: "0.68rem",
            fontFamily: "var(--font-mono)",
            background: "rgba(139, 92, 246, 0.15)",
            color: "var(--accent-primary)",
            padding: "0.15rem 0.5rem",
            borderRadius: "4px",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            fontWeight: 700,
            textTransform: "uppercase"
          }}>
            Studio
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav">
          {renderNavGroup("main", "MANAGEMENT")}
          {renderNavGroup("finance", "FINANCIALS (95% SHARE)")}
          {renderNavGroup("account", "CREATOR IDENTITY")}
        </nav>

        {/* Marketplace Cross-link & Creator User Bar */}
        <div className="sidebar-footer">
          <a
            href="http://localhost:3003"
            target="_blank"
            rel="noopener noreferrer"
            className="store-switch-btn"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "0.65rem 0.85rem",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-secondary)",
              fontSize: "0.78rem",
              textDecoration: "none",
              marginBottom: "1rem",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Store size={15} color="var(--accent-cyan)" />
              <span style={{ color: "#ffffff", fontWeight: 600 }}>Buyer Storefront</span>
            </div>
            <ExternalLink size={13} />
          </a>

          <div className="user-profile-bar">
            <div className="user-avatar-wrap">
              <img
                src={creatorAvatar || "/kd.svg"}
                alt={creatorName}
                className="user-avatar-img"
              />
              <span className="status-dot-online" />
            </div>
            <div className="user-info">
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span className="user-display-name">{creatorName}</span>
                <ShieldCheck size={13} color="var(--accent-cyan)" />
              </div>
              <span className="user-role-badge">Verified Creator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Viewport Content ─────────────────────────────────────────── */}
      <div className="portal-content-wrap">
        <header className="portal-topbar">
          <div className="topbar-breadcrumbs">
            <span className="breadcrumb-root">Creator Studio</span>
            <ChevronRight size={14} className="breadcrumb-sep" />
            <span className="breadcrumb-current">
              {NAV_ITEMS.find((item) =>
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
              )?.label || "Dashboard"}
            </span>
          </div>

          <div className="topbar-actions">
            <Link href="/products/new" className="btn btn-primary" style={{ padding: "0.45rem 0.95rem", fontSize: "0.78rem" }}>
              <Sparkles size={14} />
              <span>Publish Template</span>
            </Link>
          </div>
        </header>

        <main className="portal-main-stage">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              style={{ width: "100%", height: "100%" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
