"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Terminal,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  techStack: string[];
  pricePaise: number;
  originalPricePaise?: number;
  slug: string;
  ctaText: string;
}

const SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    badge: "FEATURED SAAS STARTER",
    title: "DockShip - Next.js 15 Enterprise SaaS Starter",
    description:
      "Production-ready Next.js 15 boilerplate with Stripe billing, multi-tenant auth, PostgreSQL, and Shadcn UI.",
    techStack: ["Next.js 15", "TypeScript", "Tailwind CSS", "Stripe", "Prisma"],
    pricePaise: 249900,
    originalPricePaise: 499900,
    slug: "dockship-nextjs-15-enterprise-saas-starter",
    ctaText: "View Codebase",
  },
  {
    id: "slide-2",
    badge: "HIGH-THROUGHPUT ENGINE",
    title: "RustAxum - Async Microservice Engine",
    description:
      "Ultra-fast async Rust microservice with JWT rotation, SQLx connection pooling, Redis caching, and Prometheus metrics.",
    techStack: ["Rust", "Axum", "SQLx", "PostgreSQL", "Redis", "Docker"],
    pricePaise: 199900,
    originalPricePaise: 349900,
    slug: "rustaxum-high-throughput-async-microservice-engine",
    ctaText: "Inspect Microservice",
  },
  {
    id: "slide-3",
    badge: "AI & MULTI-AGENT WORKFLOWS",
    title: "AgentFlow - Autonomous Multi-Agent RAG Pipeline",
    description:
      "Production AI workflow kit with LangChain, semantic memory, OpenAI/Claude tool routing, and streaming web UI.",
    techStack: ["Python", "LangChain", "FastAPI", "OpenAI", "ChromaDB"],
    pricePaise: 399900,
    originalPricePaise: 699900,
    slug: "agentflow-autonomous-multi-agent-rag-pipeline",
    ctaText: "Explore AI Kit",
  },
  {
    id: "slide-4",
    badge: "CROSS-PLATFORM MOBILE SUITE",
    title: "PulseKit - Flutter Production Mobile Suite",
    description:
      "40+ high-polish mobile screens with Riverpod state management, Supabase backend, and biometrics.",
    techStack: ["Flutter", "Dart", "Riverpod", "Supabase", "Firebase"],
    pricePaise: 149900,
    originalPricePaise: 299900,
    slug: "pulsekit-flutter-ios-android-production-suite",
    ctaText: "Get Mobile Suite",
  },
  {
    id: "slide-5",
    badge: "FREE OPEN SOURCE",
    title: "Veloce - Radix UI & Tailwind Modern Component Kit",
    description:
      "65+ copy-paste accessible React components with Framer Motion micro-interactions and dark mode tokens.",
    techStack: ["React", "Tailwind CSS", "Radix UI", "Framer Motion"],
    pricePaise: 0,
    originalPricePaise: 129900,
    slug: "veloce-radix-ui-tailwind-modern-component-kit",
    ctaText: "Claim Free Kit",
  },
];

const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 280, damping: 28 },
      opacity: { duration: 0.3, ease: "easeOut" },
    },
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? -50 : 50,
    opacity: 0,
    transition: {
      x: { type: "spring" as const, stiffness: 280, damping: 28 },
      opacity: { duration: 0.2, ease: "easeIn" },
    },
  }),
};

