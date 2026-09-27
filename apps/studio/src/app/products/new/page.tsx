"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  Package,
  Layers,
  DollarSign,
  FileCode,
  Image as ImageIcon,
  Terminal,
  ExternalLink,
} from "lucide-react";

export default function PublishProductWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  // Step 1: Identity
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("SaaS Starters");
  const [techStackInput, setTechStackInput] = useState("Next.js 16, TypeScript, PostgreSQL, TailwindCSS");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");

  // Step 2: Pricing
  const [standardPriceINR, setStandardPriceINR] = useState("1499");
  const [extendedPriceINR, setExtendedPriceINR] = useState("4999");

  // Step 3: Codebase Archive & Versioning
  const [version, setVersion] = useState("v1.0.0");
  const [storageKey, setStorageKey] = useState("releases/nextjs-saas-starter-v1.0.0.zip");
  const [checksumSha256, setChecksumSha256] = useState("b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
  const [changelog, setChangelog] = useState("Initial production release with PostgreSQL 16 connection pooling, Better Auth authentication, and Tailwind CSS design tokens.");

  // Step 4: Media & Description
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState(
    "# Overview\n\nProduction-ready full-stack software boilerplate built for senior software engineers.\n\n### Core Architecture\n- **Backend**: PostgreSQL 16 with Drizzle ORM\n- **Auth**: Better Auth with OAuth & cryptographic sessions\n- **Frontend**: Next.js 16 with Turbopack and React 19"
  );

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

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!title.trim() || !tagline.trim()) {
        setErrorMessage("Please fill in both the title and tagline.");
        return;
      }
    }
    if (currentStep === 2) {
      const stdPrice = parseInt(standardPriceINR, 10);
      if (isNaN(stdPrice) || stdPrice <= 0) {
        setErrorMessage("Please enter a valid standard commercial price.");
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

    const techStackArray = techStackInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const standardPricePaise = parseInt(standardPriceINR, 10) * 100;
    const extendedPricePaise = extendedPriceINR ? parseInt(extendedPriceINR, 10) * 100 : null;

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      tagline: tagline.trim(),
      category: category.trim(),
      tech_stack: techStackArray,
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
        setErrorMessage(json.error?.message || "Failed to publish boilerplate package.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error while publishing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const STEPS = [
    { num: 1, title: "Identity & Architecture", icon: Package },
    { num: 2, title: "Commercial Pricing", icon: DollarSign },
    { num: 3, title: "Codebase & Integrity", icon: FileCode },
    { num: 4, title: "Docs & Preview", icon: ImageIcon },
  ];

  return (
    <div className="page-container" style={{ maxWidth: "980px" }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "0.75rem" }}>
          <ArrowLeft size={13} />
          <span>Back to My Boilerplates</span>
        </Link>
        <div className="page-eyebrow">
          <Sparkles size={12} color="var(--accent-primary)" />
          <span>Architect Publishing Wizard</span>
        </div>
        <h1 className="page-title">
          Publish New <span style={{ color: "var(--accent-primary)" }}>Boilerplate</span>
        </h1>
        <p className="page-subtitle">
          List your production template on KodeDock with cryptographic licensing and automated 95% payouts.
        </p>
      </div>

      {/* ── Progress Stepper Bar ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "2.5rem" }}>
        {STEPS.map((s) => {
          const isDone = currentStep > s.num;
          const isCurrent = currentStep === s.num;
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              style={{
                background: isCurrent ? "rgba(139, 92, 246, 0.12)" : "var(--bg-surface)",
                border: `1px solid ${isCurrent ? "var(--accent-primary)" : isDone ? "var(--status-success)" : "var(--border-subtle)"}`,
                borderRadius: "var(--radius-md)",
                padding: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: isDone ? "var(--status-success)" : isCurrent ? "var(--accent-primary)" : "var(--bg-surface-elevated)",
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isDone ? <Check size={14} /> : s.num}
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                  Step {s.num}
                </div>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: isCurrent ? "#ffffff" : "var(--text-secondary)" }}>
                  {s.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Wizard Form Container ─────────────────────────────────────────── */}
      <div className="portal-card" style={{ padding: "2.5rem 2rem" }}>
        {errorMessage && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "var(--status-danger)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
            {errorMessage}
          </div>
        )}

        {/* ── Step 1: Identity & Architecture ─────────────────────────────── */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.25rem" }}>
              1. Identity &amp; Architecture
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Define the software title, target category, and tech stack tags.
            </p>

            <div className="form-group-custom">
              <label className="form-label-custom">Package Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Next.js 16 Full-Stack Enterprise SaaS Starter"
                className="form-input-custom"
              />
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">URL Slug (Auto-generated)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. nextjs-16-enterprise-saas-starter"
                className="form-input-custom"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}
              />
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Tagline (Elevator Pitch)</label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Production Next.js 16 SaaS template with PostgreSQL pooling, Better Auth, and Stripe billing."
                className="form-input-custom"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group-custom">
                <label className="form-label-custom">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input-custom"
                  style={{ cursor: "pointer" }}
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
                <label className="form-label-custom">Tech Stack Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="e.g. Next.js 16, PostgreSQL, Docker, Redis"
                  className="form-input-custom"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group-custom">
                <label className="form-label-custom">Live Demo URL (Optional)</label>
                <input
                  type="url"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                  placeholder="https://demo.myproject.com"
                  className="form-input-custom"
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">GitHub Public Showcase (Optional)</label>
                <input
                  type="url"
                  value={githubRepoUrl}
                  onChange={(e) => setGithubRepoUrl(e.target.value)}
                  placeholder="https://github.com/myteam/demo-repo"
                  className="form-input-custom"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Commercial Pricing Engine ───────────────────────────── */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.25rem" }}>
              2. Commercial Pricing Engine
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Set prices in Indian Rupees (INR). Under KodeDock's financial law, amounts are strictly persisted as integer paise with an automatic 95% creator split.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
                <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--accent-primary)", textTransform: "uppercase", marginBottom: "0.35rem" }}>
                  Standard Commercial License
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  Permits deployment for 1 client or internal production application.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem", color: "var(--accent-cyan)", fontWeight: 700 }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    value={standardPriceINR}
                    onChange={(e) => setStandardPriceINR(e.target.value)}
                    placeholder="1499"
                    className="form-input-custom"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", fontWeight: 700 }}
                  />
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--status-success)", marginTop: "0.5rem" }}>
                  Your 95% earnings: ₹{((parseInt(standardPriceINR || "0", 10) * 95) / 100).toLocaleString("en-IN")}
                </div>
              </div>

              <div style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
                <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", textTransform: "uppercase", marginBottom: "0.35rem" }}>
                  Extended SaaS License (Optional)
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  Permits unlimited client distributions or commercial white-label SaaS usage.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem", color: "var(--accent-cyan)", fontWeight: 700 }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    value={extendedPriceINR}
                    onChange={(e) => setExtendedPriceINR(e.target.value)}
                    placeholder="4999"
                    className="form-input-custom"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", fontWeight: 700 }}
                  />
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--status-success)", marginTop: "0.5rem" }}>
                  Your 95% earnings: ₹{((parseInt(extendedPriceINR || "0", 10) * 95) / 100).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Codebase & Integrity Verification ───────────────────── */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.25rem" }}>
              3. Codebase Archive &amp; Integrity Verification
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Connect your private Cloudflare R2 / S3 storage archive. Provide the SHA-256 integrity hash for buyer signature verification.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
              <div className="form-group-custom">
                <label className="form-label-custom">Initial Release Version</label>
                <input
                  type="text"
                  required
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0.0"
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
                  placeholder="releases/nextjs-saas-starter-v1.0.0.zip"
                  className="form-input-custom"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
              </div>
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">SHA-256 Checksum (Cryptographic Anti-Tamper)</label>
              <input
                type="text"
                required
                value={checksumSha256}
                onChange={(e) => setChecksumSha256(e.target.value)}
                placeholder="64-character hex checksum (sha256sum codebase.zip)"
                className="form-input-custom"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}
              />
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Initial Release Changelog</label>
              <textarea
                rows={3}
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="What is included in this release version?"
                className="form-input-custom"
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
        )}

        {/* ── Step 4: Documentation & Media Preview ───────────────────────── */}
        {currentStep === 4 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.25rem" }}>
              4. Documentation &amp; Media Preview
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Add a 16:9 thumbnail image preview and technical architecture documentation in markdown.
            </p>

            <div className="form-group-custom">
              <label className="form-label-custom">Thumbnail URL (16:9 Aspect Ratio)</label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://cdn.mysite.com/preview.png or leave blank for default"
                className="form-input-custom"
              />
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Technical README &amp; Documentation (Markdown)</label>
              <textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="# Software Architecture README..."
                className="form-input-custom"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", resize: "vertical" }}
              />
            </div>

            {/* Zero-Leak Guarantee Callout */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "1rem", borderRadius: "var(--radius-md)", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              <ShieldCheck size={20} color="var(--status-success)" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: "#ffffff" }}>Zero-Leak Security Protocol:</strong> Source code archives are never exposed to public internet endpoints. Buyers only receive 60-second HMAC-signed URLs upon verified cryptographic payment.
              </div>
            </div>
          </div>
        )}

        {/* ── Wizard Controls (Back / Next / Publish) ──────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="btn btn-secondary"
              style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}
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
              style={{ padding: "0.6rem 1.35rem", fontSize: "0.85rem" }}
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{ padding: "0.65rem 1.5rem", fontSize: "0.9rem" }}
            >
              {isSubmitting ? (
                <span>Publishing to Store...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Publish to Marketplace</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
