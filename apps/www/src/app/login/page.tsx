"use client";

import React, { useState, useEffect } from "react";
import { signIn, signUp, syncAuthStorage, clearAuthStorage } from "@kodedock/auth/client";
import type { UserRole } from "@kodedock/types";
import { ShieldCheck, Sparkles, ArrowRight, User, Mail, Lock, Code2, Cpu } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("SELLER");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync existing active session to localStorage and sessionStorage if available
  useEffect(() => {
    fetch("/api/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((body) => {
        if (body?.success && body.data?.user) {
          syncAuthStorage({
            user: body.data.user,
            session: body.data.session,
            role: body.data.user.role,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let resolvedRole: UserRole = role;

      if (mode === "signin") {
        const { data: signInData, error: signInErr } = await signIn.email({
          email: email.trim(),
          password,
        });

        if (signInErr) {
          setError(signInErr.message || "Failed to sign in. Please verify your credentials.");
          return;
        }

        const userData = (signInData as any)?.user;
        const sessionData = (signInData as any)?.session;
        const token = (signInData as any)?.token;

        if (userData?.role) {
          resolvedRole = userData.role as UserRole;
        }

        // Store user, role, and session in both localStorage and sessionStorage
        syncAuthStorage({
          user: userData,
          session: sessionData,
          role: resolvedRole,
          token,
        });
      } else {
        const { data: signUpData, error: signUpErr } = await (signUp.email as any)({
          email: email.trim(),
          password,
          name: name.trim() || (role === "SELLER" ? "Verified Creator" : "Developer"),
          role,
        });

        if (signUpErr) {
          setError(signUpErr.message || "Failed to create account. Please try again.");
          return;
        }

        const userData = (signUpData as any)?.user;
        const sessionData = (signUpData as any)?.session;
        const token = (signUpData as any)?.token;

        if (userData?.role) {
          resolvedRole = userData.role as UserRole;
        }

        // Store user, role, and session in both localStorage and sessionStorage
        syncAuthStorage({
          user: userData,
          session: sessionData,
          role: resolvedRole,
          token,
        });
      }

      // Determine redirect destination
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get("redirect");

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      // Default redirect based on verified user role
      if (resolvedRole === "SELLER") {
        window.location.href = process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3001";
      } else {
        window.location.href = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3002";
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "radial-gradient(ellipse at 50% 10%, rgba(139, 92, 246, 0.12), transparent 50%), #090A0F",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#12131A",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow Accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #8B5CF6, #38BDF8, transparent)",
          }}
        />

        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 0.85rem",
              borderRadius: "9999px",
              background: "rgba(139, 92, 246, 0.1)",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              color: "#8B5CF6",
              fontSize: "0.75rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            <ShieldCheck size={14} />
            <span>KODEDOCK SECURE AUTH HUB</span>
          </div>

          <h1
            style={{
              fontSize: "1.85rem",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "0.4rem",
              letterSpacing: "-0.03em",
            }}
          >
            {mode === "signin" ? "Sign In to KodeDock" : "Create Developer Account"}
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "0.88rem" }}>
            {mode === "signin"
              ? "Access your Creator Studio, Developer Portal, and Store"
              : "100% Real Database & Self-Hosted Sovereign Identity"}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            background: "#090A0F",
            padding: "0.3rem",
            borderRadius: "10px",
            marginBottom: "1.75rem",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(""); }}
            style={{
              padding: "0.6rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              background: mode === "signin" ? "#1F212D" : "transparent",
              color: mode === "signin" ? "#ffffff" : "#6b7280",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(""); }}
            style={{
              padding: "0.6rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              background: mode === "signup" ? "#1F212D" : "transparent",
              color: mode === "signup" ? "#ffffff" : "#6b7280",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#f87171",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              fontSize: "0.82rem",
              marginBottom: "1.25rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {mode === "signup" && (
            <>
              {/* Full Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.82rem", color: "#d1d5db", fontWeight: 500 }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    size={16}
                    color="#6b7280"
                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem 0.65rem 2.4rem",
                      background: "#090A0F",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.88rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    placeholder="Alex Architect"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.82rem", color: "#d1d5db", fontWeight: 500 }}>
                  Select Account Role
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  <button
                    type="button"
                    onClick={() => setRole("SELLER")}
                    style={{
                      padding: "0.75rem 0.6rem",
                      borderRadius: "8px",
                      background: role === "SELLER" ? "rgba(139, 92, 246, 0.15)" : "#090A0F",
                      border: `1px solid ${role === "SELLER" ? "#8B5CF6" : "rgba(255, 255, 255, 0.08)"}`,
                      color: role === "SELLER" ? "#ffffff" : "#9ca3af",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600, fontSize: "0.82rem" }}>
                      <Cpu size={14} color="#8B5CF6" />
                      <span>Creator (SELLER)</span>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>Publish & sell boilerplates</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("BUYER")}
                    style={{
                      padding: "0.75rem 0.6rem",
                      borderRadius: "8px",
                      background: role === "BUYER" ? "rgba(56, 189, 248, 0.15)" : "#090A0F",
                      border: `1px solid ${role === "BUYER" ? "#38BDF8" : "rgba(255, 255, 255, 0.08)"}`,
                      color: role === "BUYER" ? "#ffffff" : "#9ca3af",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600, fontSize: "0.82rem" }}>
                      <Code2 size={14} color="#38BDF8" />
                      <span>Buyer (BUYER)</span>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>Download & build apps</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.82rem", color: "#d1d5db", fontWeight: 500 }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                color="#6b7280"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem 0.65rem 2.4rem",
                  background: "#090A0F",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                placeholder="developer@kodedock.com"
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.82rem", color: "#d1d5db", fontWeight: 500 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                color="#6b7280"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem 0.65rem 2.4rem",
                  background: "#090A0F",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: "0.75rem",
              background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
              color: "#ffffff",
              padding: "0.75rem",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.9rem",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
              transition: "transform 0.15s ease",
            }}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === "signin" ? "Sign In & Enter" : "Create Account & Enter"}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div style={{ textAlign: "center", marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <p style={{ fontSize: "0.76rem", color: "#6b7280" }}>
            Protected by Ed25519 Cryptographic Licensing & Zero-Mock PostgreSQL Engine
          </p>
        </div>
      </div>
    </div>
  );
}
