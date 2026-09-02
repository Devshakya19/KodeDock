"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Loader2,
  Check,
  LockKeyhole,
  Zap,
  Users,
  Code2,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { auth } from "@/shared/lib/auth/client";
import { GithubIcon } from "@/shared/components/icons/github";
import {
  GoogleIcon,
  DiscordIcon,
  KodeDockLogoMark,
} from "@/shared/components/icons/social-auth";

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export default function DeveloperRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [techStack, setTechStack] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service & Developer Policies");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const user = await auth.signUp({
        email,
        password,
        fullName,
        role: "developer",
      });

      if (githubUsername || techStack) {
        const { apiPut } = await import("@/shared/lib/api/client");
        await apiPut("/profile", {
          id: user.user.id,
          full_name: fullName,
          github_username: githubUsername || "",
          bio: techStack ? `Tech Stack: ${techStack}` : "",
        });
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Developer registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGithubLogin() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/config", { cache: "no-store" });
      const data = await res.json();
      const clientId = data.github_client_id;

      if (!clientId || clientId === "your_github_client_id") {
        setError("GitHub login is not configured");
        setLoading(false);
        return;
      }
      const state = btoa("developer|/seller");
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${window.location.origin}/api/auth/callback&state=${state}`;
    } catch (e) {
      setError("Failed to connect to authentication server.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[620px] bg-[#0b0c10]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[28px] p-8 sm:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.8)] text-white text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6d28d9] to-[#8b5cf6] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#6d28d9]/30">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Seller Account Created!
        </h1>
        <p className="text-sm text-[#9496ac] mt-3 leading-relaxed max-w-md mx-auto">
          Your developer storefront is ready. Start publishing your boilerplates, templates, and full-stack modules to earn 97.5% royalty.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-8 w-full h-12 rounded-xl bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] hover:brightness-110 text-white font-semibold text-sm shadow-[0_8px_24px_rgba(109,40,217,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[640px] bg-[#0b0c10]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[28px] p-6 sm:p-10 md:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.8)] text-white relative overflow-hidden"
    >
      {/* Top Header: Logo + Secure Badge */}
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <Link href="/" className="flex items-center gap-3 group">
          <KodeDockLogoMark size={38} className="transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-none">
              Kode<span className="text-white">Dock</span>
            </span>
            <span className="text-[10px] tracking-[0.25em] text-[#8e8fa3] uppercase font-semibold mt-1">
              Seller Portal
            </span>
          </div>
        </Link>

        {/* 256-bit SSL Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-[#a0a1b8]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6366f1]" />
          <span>97.5% Payout Rate</span>
        </div>
      </div>

      {/* Main Headings */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-xs font-semibold text-[#a78bfa] mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Developer Program
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Become a Seller, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#a855f7]">
            Monetize Code.
          </span>
        </h1>
        <p className="text-[#9496ac] text-[13.5px] sm:text-sm mt-2 leading-relaxed">
          Sell your boilerplates, full-stack templates, and APIs with automated license generation and instant payouts.
        </p>
      </div>

      {/* GitHub Quick Connect */}
      <div className="mb-7">
        <button
          type="button"
          onClick={handleGithubLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-[13px] font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <GithubIcon size={18} />
          <span>Quick Apply with GitHub</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-7">
        <div className="w-full border-t border-white/[0.07]" />
        <span className="absolute bg-[#0b0c10] px-4 text-xs font-medium text-[#7c7d96]">
          or fill standard registration
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400 text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-4">
        {/* Name & Email grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-[#cfd0df] mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666880]" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#7c3aed] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-sm text-white placeholder:text-[#55566c] transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-[#cfd0df] mb-2">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666880]" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#7c3aed] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-sm text-white placeholder:text-[#55566c] transition-all"
              />
            </div>
          </div>
        </div>

        {/* GitHub Username & Tech Stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="githubUsername" className="block text-xs font-semibold text-[#cfd0df] mb-2">
              GitHub Profile / Username
            </label>
            <div className="relative">
              <GithubIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666880]" />
              <input
                id="githubUsername"
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="github_username"
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#7c3aed] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-sm text-white placeholder:text-[#55566c] transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="techStack" className="block text-xs font-semibold text-[#cfd0df] mb-2">
              Primary Tech Stack
            </label>
            <div className="relative">
              <Code2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666880]" />
              <input
                id="techStack"
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="e.g. Next.js, Rust, Go"
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#7c3aed] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-sm text-white placeholder:text-[#55566c] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-[#cfd0df] mb-2">
            Account Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666880]" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              className="w-full h-12 pl-10 pr-11 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#7c3aed] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-sm text-white placeholder:text-[#55566c] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666880] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {password.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {PASSWORD_REQUIREMENTS.map((req, i) => {
                const met = req.test(password);
                return (
                  <div key={i} className="flex items-center text-[11px]">
                    <div
                      className={`w-3.5 h-3.5 rounded-full mr-1.5 flex items-center justify-center ${
                        met ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"
                      }`}
                    >
                      {met ? <Check className="w-2.5 h-2.5" /> : null}
                    </div>
                    <span className={met ? "text-[#e2e8f0] font-medium" : "text-[#717388]"}>
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="pt-2 pb-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-[#a0a1b8] select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/[0.04] text-[#6d28d9] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#7c3aed]"
            />
            <span>
              I accept KodeDock Developer Terms & Merchant Policy.
            </span>
          </label>
        </div>

        {/* Register CTA Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] hover:brightness-110 active:scale-[0.99] text-white font-semibold text-sm shadow-[0_8px_24px_rgba(109,40,217,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Launch Developer Account <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign In & Standard Register */}
      <div className="flex flex-col gap-2 text-center mt-6 mb-8 text-xs sm:text-[13px] text-[#9496ac]">
        <div>
          Already have a seller account?{" "}
          <Link
            href="/login"
            className="font-bold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors underline underline-offset-4 decoration-[#a78bfa]/40 hover:decoration-[#a78bfa]"
          >
            Sign in
          </Link>
        </div>
        <div className="text-[12px] text-[#717388]">
          Just browsing code?{" "}
          <Link href="/register" className="text-white hover:text-[#a78bfa] transition-colors underline underline-offset-2">
            Create standard buyer account
          </Link>
        </div>
      </div>

      {/* 4 Feature Value Pillars Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/[0.08]">
        <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/[0.01]">
          <div className="text-[#8b5cf6] mb-1.5 font-mono text-sm font-bold flex items-center justify-center h-5">
            &lt;/&gt;
          </div>
          <span className="text-[11px] font-bold text-white mb-0.5">Developer First</span>
          <span className="text-[10px] text-[#717388] leading-tight">Built by developers, for developers.</span>
        </div>

        <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/[0.01]">
          <div className="text-[#8b5cf6] mb-1.5 flex items-center justify-center h-5">
            <LockKeyhole className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-white mb-0.5">Secure & Reliable</span>
          <span className="text-[10px] text-[#717388] leading-tight">Enterprise-grade security for your data.</span>
        </div>

        <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/[0.01]">
          <div className="text-[#8b5cf6] mb-1.5 flex items-center justify-center h-5">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-white mb-0.5">Instant Access</span>
          <span className="text-[10px] text-[#717388] leading-tight">Access your products and tools instantly.</span>
        </div>

        <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/[0.01]">
          <div className="text-[#8b5cf6] mb-1.5 flex items-center justify-center h-5">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-white mb-0.5">Community Driven</span>
          <span className="text-[10px] text-[#717388] leading-tight">Join a growing community of creators.</span>
        </div>
      </div>

      {/* Footer Copyright & Contact */}
      <div className="flex items-center justify-between text-[11px] text-[#606277] mt-8 pt-4 border-t border-white/[0.05]">
        <span>© 2026 KodeDock. All rights reserved.</span>
        <Link href="/foundation/contact" className="hover:text-white transition-colors">
          Need help? <span className="text-[#8b5cf6]">Contact Support</span>
        </Link>
      </div>
    </motion.div>
  );
}
