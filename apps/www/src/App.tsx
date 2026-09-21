import React, { useState, useEffect } from "react";
import { AuthLayout } from "./components/AuthLayout";
import { RoleSelector } from "./components/RoleSelector";
import { OAuthButtons } from "./components/OAuthButtons";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { signOut } from "@kodedock/auth";
import type { UserRole } from "@kodedock/types";
import { ArrowUpRight, LogOut, CheckCircle, Shield } from "lucide-react";

type AuthMode = "login" | "register";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export const App: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole>("BUYER");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Check current session from API on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.user) {
            setUser({
              id: json.data.user.id,
              name: json.data.user.name || "Developer",
              email: json.data.user.email,
              role: (json.data.user.role as UserRole) || "BUYER",
              avatarUrl: json.data.user.image,
            });
            setRole((json.data.user.role as UserRole) || "BUYER");
          }
        }
      } catch (e) {
        // Not logged in or offline; ignore
      }
    }
    checkSession();
  }, []);

  const handleAuthSuccess = (data: any) => {
    const authenticatedUser = data?.user;
    if (authenticatedUser) {
      setUser({
        id: authenticatedUser.id,
        name: authenticatedUser.name || "Developer",
        email: authenticatedUser.email,
        role: authenticatedUser.role || role,
        avatarUrl: authenticatedUser.image,
      });
      setSuccessBanner(
        mode === "register"
          ? "Account registered successfully in PostgreSQL! Welcome to Kodedock."
          : "Logged in successfully. Session authenticated."
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setSuccessBanner("You have been signed out.");
    } catch (e) {
      setUser(null);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-card">
        {/* Mobile Header Logo */}
        <div className="mobile-logo">
          <img src="/kodedock.svg" alt="Kodedock Logo" style={{ height: 34 }} />
        </div>

        {successBanner && (
          <div className="auth-alert auth-alert-success">
            <CheckCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{successBanner}</span>
          </div>
        )}

        {user ? (
          /* User Profile & Dashboard Navigation View */
          <div className="user-profile-preview">
            <div className="user-avatar-row">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="user-meta-name">{user.name}</h3>
                <p className="user-meta-email">{user.email}</p>
                <span
                  className={`user-meta-badge ${
                    user.role === "SELLER" ? "badge-seller" : "badge-buyer"
                  }`}
                >
                  {user.role === "SELLER" ? "SELLER DEVELOPER (95% Payout)" : "BUYER DEVELOPER"}
                </span>
              </div>
            </div>

            <div className="session-key-box">
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem", color: "var(--accent-cyan)" }}>
                <Shield size={14} />
                <strong>PostgreSQL User Record:</strong>
              </div>
              <code>ID: {user.id}</code>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.5rem" }}>
              {user.role === "SELLER" ? (
                <a
                  href="http://localhost:3001"
                  className="dashboard-action-btn"
                  style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" }}
                >
                  <span>Open Creator Studio</span>
                  <ArrowUpRight size={16} />
                </a>
              ) : (
                <a
                  href="http://localhost:3002"
                  className="dashboard-action-btn"
                  style={{ background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)" }}
                >
                  <span>Open Buyer Library</span>
                  <ArrowUpRight size={16} />
                </a>
              )}

              <a
                href="http://localhost:3003"
                className="oauth-btn"
                style={{ justifyContent: "center" }}
              >
                <span>Browse Store Catalog</span>
                <ArrowUpRight size={16} />
              </a>

              <button
                type="button"
                onClick={handleSignOut}
                className="signout-btn"
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                  <LogOut size={15} />
                  <span>Sign Out of Kodedock</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Form State */
          <>
            <div className="auth-form-header">
              <h2 className="auth-title">
                {mode === "login" ? "Sign In to Kodedock" : "Create Account"}
              </h2>
              <p className="auth-desc">
                {mode === "login"
                  ? "Access your purchased assets or creator studio"
                  : "Join the zero-markup code marketplace today"}
              </p>
            </div>

            {/* Persona Role Switcher */}
            <RoleSelector
              selectedRole={role}
              onChange={(newRole) => setRole(newRole)}
            />

            {/* 1-Click OAuth */}
            <OAuthButtons />

            <div className="auth-divider">
              <span>Or with credentials</span>
            </div>

            {mode === "login" ? (
              <LoginForm
                role={role}
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setMode("register")}
              />
            ) : (
              <RegisterForm
                role={role}
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setMode("login")}
              />
            )}
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default App;
