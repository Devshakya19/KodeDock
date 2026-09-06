"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { authApi } from "@/lib/api/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Security: Clean URL immediately if credentials were ever passed in query parameters
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("password") || params.has("email")) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Compute password strength score (0-4)
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthLabels = ["Too Weak", "Fair", "Good", "Strong", "Bank-Grade"];
  const strengthColors = [
    "bg-red-500",
    "bg-amber-500",
    "bg-yellow-400",
    "bg-blue-400",
    "bg-emerald-400",
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage(null);

    if (!agreeTerms) {
      setErrorMessage("Please accept the Escrow Agreement and Privacy Policy.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (passwordStrength < 2) {
      setErrorMessage("Please use a stronger password with at least 8 characters, numbers, and symbols.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.register({ email, password, full_name: fullName });
      const token = res?.data?.access_token || res?.data?.token;
      if (token) {
        localStorage.setItem("kd_access_token", token);
        if (res?.data?.user) {
          localStorage.setItem("kd_user", JSON.stringify(res.data.user));
        }
        setIsSuccess(true);
      } else {
        setErrorMessage("Registration successful, but no token returned. Please login.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full text-center py-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold font-heading text-white">Account Created!</h2>
        <p className="text-sm text-[#A1A1AA] mt-2 max-w-sm mx-auto">
          We sent an activation link and TOTP setup key to <span className="text-purple-300 font-mono">{email}</span>.
        </p>
        <div className="mt-8">
          <Link href="/verify-2fa">
            <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-[#8535FC] to-[#6A1BEE] hover:from-[#7822FA] hover:to-[#5E12E0] shadow-[0_0_20px_rgba(133,53,252,0.35)]">
              Continue to 2FA Setup →
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight">
          Create a Buyer Account
        </h2>
        <p className="text-sm text-[#A1A1AA] mt-1.5">
          Join thousands of enterprises acquiring verified software with bank-grade escrow.
        </p>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          type="button"
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#27272A] border border-[#414146]/70 hover:border-[#8535FC]/50 hover:bg-[#27272A]/80 transition-all text-xs font-medium text-white shadow-sm cursor-pointer"
        >
          <Image
            src="/icons/tech/github.svg"
            alt="GitHub"
            width={16}
            height={16}
            className="w-4 h-4 object-contain invert brightness-200"
          />
          <span>Sign up with GitHub</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#27272A] border border-[#414146]/70 hover:border-[#8535FC]/50 hover:bg-[#27272A]/80 transition-all text-xs font-medium text-white shadow-sm cursor-pointer"
        >
          <Image
            src="/icons/tech/google.svg"
            alt="Google"
            width={16}
            height={16}
            className="w-4 h-4 object-contain"
          />
          <span>Sign up with Google</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-5 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#414146]/50" />
        </div>
        <span className="relative px-3 bg-[#1D1D21] text-[10px] font-mono tracking-widest text-[#A1A1AA]/80 uppercase">
          Or register with email
        </span>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
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

      {/* Register Form */}
      <form
        method="POST"
        action="#"
        onSubmit={handleSubmit}
        className="space-y-3.5"
        noValidate
      >
        <div>
          <label className="block text-xs font-medium text-[#EDEDF0] mb-1">
            Full Name or Organization
          </label>
          <Input
            type="text"
            placeholder="Alex Vance or OctoLabs Inc."
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#EDEDF0] mb-1">
            Work Email Address
          </label>
          <Input
            type="email"
            placeholder="alex@octolabs.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-[#EDEDF0]">
              Create Password
            </label>
            {password && (
              <span className="text-[10px] font-mono font-medium text-purple-300">
                {strengthLabels[passwordStrength]}
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white transition-colors"
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

          {/* Password Strength Meter */}
          {password && (
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index < passwordStrength
                      ? strengthColors[passwordStrength]
                      : "bg-[#414146]/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#EDEDF0] mb-1">
            Confirm Password
          </label>
          <Input
            type="password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        {/* Agreement Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#414146] bg-[#141417] text-[#8535FC] focus:ring-[#8535FC] focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
            />
            <span className="text-xs text-[#A1A1AA] leading-snug">
              I agree to the{" "}
              <Link href="#" className="text-purple-300 underline hover:text-white">
                Escrow Terms of Service
              </Link>
              , Section 194-O TDS automated compliance, and{" "}
              <Link href="#" className="text-purple-300 underline hover:text-white">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        {/* Submit button */}
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
              <span>Creating Cryptographic Vault...</span>
            </div>
          ) : (
            <span>Create Free Account</span>
          )}
        </Button>
      </form>

      {/* Links */}
      <div className="text-center mt-6 pt-5 border-t border-[#414146]/40 space-y-2">
        <p className="text-xs text-[#A1A1AA]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#8535FC] hover:text-[#9D59FE] font-medium transition-colors ml-1"
          >
            Log in to Vault
          </Link>
        </p>
        <p className="text-xs text-[#A1A1AA]">
          Are you a developer?{" "}
          <Link
            href="/developer/register"
            className="text-[#8535FC] hover:text-[#9D59FE] font-medium transition-colors ml-1"
          >
            Create a Developer Account
          </Link>
        </p>
      </div>
    </div>
  );
}