export default function HeroCarousel() {
  const [[currentIndex, direction], setSlideState] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  // Format paise integer to INR rupees
  const formatPrice = (paise: number) => {
    const rupees = Math.floor(paise / 100);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rupees);
  };

  const paginate = useCallback((newDirection: number) => {
    setSlideState(([prevIndex]) => {
      const nextIndex =
        (prevIndex + newDirection + SLIDES.length) % SLIDES.length;
      return [nextIndex, newDirection];
    });
  }, []);

  const jumpToSlide = (index: number) => {
    setSlideState(([prevIndex]) => {
      if (index === prevIndex) return [prevIndex, 0];
      const dir = index > prevIndex ? 1 : -1;
      return [index, dir];
    });
  };

  // Automatic slide every 4 seconds (4000ms)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      paginate(1);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, paginate]);

  const currentSlide = SLIDES[currentIndex];

  const discountPercent =
    currentSlide.originalPricePaise &&
    currentSlide.originalPricePaise > currentSlide.pricePaise
      ? Math.round(
          ((currentSlide.originalPricePaise - currentSlide.pricePaise) /
            currentSlide.originalPricePaise) *
            100
        )
      : 0;

  return (
    <div
      className="relative w-full rounded-xl bg-gradient-to-br from-[#27272A] via-[#27272A] to-[#1E1E22] border border-[#414146] hover:border-[#52525B] transition-all overflow-hidden select-none shadow-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Marketplace Featured Highlights"
    >
      {/* Background terminal watermark accent & subtle ambient glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 size-72 sm:size-96 bg-[#8535FC]/15 rounded-full blur-3xl" />
      <div className="absolute top-2 right-4 p-4 text-[#141417]/40 select-none pointer-events-none hidden md:block">
        <Terminal size={140} strokeWidth={1} />
      </div>

      {/* Main Slide Body: Generous on Desktop, Clean & Proportional on Mobile */}
      <div className="relative z-10 p-4 sm:p-7 md:p-8 flex flex-col justify-between gap-3 sm:gap-5">
        {/* Top Controls & Meta Bar */}
        <div className="flex items-center justify-between gap-2 h-7 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#141417] border border-[#414146] text-[10px] sm:text-xs font-mono text-[#8535FC] font-semibold tracking-wider">
            <Sparkles size={12} className="shrink-0" />
            <span className="truncate max-w-[170px] sm:max-w-none">{currentSlide.badge}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="font-mono text-[11px] sm:text-xs text-[#A1A1AA]">
              <span className="text-[#EDEDF0] font-semibold">
                0{currentIndex + 1}
              </span>{" "}
              / 0{SLIDES.length}
            </span>

            {/* Prev / Next controls */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => paginate(-1)}
                className="size-7 sm:size-8 rounded-lg bg-[#141417] border border-[#414146] hover:border-[#8535FC] text-[#A1A1AA] hover:text-[#EDEDF0] flex items-center justify-center transition-colors active:scale-95 focus:outline-none"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => paginate(1)}
                className="size-7 sm:size-8 rounded-lg bg-[#141417] border border-[#414146] hover:border-[#8535FC] text-[#A1A1AA] hover:text-[#EDEDF0] flex items-center justify-center transition-colors active:scale-95 focus:outline-none"
                aria-label="Next Slide"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Animated Slide Content Area: Expanded height for web, comfortable 2-line wrap on mobile */}
        <div className="relative h-[135px] sm:h-[150px] md:h-[160px] w-full overflow-hidden shrink-0">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex flex-col justify-between max-w-4xl"
            >
              <div>
                <Link
                  href={`/product/${currentSlide.slug}`}
                  className="group/title block"
                >
                  <h2 className="font-heading font-bold text-base sm:text-2xl md:text-3xl text-[#EDEDF0] group-hover/title:text-[#8535FC] transition-colors tracking-tight line-clamp-2 sm:line-clamp-1 leading-snug sm:leading-tight">
                    {currentSlide.title}
                  </h2>
                </Link>

                <p className="text-xs sm:text-sm md:text-base text-[#A1A1AA] line-clamp-2 leading-relaxed max-w-3xl mt-1.5 sm:mt-2">
                  {currentSlide.description}
                </p>
              </div>

              {/* Tech Stack Badges */}
              <div className="flex items-center gap-1.5 sm:gap-2 h-6 overflow-hidden mt-2">
                {currentSlide.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-[#141417] border border-[#414146] text-[10px] sm:text-xs font-mono text-[#A1A1AA] shrink-0"
                  >
                    {tech}
                  </span>
                ))}
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] sm:text-xs font-mono text-[#10B981] ml-1 shrink-0">
                  <ShieldCheck size={12} />
                  <span>AST Clean</span>
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Row: Price, Progress Indicators & Action CTA */}
        <div className="pt-3 sm:pt-4 border-t border-[#414146]/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-baseline gap-2 sm:gap-3 min-w-0">
            <span
              className={`font-heading font-bold text-base sm:text-2xl md:text-3xl truncate ${
                currentSlide.pricePaise === 0
                  ? "text-[#10B981]"
                  : "text-[#EDEDF0]"
              }`}
            >
              {currentSlide.pricePaise === 0
                ? "Free Open Source"
                : formatPrice(currentSlide.pricePaise)}
            </span>

            {currentSlide.originalPricePaise &&
              currentSlide.originalPricePaise > currentSlide.pricePaise && (
                <span className="text-xs sm:text-sm font-mono text-[#71717A] line-through hidden xs:inline">
                  {formatPrice(currentSlide.originalPricePaise)}
                </span>
              )}

            {discountPercent > 0 && (
              <span className="text-[10px] sm:text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 px-1.5 sm:px-2 py-0.5 rounded shrink-0">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Centered Progress Indicator Bars (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center justify-center gap-2">
            {SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => jumpToSlide(idx)}
                  aria-label={`Jump to slide ${idx + 1}`}
                  className={`relative h-1.5 rounded-full overflow-hidden transition-all duration-300 focus:outline-none ${
                    isActive
                      ? "w-10 sm:w-12 md:w-16 bg-[#414146]"
                      : "w-2.5 sm:w-3 bg-[#414146] hover:bg-[#52525B]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      key={`progress-${currentIndex}-${isPaused}`}
                      className="absolute inset-0 bg-[#8535FC] rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: isPaused ? undefined : "100%" }}
                      transition={{
                        duration: isPaused ? 0 : 4,
                        ease: "linear",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Dots Indicator */}
          <div className="flex sm:hidden items-center gap-1.5">
            {SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => jumpToSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`size-1.5 rounded-full transition-all ${
                    isActive
                      ? "bg-[#8535FC] w-4"
                      : "bg-[#414146]"
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center shrink-0">
            <Link
              href={`/product/${currentSlide.slug}`}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#8535FC] hover:bg-[#9B51E0] text-white text-xs sm:text-sm font-semibold transition-all group/btn active:scale-95 whitespace-nowrap shadow-md"
            >
              <span>{currentSlide.ctaText}</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover/btn:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
