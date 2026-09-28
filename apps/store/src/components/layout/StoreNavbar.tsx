"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAutoAvatar } from "../../lib/avatars";
import {
  Search,
  ShoppingCart,
  Heart,
  Boxes,
  Radio,
  ChevronDown,
  Package,
  Key,
  Sparkles,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { syncAuthStorage, clearAuthStorage, signOut } from "@kodedock/auth/client";

export const StoreNavbar: React.FC = () => {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cartCount, wishlistCount, isHydrated } = useStore();

  const [user, setUser] = useState<{
    id?: string;
    name: string;
    email?: string;
    image?: string | null;
  } | null>(null);

  // Fetch live buyer / developer profile
  useEffect(() => {
    fetch("/api/portal/profile")
      .then((r) => {
        if (r.status === 401) {
          clearAuthStorage();
        }
        return r.json();
      })
      .then((d) => {
        if (d.success && d.data) {
          setUser(d.data);
          syncAuthStorage({
            user: d.data,
            role: d.data.role || "BUYER",
          });
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const userAvatar =
    user?.image || getAutoAvatar(user?.id || user?.email || user?.name || "developer");
  const displayName = user?.name || "Developer";
  const displayEmail = user?.email || "developer@kodedock.local";

  return (
    <header className="store-nav-wrapper">
      <div className="store-container store-container-full">
        <div className="store-main-navbar">
          {/* Left Brand & Store Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            <Link href="/" className="brand-link">
              <img src="/kd.svg" alt="KodeDock" className="brand-logo-img" />
              <span className="brand-name">KodeDock</span>
              <span className="store-chip">Store</span>
            </Link>

            {/* Store Navigation Tabs with developer Radar icon */}
            <nav className="store-nav-tabs" aria-label="Store navigation">
              <Link
                href="/"
                className={`store-nav-tab${pathname === "/" ? " active" : ""}`}
              >
                <Boxes size={16} aria-hidden="true" />
                <span>Explore</span>
              </Link>
              <Link
                href="/news"
                className={`store-nav-tab${pathname === "/news" ? " active" : ""}`}
              >
                <Radio size={15} aria-hidden="true" />
                <span>Radar</span>
              </Link>
            </nav>
          </div>

          {/* Right Search Bar, Wishlist, Cart & User Profile */}
          <div className="nav-actions">
            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit}>
              <div className="search-input-box">
                <Search size={14} className="search-icon" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search codebases, stacks..."
                  className="search-input"
                  aria-label="Search software in marketplace"
                />
                <span className="search-shortcut" aria-hidden="true">⌘K</span>
              </div>
            </form>

            {/* Wishlist Link with Live Badge */}
            <Link
              href="/wishlist"
              className={`btn btn-ghost btn-icon${pathname === "/wishlist" ? " active-nav-tab" : ""}`}
              style={{ position: "relative" }}
              title="View Wishlist"
              aria-label="Wishlist"
            >
              <Heart
                size={18}
                color={isHydrated && wishlistCount > 0 ? "var(--status-danger)" : "currentColor"}
                fill={isHydrated && wishlistCount > 0 ? "var(--status-danger)" : "none"}
              />
              {isHydrated && wishlistCount > 0 && (
                <span className="nav-badge-counter badge-danger">{wishlistCount}</span>
              )}
            </Link>

            {/* Cart Link with Live Badge */}
            <Link
              href="/cart"
              className={`btn btn-ghost btn-icon${pathname === "/cart" ? " active-nav-tab" : ""}`}
              style={{ position: "relative" }}
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={18} />
              {isHydrated && cartCount > 0 && (
                <span className="nav-badge-counter badge-cyan">{cartCount}</span>
              )}
            </Link>

            {/* User Profile Component (Replaces Portal & Studio buttons) */}
            <div className="user-profile-menu-container" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="user-profile-trigger-btn"
                aria-label="User profile and account options"
                aria-expanded={isProfileOpen}
              >
                <img
                  src={userAvatar}
                  alt={displayName}
                  className="user-profile-avatar-circle"
                />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {displayName}
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

              {/* Sleek Obsidian Dropdown Card */}
              {isProfileOpen && (
                <div className="user-profile-dropdown-card">
                  {/* User Profile Header */}
                  <div className="user-dropdown-header">
                    <div style={{ position: "relative" }}>
                      <img
                        src={userAvatar}
                        alt={displayName}
                        className="user-dropdown-avatar-lg"
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "var(--status-success)",
                          border: "2px solid #12131A",
                        }}
                        title="Online"
                      />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="user-dropdown-name">{displayName}</div>
                      <div className="user-dropdown-email">{displayEmail}</div>
                    </div>
                  </div>

                  {/* Ecosystem Quick Access Links */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                    <a
                      href={process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3002"}
                      className="user-dropdown-item-link"
                    >
                      <Package size={15} color="var(--accent-primary)" />
                      <span>Developer Portal (Library)</span>
                    </a>

                    <a
                      href={`${process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3002"}/licenses`}
                      className="user-dropdown-item-link"
                    >
                      <Key size={15} color="var(--accent-cyan)" />
                      <span>License Vault</span>
                    </a>

                    <a
                      href={process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3001"}
                      className="user-dropdown-item-link"
                    >
                      <Sparkles size={15} color="var(--status-warning)" />
                      <span>Creator Studio</span>
                    </a>

                    <a
                      href={`${process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3002"}/settings`}
                      className="user-dropdown-item-link"
                    >
                      <Settings size={15} color="var(--text-muted)" />
                      <span>Account Settings</span>
                    </a>
                  </div>

                  <div className="user-dropdown-divider" />

                  <a
                    href={`${process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3002"}/profile`}
                    className="user-dropdown-item-link"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <User size={15} />
                    <span>View Developer Profile</span>
                  </a>

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
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      color: "#f87171",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
