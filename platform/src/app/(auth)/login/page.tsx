"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Security: Clean URL immediately if credentials were ever passed in query parameters
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("password") || params.has("email")) {
        // Strip sensitive credentials from browser URL and history
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res?.data?.token) {
        localStorage.setItem("kd_access_token", res.data.token);
        router.push("/dashboard");
      } else {
        setErrorMessage("Invalid credentials.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-[#A1A1AA] mt-2">
          Enter your credentials to manage your codebases, escrow payouts, and token families.
        </p>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => {}}
          className="flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl bg-[#27272A] border border-[#414146]/70 hover:border-[#8535FC]/50 hover:bg-[#27272A]/80 transition-all text-sm font-medium text-white shadow-sm group cursor-pointer"
        >
          <Image
            src="/icons/tech/github.svg"
            alt="GitHub"
            width={18}
            height={18}
            className="w-4 h-4 object-contain invert brightness-200 group-hover:scale-110 transition-transform"
          />
          <span>GitHub</span>
        </button>

        <button
          type="button"
          onClick={() => {}}
          className="flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl bg-[#27272A] border border-[#414146]/70 hover:border-[#8535FC]/50 hover:bg-[#27272A]/80 transition-all text-sm font-medium text-white shadow-sm group cursor-pointer"
        >
          <Image
            src="/icons/tech/google.svg"
            alt="Google"
            width={18}
            height={18}
            className="w-4 h-4 object-contain group-hover:scale-110 transition-transform"
          />
          <span>Google</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#414146]/50" />
        </div>
        <span className="relative px-3 bg-[#1D1D21] text-[11px] font-mono tracking-widest text-[#A1A1AA]/80 uppercase">
          Or continue with email
        </span>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form
        method="POST"
        action="#"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <div>
          <label className="block text-xs font-medium text-[#EDEDF0] mb-1.5 font-sans">
            Work Email Address
          </label>
          <Input
            type="email"
            placeholder="developer@startup.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-[#EDEDF0] font-sans">
              Master Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#8535FC] hover:text-[#9D59FE] transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#414146] bg-[#141417] text-[#8535FC] focus:ring-[#8535FC] focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
            />
            <span className="text-xs text-[#A1A1AA] hover:text-[#EDEDF0] transition-colors">
              Trust this device for 30 days
            </span>
          </label>

          <Link
            href="/verify-2fa"
            className="text-[11px] font-mono text-purple-300/80 hover:text-purple-300 flex items-center gap-1"
          >
            <span>2FA Prompt</span>
            <span>→</span>
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#8535FC] to-[#6A1BEE] hover:from-[#7822FA] hover:to-[#5E12E0] shadow-[0_0_20px_rgba(133,53,252,0.35)] transition-all cursor-pointer mt-2"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Verifying Argon2id Token...</span>
            </div>
          ) : (
            <span>Sign In to Vault</span>
          )}
        </Button>
      </form>

      {/* Switch to Register */}
      <div className="text-center mt-8 pt-6 border-t border-[#414146]/40 space-y-2">
        <p className="text-xs text-[#A1A1AA]">
          Don&apos;t have a KodeDock account yet?{" "}
          <Link
            href="/register"
            className="text-[#8535FC] hover:text-[#9D59FE] font-medium transition-colors ml-1"
          >
            Create a Buyer Account
          </Link>
        </p>
        <p className="text-xs text-[#A1A1AA]">
          Are you a code seller or studio?{" "}
          <Link
            href="/developer/register"
            className="text-[#06B6D4] hover:text-[#22D3EE] font-medium transition-colors ml-1"
          >
            Register as a Developer →
          </Link>
        </p>
      </div>
    </div>
  );
}
