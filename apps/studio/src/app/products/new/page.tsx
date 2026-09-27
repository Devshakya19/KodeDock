"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Boxes,
  Coins,
  Binary,
  FileText,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Lock,
  Globe,
  FolderGit2,
  CheckCircle2,
  DollarSign,
  Layers,
  Cpu,
  Tag,
  AlertCircle,
  Eye,
} from "lucide-react";

const SUGGESTED_STACKS = [
  "Next.js 16",
  "TypeScript",
  "PostgreSQL",
  "TailwindCSS",
  "Better Auth",
  "Docker",
  "Redis",
  "Go",
  "Drizzle ORM",
  "FastAPI",
];

const STEPS = [
  { num: 1, title: "Blueprint", subtitle: "Identity & Stacks", icon: Boxes },
  { num: 2, title: "Licensing", subtitle: "Pricing & 95% Split", icon: Coins },
  { num: 3, title: "Artifacts", subtitle: "R2 & SHA-256", icon: Binary },
  { num: 4, title: "Storefront", subtitle: "Documentation & Comp", icon: FileText },
];

export default function DeployArchitecturePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);

  // Form Fields
  // Step 1: Blueprint & Identity
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("SaaS Starters");
  const [techStackInput, setTechStackInput] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");

  // Step 2: Commercial Licensing
  const [standardPriceINR, setStandardPriceINR] = useState("");
  const [extendedPriceINR, setExtendedPriceINR] = useState("");

  // Step 3: Artifacts & Integrity
  const [version, setVersion] = useState("");
  const [storageKey, setStorageKey] = useState("");
  const [checksumSha256, setChecksumSha256] = useState("");
  const [changelog, setChangelog] = useState("");

  // Step 4: Storefront Spec
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  const handleAddSuggestedTag = (tag: string) => {
    const currentTags = techStackInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!currentTags.includes(tag)) {
      const updated = currentTags.length > 0 ? `${techStackInput.trim()}, ${tag}` : tag;
      setTechStackInput(updated);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = techStackInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const filtered = currentTags.filter((t) => t !== tagToRemove);
    setTechStackInput(filtered.join(", "));
  };

  const parsedTechTags = techStackInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!title.trim() || !tagline.trim()) {
        setErrorMessage("Please specify both the architecture title and elevator tagline.");
        return;
      }
    }
    if (currentStep === 2) {
      const stdPrice = parseInt(standardPriceINR, 10);
      if (isNaN(stdPrice) || stdPrice <= 0) {
        setErrorMessage("Please enter a valid standard commercial license price in INR.");
        return;
      }
    }
    if (currentStep === 3) {
      if (!version.trim() || !storageKey.trim() || !checksumSha256.trim()) {
        setErrorMessage("Please specify the version tag, R2 storage key, and SHA-256 integrity checksum.");
        return;
      }
      if (checksumSha256.trim().length !== 64) {
        setErrorMessage("SHA-256 checksum must be exactly 64 hexadecimal characters.");
        return;
      }
    }
    setErrorMessage(null);
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const standardPricePaise = parseInt(standardPriceINR, 10) * 100;
    const extendedPricePaise = extendedPriceINR ? parseInt(extendedPriceINR, 10) * 100 : null;

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      tagline: tagline.trim(),
      category: category.trim(),
      tech_stack: parsedTechTags,
      live_demo_url: liveDemoUrl.trim() || null,
      github_repo_url: githubRepoUrl.trim() || null,
      standard_price: standardPricePaise,
      extended_price: extendedPricePaise,
      version: version.trim() || "v1.0.0",
      storage_key: storageKey.trim(),
      checksum_sha256: checksumSha256.trim(),
      changelog: changelog.trim(),
      thumbnail_url: thumbnailUrl.trim() || "/kd.svg",
      description: description.trim(),
    };

    try {
      const res = await fetch("/api/studio/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        router.push("/products");
      } else {
        setErrorMessage(json.error?.message || "Failed to deploy architecture package.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error while publishing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stdPriceNum = parseInt(standardPriceINR || "0", 10);
  const extPriceNum = parseInt(extendedPriceINR || "0", 10);

  return (
    <div className="page-container" style={{ maxWidth: "1040px", margin: "0 auto", paddingBottom: "6rem" }}>
      {/* ── Top Navigation & Eyebrow ───────────────────────────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <Link
          href="/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: "0.85rem",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft size={13} />
          <span>Back to Architecture Catalog</span>
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="page-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <UploadCloud size={13} color="var(--accent-cyan)" />
              <span>DEPLOYMENT PIPELINE // SPEC v2.4</span>
            </div>
            <h1 className="page-title" style={{ fontSize: "2.35rem", letterSpacing: "-0.03em" }}>
              Deploy <span style={{ color: "var(--accent-primary)" }}>Architecture</span>
            </h1>
            <p className="page-subtitle" style={{ fontSize: "0.92rem", maxWidth: "680px" }}>
              List your production-ready software architecture with automated Ed25519 licensing, Cloudflare R2 private archives, and 95% creator payouts.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--status-success)", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "0.35rem 0.75rem", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <ShieldCheck size={13} />
              <span>ZERO-LEAK HMAC ENFORCED</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Segmented Stepper Navigation ──────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.5rem",
          background: "rgba(18, 19, 26, 0.7)",
          padding: "0.5rem",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          marginBottom: "2rem",
        }}
      >
        {STEPS.map((s) => {
          const isDone = currentStep > s.num;
          const isCurrent = currentStep === s.num;
          const Icon = s.icon;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (isDone) setCurrentStep(s.num);
              }}
              style={{
                background: isCurrent ? "rgba(139, 92, 246, 0.16)" : "transparent",
                border: isCurrent ? "1px solid rgba(139, 92, 246, 0.45)" : isDone ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid transparent",
                borderRadius: "12px",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                textAlign: "left",
                cursor: isDone ? "pointer" : "default",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                outline: "none",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  background: isDone ? "var(--status-success)" : isCurrent ? "var(--accent-primary)" : "rgba(255, 255, 255, 0.06)",
                  color: isCurrent || isDone ? "#ffffff" : "var(--text-muted)",
                  boxShadow: isCurrent ? "0 0 10px rgba(139, 92, 246, 0.5)" : "none",
                }}
              >
                {isDone ? <Check size={14} strokeWidth={2.4} /> : s.num}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: isCurrent ? "#ffffff" : isDone ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {s.title}
                  </span>
                </div>
                <div style={{ fontSize: "0.68rem", color: isCurrent ? "var(--accent-cyan)" : "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main Hardware Chassis ─────────────────────────────────────────── */}
      <div className="double-bezel-chassis" style={{ marginBottom: "2rem" }}>
        <div className="double-bezel-core" style={{ padding: "2.25rem 2.5rem" }}>
          {errorMessage && (
            <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "var(--status-danger)", padding: "0.85rem 1rem", borderRadius: "10px", fontSize: "0.82rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ── STEP 1: Blueprint & Identity ─────────────────────────────── */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.75rem", paddingBottom: "1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.07)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(139, 92, 246, 0.12)", border: "1px solid rgba(139, 92, 246, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                  <Boxes size={22} strokeWidth={1.8} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>
                    1. Blueprint &amp; Software Identity
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    Configure the architectural name, marketplace classification, tech stack chips, and showcase URLs.
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="form-group-custom">
                <label className="form-label-custom">
                  <span>Architecture Title</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {title.length}/100
                  </span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Next.js 16 Enterprise Microservices Starter"
                  className="form-input-custom"
                  style={{ fontSize: "0.95rem" }}
                />
              </div>

              {/* Slug */}
              <div className="form-group-custom">
                <label className="form-label-custom">
                  <span>Marketplace Permlink (Auto-Generated)</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                    PUBLIC STORE URL
                  </span>
                </label>
                <div style={{ display: "flex", alignItems: "center", background: "rgba(13, 14, 21, 0.95)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "10px", overflow: "hidden" }}>
                  <span style={{ padding: "0.75rem 0.85rem", background: "rgba(255, 255, 255, 0.04)", borderRight: "1px solid rgba(255, 255, 255, 0.08)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                    kodedock.com/product/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="architecture-slug"
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "var(--accent-cyan)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
              </div>

              {/* Tagline */}
              <div className="form-group-custom">
                <label className="form-label-custom">
                  <span>Elevator Tagline</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    Displayed on storefront listing card
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Production microservice mesh with PostgreSQL pooling, Better Auth sessions, and Redis caching."
                  className="form-input-custom"
                />
              </div>

              {/* Category & Tech Stack */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
                <div className="form-group-custom">
                  <label className="form-label-custom">Marketplace Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input-custom"
                  >
                    <option value="SaaS Starters">SaaS Starters</option>
                    <option value="Microservices">Microservices</option>
                    <option value="AI & Agents">AI &amp; Agents</option>
                    <option value="API Engines">API Engines</option>
                    <option value="DevTools">DevTools</option>
                    <option value="Fullstack Apps">Fullstack Apps</option>
                  </select>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Tech Stack Tags (Comma-Separated)</label>
                  <input
                    type="text"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    placeholder="Next.js 16, TypeScript, PostgreSQL, Redis"
                    className="form-input-custom"
                  />
                </div>
              </div>

              {/* Active Tag Chips & Suggestions */}
              <div style={{ marginBottom: "1.5rem" }}>
                {parsedTechTags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
                    {parsedTechTags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          padding: "0.25rem 0.6rem",
                          background: "rgba(139, 92, 246, 0.15)",
                          border: "1px solid rgba(139, 92, 246, 0.35)",
                          borderRadius: "6px",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                          color: "#ffffff",
                        }}
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            fontSize: "0.8rem",
                            lineHeight: 1,
                          }}
                          title="Remove tag"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginRight: "0.25rem" }}>
                    Quick Add:
                  </span>
                  {SUGGESTED_STACKS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddSuggestedTag(tag)}
                      className="suggested-tag-btn"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Demo & Repo URLs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
                <div className="form-group-custom">
                  <label className="form-label-custom">Interactive Live Demo URL (Optional)</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="url"
                      value={liveDemoUrl}
                      onChange={(e) => setLiveDemoUrl(e.target.value)}
                      placeholder="https://demo.myproject.com"
                      className="form-input-custom"
                      style={{ paddingLeft: "2.3rem" }}
                    />
                    <Globe size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">GitHub Code Preview Repository (Optional)</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="url"
                      value={githubRepoUrl}
                      onChange={(e) => setGithubRepoUrl(e.target.value)}
                      placeholder="https://github.com/myteam/demo-repo"
                      className="form-input-custom"
                      style={{ paddingLeft: "2.3rem" }}
                    />
                    <FolderGit2 size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Commercial Licensing ──────────────────────────── */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.75rem", paddingBottom: "1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.07)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
                  <Coins size={22} strokeWidth={1.8} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>
                    2. Commercial Licensing &amp; Split
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    Set dual commercial pricing tiers in Indian Rupees. You automatically receive 95% of every sale with instant ledger auditing.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.75rem" }}>
                {/* Standard Commercial */}
                <div style={{ background: "rgba(18, 19, 26, 0.8)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "14px", padding: "1.5rem", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
                    <span style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)", color: "var(--accent-primary)", textTransform: "uppercase", fontWeight: 700 }}>
                      Standard Commercial License
                    </span>
                    <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.55rem", borderRadius: "4px", background: "rgba(139, 92, 246, 0.2)", color: "var(--accent-primary)", fontWeight: 700 }}>
                      1 PRODUCTION SEAT
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.4 }}>
                    Permits single client or internal commercial deployment. Source code is licensed for one production project.
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", color: "var(--accent-cyan)", fontWeight: 700 }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      value={standardPriceINR}
                      onChange={(e) => setStandardPriceINR(e.target.value)}
                      placeholder="e.g. 1499"
                      className="form-input-custom"
                      style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem", fontWeight: 700 }}
                    />
                  </div>

                  <div style={{ fontSize: "0.78rem", color: stdPriceNum > 0 ? "var(--status-success)" : "var(--text-muted)", marginTop: "0.65rem", fontWeight: 600 }}>
                    {stdPriceNum > 0
                      ? `Your 95% creator payout: ₹${((stdPriceNum * 95) / 100).toLocaleString("en-IN")}`
                      : "Enter price to calculate 95% creator payout"}
                  </div>
                </div>

                {/* Extended SaaS License */}
                <div style={{ background: "rgba(18, 19, 26, 0.8)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "14px", padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
                    <span style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", textTransform: "uppercase", fontWeight: 700 }}>
                      Extended SaaS License (Optional)
                    </span>
                    <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.55rem", borderRadius: "4px", background: "rgba(56, 189, 248, 0.15)", color: "var(--accent-cyan)", fontWeight: 700 }}>
                      UNLIMITED SAAS RESALE
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.4 }}>
                    Permits unlimited commercial client distributions or white-label SaaS usage. Ideal for enterprise developers.
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", color: "var(--accent-cyan)", fontWeight: 700 }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      value={extendedPriceINR}
                      onChange={(e) => setExtendedPriceINR(e.target.value)}
                      placeholder="e.g. 4999 (Optional)"
                      className="form-input-custom"
                      style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem", fontWeight: 700 }}
                    />
                  </div>

                  <div style={{ fontSize: "0.78rem", color: extPriceNum > 0 ? "var(--status-success)" : "var(--text-muted)", marginTop: "0.65rem", fontWeight: 600 }}>
                    {extPriceNum > 0
                      ? `Your 95% creator payout: ₹${((extPriceNum * 95) / 100).toLocaleString("en-IN")}`
                      : "Optional multi-client license tier"}
                  </div>
                </div>
              </div>

              {/* 95/5 Split Bar Indicator */}
              <div style={{ background: "rgba(13, 14, 21, 0.9)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
                  <span style={{ color: "var(--status-success)", fontWeight: 700 }}>CREATOR NET SPLIT (95%)</span>
                  <span style={{ color: "var(--text-muted)" }}>PLATFORM PROTOCOL (5%)</span>
                </div>
                <div style={{ height: "8px", width: "100%", background: "rgba(255, 255, 255, 0.08)", borderRadius: "4px", overflow: "hidden", display: "flex" }}>
                  <div style={{ width: "95%", background: "linear-gradient(90deg, #10B981, #059669)", height: "100%" }} />
                  <div style={{ width: "5%", background: "rgba(255, 255, 255, 0.25)", height: "100%" }} />
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.65rem" }}>
                  All amounts are strictly persisted as integers in paise (INR) with zero float truncation and automated ledger parity.
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Artifacts & Checksum ──────────────────────────── */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.75rem", paddingBottom: "1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.07)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--status-success)" }}>
                  <Binary size={22} strokeWidth={1.8} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>
                    3. Artifacts &amp; Cryptographic Integrity
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    Connect your private Cloudflare R2 / S3 storage key and SHA-256 integrity hash for buyer signature verification.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
                <div className="form-group-custom">
                  <label className="form-label-custom">Initial SemVer Release Tag</label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g. v1.0.0"
                    className="form-input-custom"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">R2 Private Storage Key</label>
                  <input
                    type="text"
                    required
                    value={storageKey}
                    onChange={(e) => setStorageKey(e.target.value)}
                    placeholder="releases/architecture-name-v1.0.0.zip"
                    className="form-input-custom"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">
                  <span>SHA-256 Anti-Tamper Checksum</span>
                  <span style={{ fontSize: "0.7rem", color: checksumSha256.length === 64 ? "var(--status-success)" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {checksumSha256.length}/64 HEX CHARACTERS
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={checksumSha256}
                  onChange={(e) => setChecksumSha256(e.target.value.toLowerCase().trim())}
                  placeholder="e.g. b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
                  className="form-input-custom"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}
                />
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "0.35rem" }}>
                  Generate in terminal: <code style={{ color: "var(--accent-cyan)", background: "rgba(56, 189, 248, 0.1)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>sha256sum codebase.zip</code>
                </div>
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">Release Changelog &amp; Architecture Highlights</label>
                <textarea
                  rows={3}
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="Initial release features, architecture stack, dependency versions..."
                  className="form-input-custom"
                  style={{ resize: "vertical" }}
                />
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Storefront Spec & Preview ─────────────────────── */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.75rem", paddingBottom: "1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.07)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(139, 92, 246, 0.12)", border: "1px solid rgba(139, 92, 246, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                  <FileText size={22} strokeWidth={1.8} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>
                    4. Storefront Specification &amp; Docs
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    Add 16:9 thumbnail preview URL and technical README architecture documentation.
                  </p>
                </div>
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">
                  <span>Thumbnail Media URL (16:9 Aspect Ratio)</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    Leave blank to use default KodeDock SVG
                  </span>
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://cdn.yoursite.com/preview.png or leave blank"
                  className="form-input-custom"
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">
                  <span>Technical README &amp; Setup Docs (Markdown)</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>
                    MARKDOWN SUPPORTED
                  </span>
                </label>
                <textarea
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="# Architecture Overview&#10;&#10;### Tech Stack & Services&#10;- Backend: PostgreSQL 16 with connection pooling&#10;- Auth: Better Auth cryptographic sessions&#10;&#10;### Getting Started&#10;Clone the codebase and copy .env.example..."
                  className="form-input-custom"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "1rem 1.25rem", borderRadius: "12px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                <ShieldCheck size={22} color="var(--status-success)" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#ffffff" }}>Zero-Leak Security Protocol:</strong> Archives are never publicly exposed. Verified buyers receive 60-second HMAC-signed download tokens upon cryptographic settlement.
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Stepper Navigation Buttons ────────────────────────────── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2.25rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn btn-secondary"
                style={{ padding: "0.6rem 1.25rem", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="btn btn-primary"
                style={{ padding: "0.6rem 1.45rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="island-cta-btn"
                style={{ padding: "0.55rem 0.75rem 0.55rem 1.35rem", fontSize: "0.9rem" }}
              >
                {isSubmitting ? (
                  <span>Deploying Architecture...</span>
                ) : (
                  <>
                    <span>Deploy Architecture to Storefront</span>
                    <div className="island-icon-pod">
                      <UploadCloud size={14} strokeWidth={2} />
                    </div>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Live Marketplace Storefront Comp Preview ───────────────────────── */}
      <div style={{ background: "rgba(18, 19, 26, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "1.75rem", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--status-success)" }} />
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Live Storefront Card Telemetry
            </span>
          </div>
          <span style={{ fontSize: "0.72rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
            REAL-TIME PREVIEW
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", alignItems: "center" }}>
          {/* Card Preview Component */}
          <div
            style={{
              background: "#0d0e15",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.6)",
              maxWidth: "420px",
            }}
          >
            {/* Thumbnail */}
            <div style={{ width: "100%", height: "160px", background: "linear-gradient(135deg, #13141f 0%, #1f1b2e 50%, #0d0e15 100%)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Architecture Thumbnail Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    (e.currentTarget as any).style.display = "none";
                  }}
                />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <Boxes size={32} color="var(--accent-primary)" style={{ margin: "0 auto 0.35rem", opacity: 0.8 }} />
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Architecture Preview
                  </div>
                </div>
              )}

              <div style={{ position: "absolute", top: "0.65rem", left: "0.65rem", display: "flex", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.62rem", fontFamily: "var(--font-mono)", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "4px", background: "rgba(9, 10, 15, 0.85)", backdropFilter: "blur(6px)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#ffffff" }}>
                  {category.toUpperCase()}
                </span>
                <span style={{ fontSize: "0.62rem", fontFamily: "var(--font-mono)", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "4px", background: "rgba(139, 92, 246, 0.2)", border: "1px solid rgba(139, 92, 246, 0.4)", color: "var(--accent-primary)" }}>
                  {version || "v1.0.0"}
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div style={{ padding: "1.25rem" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.35rem" }}>
                {title || "Untitled Architecture"}
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.85rem", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {tagline || "Elevator tagline will appear here for marketplace buyers..."}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}>
                {parsedTechTags.length > 0 ? (
                  parsedTechTags.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontSize: "0.65rem",
                        fontFamily: "var(--font-mono)",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    No stack tags
                  </span>
                )}
                {parsedTechTags.length > 4 && (
                  <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
                    +{parsedTechTags.length - 4} more
                  </span>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                    Standard Price
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", fontWeight: 800, color: "var(--accent-cyan)" }}>
                    {stdPriceNum > 0 ? `₹${stdPriceNum.toLocaleString("en-IN")}` : "₹--"}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.65rem", color: "var(--status-success)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    95% CREATOR SHARE
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", fontWeight: 700, color: "var(--status-success)" }}>
                    {stdPriceNum > 0 ? `₹${((stdPriceNum * 95) / 100).toLocaleString("en-IN")}` : "₹0"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Spec */}
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.65rem", fontFamily: "var(--font-mono)" }}>
              DEPLOYMENT READINESS AUDIT
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.8rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: title && tagline ? "var(--status-success)" : "var(--text-muted)" }}>
                {title && tagline ? <CheckCircle2 size={15} /> : <div style={{ width: "15px", height: "15px", borderRadius: "50%", border: "1px solid var(--border-subtle)" }} />}
                <span>Architecture Blueprint (Title &amp; Elevator Pitch)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: stdPriceNum > 0 ? "var(--status-success)" : "var(--text-muted)" }}>
                {stdPriceNum > 0 ? <CheckCircle2 size={15} /> : <div style={{ width: "15px", height: "15px", borderRadius: "50%", border: "1px solid var(--border-subtle)" }} />}
                <span>Commercial Pricing &amp; 95% Creator Split</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: version && storageKey ? "var(--status-success)" : "var(--text-muted)" }}>
                {version && storageKey ? <CheckCircle2 size={15} /> : <div style={{ width: "15px", height: "15px", borderRadius: "50%", border: "1px solid var(--border-subtle)" }} />}
                <span>Cloudflare R2 Storage Artifact Key</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: checksumSha256.length === 64 ? "var(--status-success)" : "var(--text-muted)" }}>
                {checksumSha256.length === 64 ? <CheckCircle2 size={15} /> : <div style={{ width: "15px", height: "15px", borderRadius: "50%", border: "1px solid var(--border-subtle)" }} />}
                <span>64-Character SHA-256 Checksum Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
