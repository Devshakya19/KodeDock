"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { getAutoAvatar } from "@/lib/avatars";
import { syncAuthStorage, clearAuthStorage, signOut } from "@kodedock/auth/client";
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
  ShieldAlert,
  Sparkles,
  Store,
  LogOut,
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
  const [isForbiddenBuyer, setIsForbiddenBuyer] = useState<boolean>(false);
  const [isUpgradingRole, setIsUpgradingRole] = useState<boolean>(false);
  const [upgradeError, setUpgradeError] = useState<string>("");
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

  // Fetch creator profile and listings count with 401 redirect and 403 RBAC enforcement
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          fetch("/api/studio/settings"),
          fetch("/api/studio/products"),
        ]);

        if (settingsRes.status === 401 || productsRes.status === 401) {
          clearAuthStorage();
          const wwwUrl = process.env.NEXT_PUBLIC_WWW_URL || "http://localhost:3000";
          window.location.href = `${wwwUrl}/login?redirect=${encodeURIComponent(window.location.href)}`;
          return;
        }

        if (settingsRes.status === 403 || productsRes.status === 403) {
          setIsForbiddenBuyer(true);
          return;
        }

        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.data?.profile) {
          setCreatorName(settingsData.data.profile.name || "Verified Creator");
          setCreatorAvatar(
            settingsData.data.profile.image ||
              getAutoAvatar(settingsData.data.profile.email || "creator@kodedock.local")
          );

          // Populate localStorage and sessionStorage on studio origin (port 3001)
          syncAuthStorage({
            user: settingsData.data.profile,
            role: "SELLER",
          });
        }

        const productsData = await productsRes.json();
        if (productsData.success && Array.isArray(productsData.data)) {
          setActiveProductsCount(productsData.data.length);
        }
      } catch {
        // network issue fallback
      }
    };

    checkAuthAndLoad();
  }, []);

  const handleUpgradeToSeller = async () => {
    setIsUpgradingRole(true);
    setUpgradeError("");
    try {
      const res = await fetch("/api/me/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "SELLER" }),
      });
      const data = await res.json();
      if (data.success) {
        syncAuthStorage({
          user: data.data,
          role: "SELLER",
        });
        window.location.reload();
      } else {
        setUpgradeError(data.error?.message || "Failed to upgrade role. Please try again.");
      }
    } catch (err: any) {
      setUpgradeError(err.message || "Failed to update role. Please check connection.");
    } finally {
      setIsUpgradingRole(false);
    }
  };

  if (isForbiddenBuyer) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem 1rem",
          background: "radial-gradient(ellipse at 50% 15%, rgba(239, 68, 68, 0.12), transparent 50%), #090A0F",
        }}
      >
        <div
          style={{
            maxWidth: "540px",
            width: "100%",
            background: "#12131A",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "16px",
            padding: "2.75rem 2.25rem",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: "2px",
              background: "linear-gradient(90deg, transparent, #ef4444, #f59e0b, transparent)",
            }}
          />

          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              color: "#ef4444",
            }}
          >
            <ShieldAlert size={28} />
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#ef4444",
              fontSize: "0.72rem",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              marginBottom: "1rem",
            }}
          >
            <span>RBAC ACCESS RESTRICTED • SELLER ROLE REQUIRED</span>
          </div>

          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "#ffffff",
              marginBottom: "0.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Creator Studio Access Required
          </h2>

          <p
            style={{
              fontSize: "0.88rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: "1.75rem",
            }}
          >
            You are currently authenticated as a <strong style={{ color: "#38BDF8" }}>BUYER</strong>.
            Creator Studio is strictly reserved for verified creators to publish codebases, inspect revenue telemetry, and disburse payouts.
          </p>

          {upgradeError && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#f87171",
                padding: "0.6rem 0.85rem",
                borderRadius: "8px",
                fontSize: "0.8rem",
                marginBottom: "1.25rem",
              }}
            >
              {upgradeError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              onClick={handleUpgradeToSeller}
              disabled={isUpgradingRole}
              style={{
                padding: "0.75rem 1.25rem",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                color: "#ffffff",
                border: "none",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: isUpgradingRole ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
              }}
            >
              <Sparkles size={16} />
              <span>{isUpgradingRole ? "Activating Creator Privileges..." : "Activate Creator Account (Switch to SELLER)"}</span>
            </button>

            <a
              href={process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3002"}
              style={{
                padding: "0.75rem 1.25rem",
                borderRadius: "8px",
                background: "#1F212D",
                color: "#ffffff",
                textDecoration: "none",
                fontSize: "0.88rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              Go to Buyer Developer Portal
            </a>

            <a
              href={`${process.env.NEXT_PUBLIC_WWW_URL || "http://localhost:3000"}/login`}
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                textDecoration: "underline",
                marginTop: "0.5rem",
              }}
            >
              Sign in with a different account
            </a>
          </div>
        </div>
      </div>
    );
  }

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
                  <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
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
                        flexShrink: 0,
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
                  <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
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
                  <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Storefront link and Creator Profile */}
        <div className="sidebar-footer">
          <a
            href={process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3003"}
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

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            <Link href="/settings" className="sidebar-user-row" style={{ textDecoration: "none", flex: 1, minWidth: 0 }}>
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
            <button
              type="button"
              onClick={async () => {
                await signOut();
                clearAuthStorage();
                const wwwUrl = process.env.NEXT_PUBLIC_WWW_URL || "http://localhost:3000";
                window.location.href = `${wwwUrl}/login`;
              }}
              title="Sign Out"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f87171")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >
              <LogOut size={16} />
            </button>
          </div>
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

