"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "../../context/StoreContext";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Boxes,
} from "lucide-react";

export default function WishlistPage() {
  const {
    wishlist,
    wishlistCount,
    moveToCart,
    moveAllToCart,
    removeFromWishlist,
    clearWishlist,
    isHydrated,
  } = useStore();

  if (!isHydrated) {
    return (
      <div className="store-container store-container-full" style={{ padding: "4rem 1.5rem" }}>
        <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
          Loading saved developer codebases...
        </div>
      </div>
    );
  }

  return (
    <div className="store-container store-container-full" style={{ paddingBottom: "5rem" }}>
      {/* Page Header */}
      <header className="store-page-header">
        <div className="store-page-eyebrow">
          <Heart size={13} color="var(--status-danger)" fill="var(--status-danger)" />
          <span>Saved Codebases</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="store-page-title">Developer Wishlist</h1>
            <p className="store-page-subtitle">
              Verified architectures and templates you've bookmarked for your next production builds.
            </p>
          </div>

          {wishlistCount > 0 && (
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <button
                type="button"
                onClick={moveAllToCart}
                className="btn btn-primary"
                style={{ padding: "0.55rem 1rem", fontSize: "0.82rem" }}
              >
                <ShoppingCart size={15} />
                <span>Move All to Cart ({wishlistCount})</span>
              </button>
              <button
                type="button"
                onClick={clearWishlist}
                className="btn btn-ghost"
                style={{ padding: "0.55rem 0.85rem", fontSize: "0.82rem", color: "var(--text-muted)" }}
                title="Clear all wishlisted items"
              >
                <Trash2 size={15} />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Wishlist Items Grid or Empty State */}
      {wishlistCount === 0 ? (
        <div className="double-bezel-card" style={{ maxWidth: "620px", margin: "3rem auto" }}>
          <div className="double-bezel-inner" style={{ textAlign: "center", padding: "3.5rem 2rem" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                color: "var(--status-danger)",
              }}
            >
              <Heart size={26} />
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.45rem",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: "0.5rem",
              }}
            >
              Your Wishlist is Empty
            </h2>
            <p
              style={{
                fontSize: "0.88rem",
                color: "var(--text-secondary)",
                maxWidth: "420px",
                margin: "0 auto 1.75rem",
                lineHeight: 1.5,
              }}
            >
              You haven't bookmarked any boilerplates or templates yet. Explore our verified marketplace to discover full-stack codebases.
            </p>
            <Link
              href="/"
              className="btn btn-primary"
              style={{ display: "inline-flex", padding: "0.65rem 1.25rem" }}
            >
              <Boxes size={16} />
              <span>Explore Modern Templates</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <div key={item.productId} className="double-bezel-card">
              <div className="double-bezel-inner" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                {/* Media Thumbnail */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    marginBottom: "1rem",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-surface-elevated)",
                  }}
                >
                  <img
                    src={item.thumbnail_url || "/kd.svg"}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: "8px",
                      left: "8px",
                      fontSize: "0.68rem",
                      fontFamily: "var(--font-mono)",
                      background: "rgba(9, 10, 15, 0.8)",
                      backdropFilter: "blur(6px)",
                      color: "var(--accent-cyan)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      border: "1px solid rgba(56, 189, 248, 0.25)",
                    }}
                  >
                    {item.category || "Software"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.productId)}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(9, 10, 15, 0.75)",
                      backdropFilter: "blur(6px)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "var(--status-danger)",
                    }}
                    title="Remove from wishlist"
                    aria-label="Remove item from wishlist"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Link
                    href={`/product/${item.slug}`}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#ffffff",
                      textDecoration: "none",
                      marginBottom: "0.35rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {item.title}
                  </Link>

                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-muted)",
                      lineHeight: 1.4,
                      marginBottom: "0.85rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.tagline}
                  </p>

                  {/* Tech stack pills */}
                  {Array.isArray(item.tech_stack) && item.tech_stack.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}>
                      {item.tech_stack.slice(0, 3).map((tech) => (
                        <span key={tech} className="tech-pill">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Pricing and Actions Row */}
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "0.85rem",
                      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                          textTransform: "uppercase",
                        }}
                      >
                        Standard License
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "1.15rem",
                          fontWeight: 700,
                          color: "var(--accent-cyan)",
                        }}
                      >
                        {item.formatted_price}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => moveToCart(item, "STANDARD")}
                        className="btn btn-primary"
                        style={{ padding: "0.45rem 0.85rem", fontSize: "0.78rem" }}
                        title="Move to shopping cart"
                      >
                        <ShoppingCart size={14} />
                        <span>Move to Cart</span>
                      </button>
                      <Link
                        href={`/product/${item.slug}`}
                        className="btn btn-secondary btn-icon"
                        title="View details"
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
