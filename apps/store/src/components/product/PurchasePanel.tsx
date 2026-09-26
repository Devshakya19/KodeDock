"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ProductDetail } from "../../types/store";
import {
  ShieldCheck,
  Zap,
  Heart,
  ShoppingCart,
  Calendar,
  Layers,
  Star,
  Users,
  Check,
  FileCode,
} from "lucide-react";

interface PurchasePanelProps {
  product: ProductDetail;
}

export const PurchasePanel: React.FC<PurchasePanelProps> = ({ product }) => {
  const [selectedLicense, setSelectedLicense] = useState<"STANDARD" | "EXTENDED">(
    "STANDARD"
  );
  const [isWishlisted, setIsWishlisted] = useState(false);

  const standardPriceText =
    product.formatted_price ||
    `₹${(product.standard_price / 100).toLocaleString("en-IN")}`;

  const hasExtendedLicense =
    product.extended_price && product.extended_price > 0;

  const extendedPriceText = hasExtendedLicense
    ? product.formatted_extended_price ||
      `₹${((product.extended_price || 0) / 100).toLocaleString("en-IN")}`
    : null;

  const currentPriceText =
    selectedLicense === "EXTENDED" && extendedPriceText
      ? extendedPriceText
      : standardPriceText;

  const formattedReleaseDate = product.created_at
    ? new Date(product.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently Added";

  return (
    <aside className="product-purchase-sidebar" aria-label="Purchase options">
      {/* Product Logo / Header Preview */}
      <div className="purchase-thumbnail-preview">
        <img
          src={product.thumbnail_url || "/kd.svg"}
          alt={product.title}
          className="purchase-thumbnail-img"
        />
      </div>

      {/* Commercial License Pill */}
      <div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--accent-cyan)",
            background: "var(--cyan-subtle)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            padding: "0.2rem 0.55rem",
            borderRadius: "4px",
            marginBottom: "0.5rem",
          }}
        >
          <span>Commercial Codebase</span>
        </div>

        {/* Big Price Tag (Clash Display) */}
        <div className="purchase-price-tag">{currentPriceText}</div>
        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
          One-time payment • All minor updates included
        </div>
      </div>

      {/* License Selector (Standard Commercial vs Extended) */}
      {hasExtendedLicense && (
        <div className="license-toggle-box">
          <div
            onClick={() => setSelectedLicense("STANDARD")}
            className={`license-toggle-option${selectedLicense === "STANDARD" ? " selected" : ""}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSelectedLicense("STANDARD");
            }}
          >
            <div>
              <div className="license-option-name">Standard License</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Single project deployment
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="license-option-price">{standardPriceText}</span>
              {selectedLicense === "STANDARD" && (
                <Check size={14} color="var(--accent-primary)" />
              )}
            </div>
          </div>

          <div
            onClick={() => setSelectedLicense("EXTENDED")}
            className={`license-toggle-option${selectedLicense === "EXTENDED" ? " selected" : ""}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSelectedLicense("EXTENDED");
            }}
          >
            <div>
              <div className="license-option-name">Extended License</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Unlimited client SaaS deployments
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="license-option-price">{extendedPriceText}</span>
              {selectedLicense === "EXTENDED" && (
                <Check size={14} color="var(--accent-primary)" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <Link
          href={`/checkout?productId=${product.id}&license=${selectedLicense.toLowerCase()}`}
          className="btn btn-primary"
          style={{ width: "100%", padding: "0.85rem", fontSize: "0.95rem" }}
        >
          <Zap size={16} />
          <span>Buy Now ({currentPriceText})</span>
        </Link>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="btn btn-secondary"
            style={{ flex: 1, padding: "0.65rem", fontSize: "0.82rem" }}
          >
            <Heart
              size={15}
              color={isWishlisted ? "var(--status-danger)" : "currentColor"}
              fill={isWishlisted ? "var(--status-danger)" : "none"}
            />
            <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
          </button>

          <Link
            href={`/cart?add=${product.id}`}
            className="btn btn-secondary btn-icon"
            title="Add to shopping cart"
          >
            <ShoppingCart size={16} />
          </Link>
        </div>
      </div>

      {/* Instant Digital Delivery Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          padding: "0.65rem 0.85rem",
          borderRadius: "var(--radius-md)",
          fontSize: "0.75rem",
          color: "var(--status-success)",
        }}
      >
        <ShieldCheck size={16} style={{ flexShrink: 0 }} />
        <span>Instant signed download link &amp; Ed25519 license key</span>
      </div>

      {/* Technical Specifications Summary List (Epic Games Style) */}
      <div className="sidebar-spec-list">
        <div className="sidebar-spec-row">
          <span className="spec-row-label">Developer</span>
          <span className="spec-row-val">
            <span>{product.seller_name || "Verified Architect"}</span>
            <ShieldCheck size={13} color="var(--status-success)" />
          </span>
        </div>

        <div className="sidebar-spec-row">
          <span className="spec-row-label">Category</span>
          <span className="spec-row-val">{product.category || "Full-Stack"}</span>
        </div>

        <div className="sidebar-spec-row">
          <span className="spec-row-label">Total Purchases</span>
          <span className="spec-row-val">
            <Users size={12} color="var(--text-muted)" />
            <span>{product.total_sales || 0} developers</span>
          </span>
        </div>

        <div className="sidebar-spec-row">
          <span className="spec-row-label">Customer Rating</span>
          <span className="spec-row-val">
            <Star size={12} color="var(--status-warning)" fill="var(--status-warning)" />
            <span>{product.avg_rating ? `${Number(product.avg_rating).toFixed(1)} / 5.0` : "Unrated"}</span>
          </span>
        </div>

        <div className="sidebar-spec-row">
          <span className="spec-row-label">Release Date</span>
          <span className="spec-row-val">
            <Calendar size={12} color="var(--text-muted)" />
            <span>{formattedReleaseDate}</span>
          </span>
        </div>

        <div className="sidebar-spec-row">
          <span className="spec-row-label">Licensing Authority</span>
          <span className="spec-row-val" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
            Ed25519 Cryptographic
          </span>
        </div>
      </div>
    </aside>
  );
};
