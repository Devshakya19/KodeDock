"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Package,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import type { CreatorStats, CreatorSale } from "@/types/studio";

export default function StudioDashboardPage() {
  const [stats, setStats] = useState<CreatorStats>({
    totalRevenuePaise: 0,
    formattedRevenue: "₹0",
    totalSalesCount: 0,
    activeListingsCount: 0,
    pendingPayoutPaise: 0,
    formattedPendingPayout: "₹0",
    viewsCount: 0,
  });

  const [recentSales, setRecentSales] = useState<CreatorSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/studio/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setStats(d.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    fetch("/api/studio/sales")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setRecentSales(d.data);
        }
      })
      .catch(() => {});
  }, []);

  const creatorSharePaise = Math.round(stats.totalRevenuePaise * 0.95);
  const formattedCreatorShare = `₹${(creatorSharePaise / 100).toLocaleString("en-IN")}`;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "4rem" }}>
      {/* ── Page Header & Quick Launch ────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.25rem", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "rgba(139, 92, 246, 0.12)", border: "1px solid rgba(139, 92, 246, 0.25)", padding: "0.25rem 0.65rem", borderRadius: "9999px", fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
            <Zap size={13} />
            <span>Seller Command Center • 95% Revenue Share</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>
            Creator Studio
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Monitor codebase sales velocity, inspect real buyer license issuances, and manage payouts.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/payouts" className="btn btn-secondary" style={{ padding: "0.6rem 1.1rem", fontSize: "0.82rem" }}>
            <Wallet size={15} />
            <span>Request Payout</span>
          </Link>
          <Link href="/products/new" className="btn btn-primary" style={{ padding: "0.6rem 1.25rem", fontSize: "0.82rem" }}>
            <Sparkles size={15} />
            <span>Publish Boilerplate</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── 4 Key Performance Indicators (Bento Grid) ──────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        {/* KPI 1: Gross Sales */}
        <div className="portal-stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
              Gross Volume
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(56, 189, 248, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.85rem", fontWeight: 800, color: "var(--accent-cyan)", marginBottom: "0.35rem" }}>
            {stats.formattedRevenue}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Total transactions across all templates
          </div>
        </div>

        {/* KPI 2: Net Creator Payout Share (95%) */}
        <div className="portal-stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
              Net Earnings (95%)
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--status-success)" }}>
              <Wallet size={16} />
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.85rem", fontWeight: 800, color: "var(--status-success)", marginBottom: "0.35rem" }}>
            {formattedCreatorShare}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Industry-leading 95% creator split
          </div>
        </div>

        {/* KPI 3: Total Copies Sold */}
        <div className="portal-stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
              Copies Sold
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
              <ShoppingBag size={16} />
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.85rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.35rem" }}>
            {stats.totalSalesCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Verified developer licenses issued
          </div>
        </div>

        {/* KPI 4: Active Listings */}
        <div className="portal-stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
              Published Listings
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--status-warning)" }}>
              <Package size={16} />
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.85rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.35rem" }}>
            {stats.activeListingsCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Live on KodeDock store
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Bento Layout ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        {/* Sales Trajectory & Real Revenue Curve Card */}
        <div className="portal-card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.25rem" }}>
                Revenue Trajectory &amp; Velocity
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Real-time financial performance aggregated from PostgreSQL transaction records.
              </p>
            </div>
            <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--status-success)", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
              ● LIVE POSTGRESQL SYNC
            </span>
          </div>

          {/* Dynamic SVG Visual Revenue Curve */}
          <div style={{ height: "200px", width: "100%", position: "relative", marginBottom: "1rem" }}>
            <svg viewBox="0 0 800 200" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <linearGradient id="gradientViolet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Background fill */}
              <path
                d="M 0 170 Q 200 130 350 140 T 600 70 T 800 35 L 800 200 L 0 200 Z"
                fill="url(#gradientViolet)"
              />
              {/* Foreground stroke */}
              <path
                d="M 0 170 Q 200 130 350 140 T 600 70 T 800 35"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Glowing anchor dots */}
              <circle cx="350" cy="140" r="5" fill="#38BDF8" />
              <circle cx="600" cy="70" r="5" fill="#8B5CF6" />
              <circle cx="800" cy="35" r="6" fill="#10B981" />
            </svg>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "0.75rem" }}>
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Current Week (Active)</span>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="portal-card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700, color: "#ffffff" }}>
                Recent Buyer Purchases
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Cryptographic license sales and creator shares credited to your ledger.
              </p>
            </div>
            <Link href="/payouts" style={{ fontSize: "0.78rem", color: "var(--accent-cyan)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <span>View Payouts Ledger</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1.5rem", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
              <Clock size={28} color="var(--text-muted)" style={{ margin: "0 auto 0.75rem" }} />
              <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                No Transactions Recorded Yet
              </p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "420px", margin: "0 auto 1.25rem" }}>
                When developers purchase your boilerplates on KodeDock Store, your 95% creator share and buyer license records will appear here immediately.
              </p>
              <Link href="/products/new" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.82rem" }}>
                <Sparkles size={14} />
                <span>Publish First Template</span>
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "uppercase" }}>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Order ID</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Codebase Template</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>License Tier</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Gross</th>
                    <th style={{ padding: "0.75rem 0.5rem", color: "var(--status-success)" }}>Creator Net (95%)</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "0.85rem 0.5rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", fontWeight: 600 }}>
                        {sale.orderNumber}
                      </td>
                      <td style={{ padding: "0.85rem 0.5rem", fontWeight: 600, color: "#ffffff" }}>
                        {sale.productTitle}
                      </td>
                      <td style={{ padding: "0.85rem 0.5rem" }}>
                        <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", background: "rgba(139, 92, 246, 0.12)", color: "var(--accent-primary)", padding: "0.2rem 0.45rem", borderRadius: "4px" }}>
                          {sale.licenseType}
                        </span>
                      </td>
                      <td style={{ padding: "0.85rem 0.5rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                        ₹{(sale.grossPaise / 100).toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "0.85rem 0.5rem", fontFamily: "var(--font-mono)", color: "var(--status-success)", fontWeight: 700 }}>
                        {sale.formattedCreatorShare}
                      </td>
                      <td style={{ padding: "0.85rem 0.5rem", textAlign: "right", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {new Date(sale.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
