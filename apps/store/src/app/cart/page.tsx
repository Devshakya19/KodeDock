"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "../../context/StoreContext";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Tag,
  CheckCircle2,
  Boxes,
} from "lucide-react";

export default function CartPage() {
  const {
    cart,
    cartCount,
    removeFromCart,
    updateCartLicense,
    clearCart,
    cartSubtotalPaise,
    formattedSubtotal,
    isHydrated,
  } = useStore();

  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === "KODEDOCK10") {
      setDiscountPercent(10);
      setCouponMessage({ text: "10% Early Adopter Discount applied!", success: true });
    } else if (clean === "DEVBUILD") {
      setDiscountPercent(15);
      setCouponMessage({ text: "15% Developer Kit Discount applied!", success: true });
    } else if (!clean) {
      setCouponMessage(null);
      setDiscountPercent(0);
    } else {
      setCouponMessage({ text: "Invalid promo code. Try 'KODEDOCK10'", success: false });
    }
  };

  const discountPaise = Math.round((cartSubtotalPaise * discountPercent) / 100);
  const finalTotalPaise = Math.max(0, cartSubtotalPaise - discountPaise);
  const formattedDiscount = `₹${(discountPaise / 100).toLocaleString("en-IN")}`;
  const formattedTotal = `₹${(finalTotalPaise / 100).toLocaleString("en-IN")}`;

  if (!isHydrated) {
    return (
      <div className="store-container store-container-full" style={{ padding: "4rem 1.5rem" }}>
        <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
          Loading shopping cart...
        </div>
      </div>
    );
  }

  return (
    <div className="store-container store-container-full" style={{ paddingBottom: "5rem" }}>
      {/* Page Header */}
      <header className="store-page-header">
        <div className="store-page-eyebrow">
          <ShoppingCart size={13} color="var(--accent-cyan)" />
          <span>Order Review</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="store-page-title">Shopping Cart</h1>
            <p className="store-page-subtitle">
              Review your selected developer architectures, configure license tiers, and proceed to instant checkout.
            </p>
          </div>

          {cartCount > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="btn btn-ghost"
              style={{ padding: "0.55rem 0.85rem", fontSize: "0.82rem", color: "var(--text-muted)" }}
              title="Clear all items in cart"
            >
              <Trash2 size={15} />
              <span>Clear Cart</span>
            </button>
          )}
        </div>
      </header>

      {/* Cart Content or Empty State */}
      {cartCount === 0 ? (
        <div className="double-bezel-card" style={{ maxWidth: "620px", margin: "3rem auto" }}>
          <div className="double-bezel-inner" style={{ textAlign: "center", padding: "3.5rem 2rem" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                color: "var(--accent-cyan)",
              }}
            >
              <ShoppingCart size={26} />
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
              Your Cart is Empty
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
              No developer boilerplates or templates have been added yet. Browse our curated catalog to accelerate your production build.
            </p>
            <Link
              href="/"
              className="btn btn-primary"
              style={{ display: "inline-flex", padding: "0.65rem 1.25rem" }}
            >
              <Boxes size={16} />
              <span>Explore Marketplace</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="cart-layout-grid">
          {/* Left Column: Cart Items */}
          <div className="cart-items-column">
            {cart.map((item) => (
              <div key={item.id} className="cart-item-card">
                {/* Media Thumbnail */}
                <div className="cart-item-media">
                  <img
                    src={item.thumbnail_url || "/kd.svg"}
                    alt={item.title}
                    className="cart-item-img"
                    loading="lazy"
                  />
                </div>

                {/* Content details */}
                <div className="cart-item-content">
                  <Link href={`/product/${item.slug}`} className="cart-item-title">
                    {item.title}
                  </Link>
                  <p className="cart-item-tagline">{item.tagline}</p>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>License:</span>
                      <select
                        value={item.license_type}
                        onChange={(e) =>
                          updateCartLicense(
                            item.id,
                            e.target.value as "STANDARD" | "EXTENDED"
                          )
                        }
                        className="cart-license-select"
                        aria-label="Select license tier"
                      >
                        <option value="STANDARD">Standard Commercial</option>
                        {item.extended_price && item.extended_price > 0 && (
                          <option value="EXTENDED">Extended SaaS License</option>
                        )}
                      </select>
                    </div>

                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)",
                        background: "rgba(255, 255, 255, 0.04)",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Price & Remove action */}
                <div className="cart-item-price-wrap">
                  <div className="cart-item-price">{item.formatted_price}</div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="btn btn-ghost"
                    style={{
                      padding: "0.3rem 0.6rem",
                      fontSize: "0.75rem",
                      color: "var(--status-danger)",
                      marginTop: "0.5rem",
                    }}
                    title="Remove item from cart"
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Guarantee / Security Callout */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem 1.25rem",
                background: "rgba(56, 189, 248, 0.04)",
                border: "1px solid rgba(56, 189, 248, 0.15)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
              }}
            >
              <ShieldCheck size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: "#ffffff" }}>Instant Cryptographic Provisioning:</strong>{" "}
                Completing checkout immediately registers an Ed25519 license key and unlocks a 60-second secure download link in your buyer portal.
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (Double-Bezel Bento) */}
          <div className="order-summary-box">
            <div className="double-bezel-card">
              <div className="double-bezel-inner">
                <h2 className="summary-heading">
                  <span>Order Summary</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {cartCount} {cartCount === 1 ? "Item" : "Items"}
                  </span>
                </h2>

                {/* Subtotal */}
                <div className="summary-line-row">
                  <span>Subtotal</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "#ffffff" }}>
                    {formattedSubtotal}
                  </span>
                </div>

                {/* Platform Fee */}
                <div className="summary-line-row">
                  <span>Platform Fee</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--status-success)" }}>
                    FREE
                  </span>
                </div>

                {/* Discount if applied */}
                {discountPercent > 0 && (
                  <div className="summary-line-row" style={{ color: "var(--accent-cyan)" }}>
                    <span>Promo Discount ({discountPercent}%)</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      -{formattedDiscount}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className="summary-line-row summary-line-total">
                  <span>Total Amount</span>
                  <span className="summary-total-val">{formattedTotal}</span>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyCoupon} style={{ marginTop: "1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Promo code (e.g. KODEDOCK10)"
                        className="form-input-custom"
                        style={{ paddingLeft: "2rem", fontSize: "0.78rem" }}
                      />
                      <Tag
                        size={13}
                        style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-secondary"
                      style={{ padding: "0.5rem 0.85rem", fontSize: "0.78rem" }}
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage && (
                    <div
                      style={{
                        fontSize: "0.72rem",
                        marginTop: "0.4rem",
                        color: couponMessage.success ? "var(--status-success)" : "var(--status-danger)",
                      }}
                    >
                      {couponMessage.text}
                    </div>
                  )}
                </form>

                {/* Checkout CTA */}
                <div style={{ marginTop: "1.5rem" }}>
                  <Link
                    href={`/checkout${discountPercent > 0 ? `?coupon=${encodeURIComponent(couponCode)}` : ""}`}
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      fontSize: "0.95rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.65rem",
                    }}
                  >
                    <Lock size={15} />
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>

                <div
                  style={{
                    marginTop: "1.25rem",
                    textAlign: "center",
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.45rem",
                  }}
                >
                  <Lock size={12} color="var(--status-success)" />
                  <span>256-bit Encrypted SSL Developer Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
