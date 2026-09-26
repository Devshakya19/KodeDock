import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ProductDetail } from "../../../types/store";
import { ProductGallery } from "../../../components/product/ProductGallery";
import { PurchasePanel } from "../../../components/product/PurchasePanel";
import { VersionHistoryTable } from "../../../components/product/VersionHistoryTable";
import {
  ChevronRight,
  ShieldCheck,
  Star,
  ExternalLink,
  Code2,
  FileCheck2,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

const API_BASE = process.env.INTERNAL_API_URL || "http://localhost:4000";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success && json.data ? json.data : null;
  } catch (error) {
    console.error(`Failed to fetch product for slug "${slug}":`, error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | KodeDock Store",
    };
  }

  return {
    title: `${product.title} | KodeDock Store`,
    description: product.tagline || product.description?.slice(0, 160),
    openGraph: {
      title: `${product.title} - KodeDock Software Marketplace`,
      description: product.tagline,
      images: product.thumbnail_url ? [{ url: product.thumbnail_url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return (
      <div className="product-detail-wrapper">
        <div className="store-container store-container-full">
          <div className="catalog-empty-state" style={{ margin: "4rem auto", maxWidth: "600px" }}>
            <h1 className="catalog-empty-title">Software Package Not Found</h1>
            <p className="catalog-empty-description">
              The codebase package you are looking for does not exist or has been archived by its creator.
            </p>
            <Link href="/" className="btn btn-primary">
              Return to Explore Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-wrapper">
      <div className="store-container store-container-full">
        {/* Breadcrumb Navigation (Epic Games Style) */}
        <nav className="product-breadcrumb-bar" aria-label="Breadcrumb">
          <Link href="/" className="breadcrumb-link">
            Explore
          </Link>
          <ChevronRight size={13} />
          <Link
            href={`/?category=${encodeURIComponent(product.category || "All")}`}
            className="breadcrumb-link"
          >
            {product.category || "Software"}
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
            {product.title}
          </span>
        </nav>

        {/* Product Header Block */}
        <header className="product-header-block">
          <h1 className="product-detail-title">{product.title}</h1>

          <div className="product-meta-subline">
            {/* Rating Stars */}
            <div className="product-rating-badge">
              <Star size={14} fill="var(--status-warning)" />
              <span>{product.avg_rating ? Number(product.avg_rating).toFixed(1) : "5.0"}</span>
              <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                ({product.total_sales || 0} reviews)
              </span>
            </div>

            {/* Creator / Seller */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ color: "var(--text-muted)" }}>By</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                {product.seller_name || "Verified Creator"}
              </span>
              <ShieldCheck size={14} color="var(--status-success)" />
            </div>

            {/* Category Badge */}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--accent-cyan)",
                background: "var(--cyan-subtle)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                padding: "0.15rem 0.5rem",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {product.category || "Architecture"}
            </span>

            {/* Commercial Status */}
            <span style={{ color: "var(--status-success)", fontSize: "0.8rem", fontWeight: 600 }}>
              ● Verified Architecture
            </span>
          </div>
        </header>

        {/* 2-Column Hero Layout (Main Column Left + Sticky Purchase Panel Right) */}
        <div className="product-layout-grid">
          {/* Main Left Column (~68%) */}
          <div className="product-primary-column">
            {/* Media Gallery / Screenshots Showcase */}
            <ProductGallery
              mainThumbnail={product.thumbnail_url}
              previewImages={product.preview_images}
              productTitle={product.title}
            />

            {/* Tagline & Live Demo Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
                padding: "1.25rem 1.5rem",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div style={{ flex: 1, minWidth: "280px" }}>
                <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
                  Product Summary
                </div>
                <div style={{ fontSize: "1rem", color: "var(--text-primary)", fontWeight: 500 }}>
                  {product.tagline}
                </div>
              </div>

              {product.live_demo_url && (
                <a
                  href={product.live_demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-cyan"
                  style={{ fontSize: "0.85rem", padding: "0.55rem 1.1rem" }}
                >
                  <span>Launch Live Demo</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>

            {/* About / Full Description Section */}
            <section className="detail-section-card">
              <h2 className="detail-section-title">
                <FileCheck2 size={20} color="var(--accent-primary)" />
                <span>About the Architecture</span>
              </h2>
              <div className="detail-body-text">
                {product.description ||
                  product.tagline ||
                  "This production-ready codebase includes fully typed models, database schemas, authentication workflows, and deployment configuration."}
              </div>
            </section>

            {/* Tech Stack & Architecture Badges */}
            <section className="detail-section-card">
              <h2 className="detail-section-title">
                <Code2 size={20} color="var(--accent-cyan)" />
                <span>Technology Stack &amp; Libraries</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                Pre-configured dependencies, types, and build scripts integrated directly into this repository.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {Array.isArray(product.tech_stack) && product.tech_stack.length > 0 ? (
                  product.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        background: "var(--bg-surface-elevated)",
                        border: "1px solid var(--border-highlight)",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.35rem 0.75rem",
                      }}
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Standard Next.js &amp; TypeScript Stack
                  </span>
                )}
              </div>
            </section>

            {/* Version & Release History Section */}
            <section className="detail-section-card">
              <h2 className="detail-section-title">
                <Layers size={20} color="var(--status-success)" />
                <span>Release History &amp; Cryptographic Signatures</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                Every release archive is SHA-256 hashed and digitally verified before deployment.
              </p>

              <VersionHistoryTable versions={product.versions || []} />
            </section>

            {/* Security, Refund & GST Guarantee Box */}
            <section
              style={{
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(56, 189, 248, 0.05) 100%)",
                border: "1px solid rgba(139, 92, 246, 0.25)",
                borderRadius: "var(--radius-lg)",
                padding: "1.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-md)",
                    background: "rgba(139, 92, 246, 0.15)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-primary)",
                    flexShrink: 0,
                  }}
                >
                  <Lock size={22} />
                </div>

                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.35rem" }}>
                    100% Cryptographic License &amp; Security Assurance
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                    Every purchase generates a unique, offline-verifiable <strong>Ed25519 digital license certificate</strong>.
                    Automated B2B GST tax invoices are provided with instant download access delivered directly to your Developer Portal.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sticky Purchase Panel (~32%) */}
          <PurchasePanel product={product} />
        </div>
      </div>
    </div>
  );
}
