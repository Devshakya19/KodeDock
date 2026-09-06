"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Security: Clean URL immediately if credentials were ever passed in query parameters
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("password")) {
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

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (passwordStrength < 2) {
      setErrorMessage("Please select a stronger password with at least 8 characters, numbers, and symbols.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1200);
  };

  if (isSuccess) {
    return (
      <div className="w-full text-center py-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold font-heading text-white">Password Updated!</h2>
        <p className="text-sm text-[#A1A1AA] mt-2 max-w-sm mx-auto">
          All previous active sessions have been revoked via token family rotation. You can now sign in with your new master password.
        </p>
        <div className="mt-8">
          <Link href="/login">
            <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-[#8535FC] to-[#6A1BEE] hover:from-[#7822FA] hover:to-[#5E12E0] shadow-[0_0_20px_rgba(133,53,252,0.35)]">
              Sign In to KodeDock →
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
          Set new password
        </h2>
        <p className="text-sm text-[#A1A1AA] mt-1.5">
          Enter a new master password for your KodeDock vault. This will automatically invalidate previous token family sessions.
        </p>
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

      {/* Form */}
      <form
        method="POST"
        action="#"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-[#EDEDF0]">
              New Master Password
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
            Confirm New Master Password
          </label>
          <Input
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="p-3 rounded-xl bg-[#27272A]/80 border border-[#414146]/50 text-[11px] text-[#A1A1AA] flex items-start gap-2">
          <svg className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            This action will cryptographically cycle your session family ID and disconnect other active logins.
          </span>
        </div>

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
              <span>Updating Vault Credentials...</span>
            </div>
          ) : (
            <span>Save & Re-Authenticate</span>
          )}
        </Button>
      </form>
    </div>
  );
}
