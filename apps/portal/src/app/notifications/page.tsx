"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";

type FilterType = "ALL" | "SECURITY" | "RELEASES";

const NOTIFICATIONS = [
  {
    id: "notif_1",
    type: "SECURITY" as const,
    title: "Security Advisory: Fastify Engine v1.2.1 Dependency Patch",
    desc: "An updated release addressing an upstream HTTP/2 header parsing vulnerability. Your download package has been refreshed with the patched build.",
    date: "Today, 11:20 AM",
    slug: "fastify-typescript-microservice-engine",
    unread: true,
  },
  {
    id: "notif_2",
    type: "RELEASES" as const,
    title: "Major Release: Next.js 15 SaaS Boilerplate v2.4.0 Live",
    desc: "Added parallel route dashboard layouts and Turbopack 16 support. Available for immediate signed download from your library.",
    date: "Yesterday",
    slug: "nextjs-15-saas-rocket-boilerplate",
    unread: true,
  },
  {
    id: "notif_3",
    type: "RELEASES" as const,
    title: "MCP Agent Hub v1.1.0 — LangChain v0.3 Compatible",
    desc: "Includes multi-agent streaming memory buffers and the full LangChain v0.3 compatibility matrix. Download the refreshed archive.",
    date: "3 days ago",
    slug: "autonomous-mcp-agent-hub",
    unread: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } as any },
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterType>("ALL");

  const filtered = NOTIFICATIONS.filter((n) => filter === "ALL" || n.type === filter);
  const secCount = NOTIFICATIONS.filter((n) => n.type === "SECURITY").length;
  const relCount = NOTIFICATIONS.filter((n) => n.type === "RELEASES").length;

  const TABS: { id: FilterType; label: string; count: number }[] = [
    { id: "ALL",      label: "All Alerts",         count: NOTIFICATIONS.length },
    { id: "SECURITY", label: "Security Patches",   count: secCount },
    { id: "RELEASES", label: "Version Releases",   count: relCount },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="page-eyebrow">Notification Center</div>
        <h1 className="page-title">
          Alerts &<br />
          <span style={{ color: "var(--accent-primary)" }}>Release Feed</span>
        </h1>
        <p className="page-subtitle">
          Critical security patch advisories, new version updates, and verified releases for your acquired library.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", flexWrap: "wrap" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn ${filter === tab.id ? "btn-primary btn-sm" : "btn-secondary btn-sm"}`}
            onClick={() => setFilter(tab.id)}
            aria-pressed={filter === tab.id}
          >
            {tab.label}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                marginLeft: "0.3rem",
                opacity: 0.8,
              }}
            >
              ({tab.count})
            </span>
          </button>
        ))}
      </motion.div>

      {/* Notifications List */}
      <motion.div
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={filter}
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.article
              key={item.id}
              className="section-card"
              variants={itemVariants}
              layout
              exit={{ opacity: 0, y: -8 }}
              style={{
                borderColor: item.type === "SECURITY" ? "rgba(239, 68, 68, 0.2)" : undefined,
                background: item.type === "SECURITY" ? "rgba(239, 68, 68, 0.02)" : undefined,
                marginBottom: 0,
              }}
            >
              <div className="section-card-body">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  {/* Icon */}
                  <div
                    className="notif-icon"
                    style={{
                      background: item.type === "SECURITY" ? "var(--danger-subtle)" : "var(--accent-light)",
                      color: item.type === "SECURITY" ? "var(--status-danger)" : "var(--accent-primary)",
                    }}
                    aria-hidden="true"
                  >
                    {item.type === "SECURITY"
                      ? <ShieldAlert size={18} />
                      : <Sparkles size={18} />
                    }
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.4rem" }}>
                      <h3
                        className={`notif-title${item.unread ? " notif-unread" : ""}`}
                        style={{ fontSize: "0.92rem" }}
                      >
                        {item.title}
                      </h3>
                      <span className="font-mono text-muted" style={{ fontSize: "0.65rem", flexShrink: 0 }}>
                        {item.date}
                      </span>
                    </div>

                    <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "0.85rem" }}>
                      {item.desc}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <a
                        href="/"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "var(--accent-cyan)",
                          textDecoration: "none",
                        }}
                      >
                        <span>Download in Library</span>
                        <ArrowRight size={13} aria-hidden="true" />
                      </a>
                      <span
                        className={`pill ${item.type === "SECURITY" ? "pill-danger" : "pill-purple"}`}
                      >
                        {item.type === "SECURITY" ? "Security" : "Release"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <Bell size={24} aria-hidden="true" />
            </div>
            <h2 className="empty-title">No Notifications</h2>
            <p className="empty-desc">
              No {filter.toLowerCase()} alerts for your library at this time.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
