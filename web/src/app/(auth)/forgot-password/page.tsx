"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle,
  LockKeyhole,
  Zap,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiPost } from "@/shared/lib/api/client";
import { KodeDockLogoMark } from "@/shared/components/icons/social-auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await apiPost("/auth/forgot-password", { email });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to send reset link");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[580px] bg-[#0b0c10]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[28px] p-8 sm:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.8)] text-white text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6d28d9] to-[#8b5cf6] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#6d28d9]/30">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Check your email
        </h1>
        <p className="text-sm text-[#9496ac] mt-3 leading-relaxed max-w-md mx-auto">
          If an account exists with <span className="text-white font-semibold">{email}</span>, we&apos;ve sent a password reset link.
        </p>
        <Link href="/login">
          <button className="mt-8 w-full h-12 rounded-xl bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] hover:brightness-110 text-white font-semibold text-sm shadow-[0_8px_24px_rgba(109,40,217,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer">
            Back to Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[580px] bg-[#0b0c10]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[28px] p-6 sm:p-10 md:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.8)] text-white relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <Link href="/" className="flex items-center gap-3 group">
          <KodeDockLogoMark size={38} className="transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-none">
              Kode<span className="text-white">Dock</span>
            </span>
            <span className="text-[10px] tracking-[0.25em] text-[#8e8fa3] uppercase font-semibold mt-1">
              Account Recovery
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-[#a0a1b8]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6366f1]" />
          <span>Encrypted Link</span>
        </div>
      </div>

      {/* Main Headings */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
          Forgot password? <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#a855f7]">
            We&apos;ve got your back.
          </span>
        </h1>
        <p className="text-[#9496ac] text-[13.5px] sm:text-sm mt-2 leading-relaxed">
          Enter the email address registered with your KodeDock account and we&apos;ll send a secure password reset link.
        </p>
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-[#cfd0df] mb-2">
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
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#7c3aed] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-sm text-white placeholder:text-[#55566c] transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] hover:brightness-110 active:scale-[0.99] text-white font-semibold text-sm shadow-[0_8px_24px_rgba(109,40,217,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Send Reset Link <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Return to login */}
      <div className="text-center mt-8 mb-8 text-xs sm:text-[13px] text-[#9496ac]">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-bold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors underline underline-offset-4 decoration-[#a78bfa]/40 hover:decoration-[#a78bfa]"
        >
          Sign in
        </Link>
      </div>

      {/* Value Pillars */}
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

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-[#606277] mt-8 pt-4 border-t border-white/[0.05]">
        <span>© 2026 KodeDock. All rights reserved.</span>
        <Link href="/foundation/contact" className="hover:text-white transition-colors">
          Need help? <span className="text-[#8b5cf6]">Contact Support</span>
        </Link>
      </div>
    </motion.div>
  );
}
