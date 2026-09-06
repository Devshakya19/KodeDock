"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSubmitted && resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isSubmitted, resendCooldown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setResendCooldown(60);
    }, 1000);
  };

  const handleResend = () => {
    if (resendCooldown === 0) {
      setResendCooldown(60);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#8535FC] transition-colors mb-4"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Login</span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight">
          Reset password
        </h2>
        <p className="text-sm text-[#A1A1AA] mt-1.5">
          Enter your registered work email and we will send you a cryptographically signed recovery token.
        </p>
      </div>

      {isSubmitted ? (
        <div className="rounded-2xl bg-[#27272A]/70 border border-[#414146]/70 p-6 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(133,53,252,0.2)]">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Check your inbox</h3>
          <p className="text-xs text-[#A1A1AA] mt-2">
            A secure recovery link has been dispatched to:
            <br />
            <span className="font-mono text-purple-300 font-medium text-sm mt-1 inline-block">
              {email}
            </span>
          </p>

          <div className="mt-6 pt-5 border-t border-[#414146]/40 flex flex-col gap-2.5">
            <Link href="/reset-password">
              <Button
                variant="outline"
                className="w-full text-xs h-10 border-[#8535FC]/50 text-purple-200 hover:bg-[#8535FC]/10"
              >
                Proceed with Reset Token →
              </Button>
            </Link>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-xs text-[#A1A1AA] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-mono py-1"
            >
              {resendCooldown > 0
                ? `Resend link in ${resendCooldown}s`
                : "Didn't receive email? Click to resend"}
            </button>
          </div>
        </div>
      ) : (
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
                <span>Generating Cryptographic Token...</span>
              </div>
            ) : (
              <span>Dispatch Reset Link</span>
            )}
          </Button>

          <div className="text-center mt-6">
            <p className="text-xs text-[#A1A1AA]">
              Remembered your credentials?{" "}
              <Link href="/login" className="text-[#8535FC] hover:text-[#9D59FE] font-medium ml-1">
                Return to sign in
              </Link>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
