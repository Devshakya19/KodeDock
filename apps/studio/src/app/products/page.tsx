"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Sparkles,
  ExternalLink,
  GitBranch,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { CreatorProduct } from "@/types/studio";

export default function StudioProductsPage() {
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/studio/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setProducts(d.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "4rem" }}>
      {/* ── Header & Action ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)", padding: "0.25rem 0.65rem", borderRadius: "9999px", fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
            <Package size={13} />
            <span>Inventory &amp; Listings</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>
            My Boilerplates &amp; Templates
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Manage software packages, monitor buyer adoption, and push version updates.
          </p>
        </div>

        <Link href="/products/new" className="btn btn-primary" style={{ padding: "0.6rem 1.25rem", fontSize: "0.82rem" }}>
          <Sparkles size={15} />
          <span>Publish New Boilerplate</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── Search & Status Filters ───────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { id: "ALL", label: "All Packages" },
            { id: "PUBLISHED", label: "Published" },
            { id: "PENDING_REVIEW", label: "In Review" },
            { id: "DRAFT", label: "Drafts" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`filter-category-btn${statusFilter === tab.id ? " active" : ""}`}
              style={{ fontSize: "0.78rem", padding: "0.4rem 0.85rem" }}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by title, stack..."
            className="form-input-custom"
            style={{ paddingLeft: "2.2rem", fontSize: "0.82rem" }}
          />
          <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        </div>
      </div>

      {/* ── Listings Table / Grid ─────────────────────────────────────────── */}
      {filteredProducts.length === 0 ? (
        <div className="portal-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <Package size={36} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontFamily: "var(--font-display)", color: "#ffffff", fontSize: "1.35rem", marginBottom: "0.5rem" }}>
            No Software Packages Found
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", maxWidth: "460px", margin: "0 auto 1.5rem" }}>
            {searchQuery || statusFilter !== "ALL"
              ? "No packages match your current search and filter criteria. Try resetting the filters."
              : "You haven't listed any software boilerplates yet. Monetize your architectures with 95% revenue share."}
          </p>
          <Link href="/products/new" className="btn btn-primary" style={{ display: "inline-flex", padding: "0.6rem 1.25rem" }}>
            <Sparkles size={15} />
            <span>Publish Your First Boilerplate</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredProducts.map((p) => (
            <div key={p.id} className="portal-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
              {/* Media Thumbnail */}
              <div style={{ width: "120px", height: "80px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-subtle)", background: "var(--bg-surface-elevated)", flexShrink: 0 }}>
                <img src={p.thumbnail_url || "/kd.svg"} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              {/* Title & Stacks */}
              <div style={{ flex: 1, minWidth: "260px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.25rem" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>
                    {p.title}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-mono)",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "4px",
                      fontWeight: 700,
                      background:
                        p.status === "PUBLISHED"
                          ? "rgba(16, 185, 129, 0.12)"
                          : p.status === "PENDING_REVIEW"
                          ? "rgba(245, 158, 11, 0.12)"
                          : "rgba(255, 255, 255, 0.05)",
                      color:
                        p.status === "PUBLISHED"
                          ? "var(--status-success)"
                          : p.status === "PENDING_REVIEW"
                          ? "var(--status-warning)"
                          : "var(--text-muted)",
                      border: `1px solid ${
                        p.status === "PUBLISHED"
                          ? "rgba(16, 185, 129, 0.25)"
                          : p.status === "PENDING_REVIEW"
                          ? "rgba(245, 158, 11, 0.25)"
                          : "rgba(255, 255, 255, 0.1)"
                      }`,
                    }}
                  >
                    {p.status}
                  </span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  {p.tagline}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {Array.isArray(p.tech_stack) && p.tech_stack.slice(0, 4).map((tech) => (
                    <span key={tech} className="tech-pill">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Version & Price */}
              <div style={{ minWidth: "140px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                  Active Version
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "0.35rem" }}>
                  {p.active_version || "v1.0.0"}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                  Standard Price
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-cyan)" }}>
                  {p.formatted_price}
                </div>
              </div>

              {/* Sales & Revenue */}
              <div style={{ minWidth: "120px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                  Sales Volume
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.35rem" }}>
                  {p.total_sales || 0} units
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                  Gross Revenue
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", fontWeight: 700, color: "var(--status-success)" }}>
                  {p.formatted_revenue || "₹0"}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <Link
                  href={`/releases?productId=${p.id}`}
                  className="btn btn-secondary"
                  style={{ padding: "0.45rem 0.85rem", fontSize: "0.78rem" }}
                  title="Push new software version release"
                >
                  <GitBranch size={13} />
                  <span>Release</span>
                </Link>
                <a
                  href={`http://localhost:3003/product/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-icon"
                  title="View on public marketplace"
                >
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
