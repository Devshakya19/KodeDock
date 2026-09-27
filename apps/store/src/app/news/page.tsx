"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Radio,
  Sparkles,
  ShieldCheck,
  Package,
  ArrowUpRight,
  ExternalLink,
  Terminal,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";

interface RadarEntry {
  id: string;
  category: "RELEASE" | "TEMPLATE" | "SECURITY" | "ARCHITECTURE";
  title: string;
  tagline: string;
  body: string;
  date: string;
  version?: string;
  author: string;
  relatedSlug?: string;
  relatedTitle?: string;
}

const RADAR_ENTRIES: RadarEntry[] = [
  {
    id: "radar-001",
    category: "RELEASE",
    title: "Next.js 16 & Turbopack 16.3 Standardized Across All SaaS Templates",
    tagline: "Turbopack compilation speeds now under 950ms for cold development boots.",
    body: "All verified Next.js full-stack templates on KodeDock have been upgraded to Next.js 16.3.5 and React 19. All server actions now use strict Zod parameter validation and connection-pooled PostgreSQL clients.",
    date: "Sep 26, 2026",
    version: "v16.3.5",
    author: "KodeDock Core Architecture Team",
    relatedSlug: "nextjs-saas-starter",
    relatedTitle: "Next.js SaaS Starter",
  },
  {
    id: "radar-002",
    category: "TEMPLATE",
    title: "New Drop: FastAPI Enterprise Microservices Boilerplate Available",
    tagline: "Production-ready async Python 3.12 architecture with Celery workers and Redis streams.",
    body: "Created by senior backend engineers, this newly verified starter kit features JWT authentication, Alembic zero-downtime migrations, Docker Compose orchestration, and 100% test coverage using Pytest.",
    date: "Sep 24, 2026",
    version: "v1.0.0",
    author: "Verified Creator @alexdev",
    relatedSlug: "fastapi-microservices-kit",
    relatedTitle: "FastAPI Microservices Kit",
  },
  {
    id: "radar-003",
    category: "SECURITY",
    title: "Ed25519 Cryptographic License Key Signing Engine v1.2 Deployed",
    tagline: "Zero-dependency, machine-verified offline licensing for distributed applications.",
    body: "KodeDock's proprietary license verification engine now generates Ed25519 cryptographic signatures for every purchase. Distributed server instances can verify licenses locally without contacting central servers.",
    date: "Sep 20, 2026",
    version: "v1.2.0",
    author: "KodeDock Security & Cryptography Lab",
  },
  {
    id: "radar-004",
    category: "ARCHITECTURE",
    title: "PostgreSQL 16 Connection Pooling & Paise Financial Precision Standard",
    tagline: "Preventing floating-point arithmetic errors in multi-currency developer payouts.",
    body: "Under KodeDock's strict zero-mock mandate, all monetary amounts are strictly persisted as integer paise in PostgreSQL. Creator payouts are processed automatically at 95% revenue share with automated ledger reconciliations.",
    date: "Sep 18, 2026",
    author: "Dev Infrastructure Team",
  },
];

export default function RadarNewsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const filteredEntries = RADAR_ENTRIES.filter((entry) => {
    if (activeFilter === "ALL") return true;
    return entry.category === activeFilter;
  });

  return (
    <div className="store-container store-container-full" style={{ paddingBottom: "5rem" }}>
      {/* Header */}
      <header className="store-page-header">
        <div className="store-page-eyebrow">
          <Radio size={13} color="var(--accent-primary)" />
          <span>Live Dev Radar &amp; Changelog</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="store-page-title">Ecosystem Radar</h1>
            <p className="store-page-subtitle">
              Live updates on verified boilerplate drops, framework migrations, security advisories, and architecture standards across KodeDock.
            </p>
          </div>

          {/* Filter Chips */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {[
              { id: "ALL", label: "All Updates" },
              { id: "RELEASE", label: "Releases" },
              { id: "TEMPLATE", label: "Template Drops" },
              { id: "SECURITY", label: "Security" },
              { id: "ARCHITECTURE", label: "Architecture" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`filter-category-btn${activeFilter === f.id ? " active" : ""}`}
                style={{ fontSize: "0.78rem", padding: "0.4rem 0.8rem" }}
              >
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Timeline Feed */}
      <div className="radar-timeline-feed">
        {filteredEntries.map((item) => (
          <article key={item.id} className="radar-update-card">
            <div className="radar-tag-row">
              <span
                className={`radar-tag ${
                  item.category === "RELEASE"
                    ? "radar-tag-release"
                    : item.category === "SECURITY"
                    ? "radar-tag-security"
                    : "radar-tag-template"
                }`}
              >
                {item.category}
              </span>

              {item.version && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    background: "rgba(255, 255, 255, 0.04)",
                    padding: "0.15rem 0.45rem",
                    borderRadius: "4px",
                  }}
                >
                  {item.version}
                </span>
              )}

              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <Calendar size={12} />
                <span>{item.date}</span>
              </div>
            </div>

            <h2 className="radar-update-title">{item.title}</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 500, marginBottom: "0.6rem" }}>
              {item.tagline}
            </p>
            <p className="radar-update-body">{item.body}</p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "0.85rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
              }}
            >
              <span>By {item.author}</span>

              {item.relatedSlug && (
                <Link
                  href={`/product/${item.relatedSlug}`}
                  className="btn btn-secondary"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}
                >
                  <span>View {item.relatedTitle}</span>
                  <ArrowUpRight size={13} />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
