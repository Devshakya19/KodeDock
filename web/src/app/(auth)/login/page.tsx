"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    if (oauthError) {
      setError(decodeURIComponent(oauthError));
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { user } = await auth.signIn({ email, password });
      router.push(user.role === "developer" ? "/seller" : "/browse");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Login failed");
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full sm:w-[480px] md:w-[500px] lg:w-[520px] bg-[#0b0c10]/92 backdrop-blur-2xl border border-white/[0.08] rounded-[22px] sm:rounded-[26px] p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white relative"
    >
      {/* Top Header: Logo + Secure Badge */}
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <KodeDockLogoMark size={30} className="transition-transform group-hover:scale-105 shrink-0" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white leading-none">
              Kode<span className="text-white">Dock</span>
            </span>
            <span className="text-[9px] tracking-[0.22em] text-[#8e8fa3] uppercase font-semibold mt-0.5">
              Code • Build • Ship
            </span>
          </div>
        </Link>

        {/* 256-bit SSL Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] sm:text-[11px] font-medium text-[#a0a1b8] shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6366f1]" />
          <span>Secure by 256-bit SSL</span>
        </div>
      </div>

      {/* Main Headings */}
      <div className="mb-4 sm:mb-5">
        <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white leading-tight">
          Welcome back, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#a855f7]">
            Developer.
          </span>
        </h1>
        <p className="text-[#9496ac] text-xs sm:text-[13px] mt-1 leading-relaxed">
          Sign in to your KodeDock account and continue building, selling and scaling your digital products.
        </p>
      </div>

      {/* Social Login Buttons (GitHub, Google, Discord) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-4 sm:mb-5">
        <button
          type="button"
          onClick={handleGithubLogin}
          disabled={loading}
          className="flex items-center justify-center gap-2 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] text-xs sm:text-[13px] font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <GithubIcon size={16} />
          <span className="truncate">GitHub</span>
        </button>

        <button
          type="button"
          onClick={() => setError("Google login will be enabled in next release")}
          disabled={loading}
          className="flex items-center justify-center gap-2 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] text-xs sm:text-[13px] font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <GoogleIcon size={16} />
          <span className="truncate">Google</span>
        </button>

        <button
          type="button"
          onClick={() => setError("Discord login will be enabled in next release")}
          disabled={loading}
          className="flex items-center justify-center gap-2 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] text-xs sm:text-[13px] font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <DiscordIcon size={16} className="text-[#5865F2]" />
          <span className="truncate">Discord</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-4 sm:mb-5">
        <div className="w-full border-t border-white/[0.07]" />
        <span className="absolute bg-[#0b0c10] px-3 text-[10px] sm:text-[11px] font-medium text-[#7c7d96]">
          or continue with email
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400 text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleLogin} className="space-y-3 sm:space-y-3.5">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-[11px] sm:text-xs font-semibold text-[#cfd0df] mb-1"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666880]" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full h-10 sm:h-11 pl-9 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#7c3aed] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-xs sm:text-sm text-white placeholder:text-[#55566c] transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="text-[11px] sm:text-xs font-semibold text-[#cfd0df]"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[10px] sm:text-[11px] font-semibold text-[#8b5cf6] hover:text-[#a78bfa] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666880]" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full h-10 sm:h-11 pl-9 pr-10 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#7c3aed] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-xs sm:text-sm text-white placeholder:text-[#55566c] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666880] hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Keep Me Signed In */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer text-[11px] sm:text-xs font-medium text-[#a0a1b8] select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-white/20 bg-white/[0.04] text-[#6d28d9] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#7c3aed]"
            />
            Remember me
          </label>
          <span className="text-[10px] sm:text-[11px] text-[#717388]">Keep me signed in</span>
        </div>

        {/* Sign In Primary CTA Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 sm:h-11 rounded-xl bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] hover:brightness-110 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm shadow-[0_8px_24px_rgba(109,40,217,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-1"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div className="text-center mt-3.5 mb-4 text-xs text-[#9496ac]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors underline underline-offset-4 decoration-[#a78bfa]/40 hover:decoration-[#a78bfa]"
        >
          Sign up
        </Link>
      </div>

      {/* 4 Feature Value Pillars Grid (Bottom of Card) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3.5 border-t border-white/[0.08]">
        {/* Developer First */}
        <div className="flex flex-col items-center text-center p-1 rounded-lg bg-white/[0.01]">
          <div className="text-[#8b5cf6] mb-0.5 font-mono text-xs sm:text-sm font-bold flex items-center justify-center h-4">
            &lt;/&gt;
          </div>
          <span className="text-[10px] font-bold text-white mb-0.5">
            Developer First
          </span>
          <span className="text-[9px] text-[#717388] leading-tight">
            Built by devs, for devs.
          </span>
        </div>

        {/* Secure & Reliable */}
        <div className="flex flex-col items-center text-center p-1 rounded-lg bg-white/[0.01]">
          <div className="text-[#8b5cf6] mb-0.5 flex items-center justify-center h-4">
            <LockKeyhole className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-white mb-0.5">
            Secure & Reliable
          </span>
          <span className="text-[9px] text-[#717388] leading-tight">
            Enterprise security.
          </span>
        </div>

        {/* Instant Access */}
        <div className="flex flex-col items-center text-center p-1 rounded-lg bg-white/[0.01]">
          <div className="text-[#8b5cf6] mb-0.5 flex items-center justify-center h-4">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-white mb-0.5">
            Instant Access
          </span>
          <span className="text-[9px] text-[#717388] leading-tight">
            Instant code access.
          </span>
        </div>

        {/* Community Driven */}
        <div className="flex flex-col items-center text-center p-1 rounded-lg bg-white/[0.01]">
          <div className="text-[#8b5cf6] mb-0.5 flex items-center justify-center h-4">
            <Users className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-white mb-0.5">
            Community Driven
          </span>
          <span className="text-[9px] text-[#717388] leading-tight">
            Growing ecosystem.
          </span>
        </div>
      </div>

      {/* Footer Copyright & Contact */}
      <div className="flex items-center justify-between text-[10px] text-[#606277] mt-4 pt-2.5 border-t border-white/[0.05]">
        <span>© 2026 KodeDock. All rights reserved.</span>
        <Link
          href="/foundation/contact"
          className="hover:text-white transition-colors"
        >
          Need help? <span className="text-[#8b5cf6]">Contact Support</span>
        </Link>
      </div>
    </motion.div>
  );
}
