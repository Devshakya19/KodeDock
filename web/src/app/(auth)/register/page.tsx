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
} from "lucide-react";
import { motion } from "framer-motion";
import { auth } from "@/shared/lib/auth/client";
import { GithubIcon } from "@/shared/components/icons/github";
import {
  GoogleIcon,
  DiscordIcon,
  KodeDockLogoMark,
} from "@/shared/components/icons/social-auth";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service & Privacy Policy");
      return;
    }

    // Client-side validations matching Rust backend
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }
    if (!/\d/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await auth.signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role: "user",
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
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
      const state = btoa("user|/browse");
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
        className="w-full sm:w-[480px] md:w-[520px] lg:w-[560px] bg-[#0b0c10]/90 backdrop-blur-2xl border border-white/[0.08] rounded-[24px] sm:rounded-[28px] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6d28d9] to-[#8b5cf6] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#6d28d9]/30">
          <Check className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome to KodeDock!
        </h1>
        <p className="text-xs sm:text-sm text-[#9496ac] mt-2.5 leading-relaxed max-w-md mx-auto">
          Your account has been created successfully. You can now sign in and explore thousands of developer tools and code templates.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-6 w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] hover:brightness-110 text-white font-semibold text-xs sm:text-sm shadow-[0_8px_24px_rgba(109,40,217,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          Proceed to Sign In <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full sm:w-[480px] md:w-[520px] lg:w-[560px] bg-[#0b0c10]/90 backdrop-blur-2xl border border-white/[0.08] rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 md:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white relative"
    >
      {/* Top Header: Logo + Secure Badge */}
      <div className="flex items-center justify-between gap-2 mb-5 sm:mb-6">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <KodeDockLogoMark size={32} className="transition-transform group-hover:scale-105 shrink-0" />
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
              Kode<span className="text-white">Dock</span>
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.22em] text-[#8e8fa3] uppercase font-semibold mt-0.5">
              Code • Build • Ship
            </span>
          </div>
        </Link>

        {/* 256-bit SSL Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] sm:text-[11px] font-medium text-[#a0a1b8] shrink-0">
          <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#6366f1]" />
          <span className="hidden xs:inline">Secure by</span> <span>256-bit SSL</span>
        </div>
      </div>

      {/* Main Headings */}
      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
          Create an account, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#a855f7]">
            Build Faster.
          </span>
        </h1>
        <p className="text-[#9496ac] text-xs sm:text-[13px] mt-1.5 leading-relaxed">
          Join 2,000+ developers discovering, downloading and monetizing production-ready source code.
        </p>
      </div>

      {/* Social Register Buttons */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-5">
        <button
          type="button"
          onClick={handleGithubLogin}
          disabled={loading}
          className="flex items-center justify-center gap-2 h-10 sm:h-11 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] text-xs sm:text-[13px] font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <GithubIcon size={16} />
          <span className="truncate">GitHub</span>
        </button>

        <button
          type="button"
          onClick={() => setError("Google registration will be enabled in next release")}
          disabled={loading}
          className="flex items-center justify-center gap-2 h-10 sm:h-11 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] text-xs sm:text-[13px] font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <GoogleIcon size={16} />
          <span className="truncate">Google</span>
        </button>

        <button
          type="button"
          onClick={() => setError("Discord registration will be enabled in next release")}
          disabled={loading}
          className="flex items-center justify-center gap-2 h-10 sm:h-11 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] text-xs sm:text-[13px] font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <DiscordIcon size={16} className="text-[#5865F2]" />
          <span className="truncate">Discord</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-5">
        <div className="w-full border-t border-white/[0.07]" />
        <span className="absolute bg-[#0b0c10] px-3 text-[11px] font-medium text-[#7c7d96]">
          or register with email
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400 text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-3 sm:space-y-3.5">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-xs font-semibold text-[#cfd0df] mb-1">
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
              className="w-full h-10 sm:h-11 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#7c3aed] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-xs sm:text-sm text-white placeholder:text-[#55566c] transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-[#cfd0df] mb-1">
            Email address
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
              className="w-full h-10 sm:h-11 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#7c3aed] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-xs sm:text-sm text-white placeholder:text-[#55566c] transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-[#cfd0df] mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666880]" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              required
              className="w-full h-10 sm:h-11 pl-10 pr-11 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#7c3aed] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-xs sm:text-sm text-white placeholder:text-[#55566c] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666880] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="pt-0.5">
          <label className="flex items-start gap-2 cursor-pointer text-[11px] sm:text-xs font-medium text-[#a0a1b8] select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-3.5 h-3.5 mt-0.5 rounded border-white/20 bg-white/[0.04] text-[#6d28d9] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#7c3aed]"
            />
            <span>
              I agree to the{" "}
              <Link href="/foundation/terms-of-service" className="text-[#a78bfa] hover:underline">
                Terms
              </Link>{" "}
              &{" "}
              <Link href="/foundation/privacy-policy" className="text-[#a78bfa] hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        {/* Register CTA Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 sm:h-11 rounded-xl bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] hover:brightness-110 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm shadow-[0_8px_24px_rgba(109,40,217,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-1"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Create Account <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign In & Apply as Seller */}
      <div className="flex flex-col gap-1 text-center mt-4 mb-5 text-xs text-[#9496ac]">
        <div>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors underline underline-offset-4 decoration-[#a78bfa]/40 hover:decoration-[#a78bfa]"
          >
            Sign in
          </Link>
        </div>
        <div className="text-[11px] text-[#717388]">
          Want to sell your code?{" "}
          <Link href="/developer-register" className="text-white hover:text-[#a78bfa] transition-colors underline underline-offset-2">
            Apply as Developer
          </Link>
        </div>
      </div>

      {/* 4 Feature Value Pillars Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/[0.08]">
        <div className="flex flex-col items-center text-center p-1 rounded-lg bg-white/[0.01]">
          <div className="text-[#8b5cf6] mb-1 font-mono text-xs font-bold flex items-center justify-center h-4">
            &lt;/&gt;
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white mb-0.5">Developer First</span>
          <span className="text-[9px] text-[#717388] leading-tight">Built by devs, for devs.</span>
        </div>

        <div className="flex flex-col items-center text-center p-1 rounded-lg bg-white/[0.01]">
          <div className="text-[#8b5cf6] mb-1 flex items-center justify-center h-4">
            <LockKeyhole className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white mb-0.5">Secure & Reliable</span>
          <span className="text-[9px] text-[#717388] leading-tight">Enterprise-grade security.</span>
        </div>

        <div className="flex flex-col items-center text-center p-1 rounded-lg bg-white/[0.01]">
          <div className="text-[#8b5cf6] mb-1 flex items-center justify-center h-4">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white mb-0.5">Instant Access</span>
          <span className="text-[9px] text-[#717388] leading-tight">Instant code download.</span>
        </div>

        <div className="flex flex-col items-center text-center p-1 rounded-lg bg-white/[0.01]">
          <div className="text-[#8b5cf6] mb-1 flex items-center justify-center h-4">
            <Users className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white mb-0.5">Community Driven</span>
          <span className="text-[9px] text-[#717388] leading-tight">Growing dev ecosystem.</span>
        </div>
      </div>

      {/* Footer Copyright & Contact */}
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#606277] mt-5 pt-3 border-t border-white/[0.05]">
        <span>© 2026 KodeDock. All rights reserved.</span>
        <Link href="/foundation/contact" className="hover:text-white transition-colors">
          Need help? <span className="text-[#8b5cf6]">Contact Support</span>
        </Link>
      </div>
    </motion.div>
  );
}
