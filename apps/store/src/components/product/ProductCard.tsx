"use client";

import React from "react";
import Link from "next/link";
import type { StoreProduct } from "../../types/store";
import { ShieldCheck, ArrowUpRight, Heart } from "lucide-react";
import { useStore } from "../../context/StoreContext";

interface ProductCardProps {
  product: StoreProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useStore();
  const wishlisted = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link href={`/product/${product.slug}`} className="store-product-card">
      {/* 16:9 Thumbnail Preview */}
      <div className="card-media-wrap">
        <img
          src={product.thumbnail_url || "/kd.svg"}
          alt={product.title}
          className="card-media-img"
          loading="lazy"
        />
        <span className="card-category-badge">
          {product.category || "Software"}
        </span>

        {/* Quick Wishlist Action */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className="card-quick-wishlist-btn"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={14}
            color={wishlisted ? "var(--status-danger)" : "#ffffff"}
            fill={wishlisted ? "var(--status-danger)" : "none"}
          />
        </button>
      </div>

      {/* Card Content Body */}
      <div className="card-body-content">
        <div className="card-seller-row">
          <span>By {product.seller_name || "Verified Creator"}</span>
          <ShieldCheck size={13} color="var(--status-success)" />
        </div>

        <h3 className="card-product-title" title={product.title}>
          {product.title}
        </h3>

        <p className="card-product-tagline" title={product.tagline}>
          {product.tagline}
        </p>

        {/* Tech Stack Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.85rem" }}>
          {Array.isArray(product.tech_stack) && product.tech_stack.slice(0, 3).map((tech) => (
            <span key={tech} className="tech-pill">
              {tech}
            </span>
          ))}
        </div>

        {/* Price & Action Footer */}
        <div className="card-footer-row">
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>
              Commercial License
            </div>
            <div className="card-price-text">
              {product.formatted_price || `₹${(product.standard_price / 100).toLocaleString("en-IN")}`}
            </div>
          </div>

          <span
            className="btn btn-primary"
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem" }}
          >
            <span>View</span>
            <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
};
