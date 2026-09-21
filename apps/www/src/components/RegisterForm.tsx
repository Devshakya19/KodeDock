import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { signUp } from "@kodedock/auth";
import type { UserRole } from "@kodedock/types";

interface RegisterFormProps {
  role: UserRole;
  onSuccess: (data: any) => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  role,
  onSuccess,
  onSwitchToLogin,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please enter your developer or organization name.");
      return;
    }
    if (!email || !password) {
      setErrorMessage("Please provide a valid email and strong password.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long for Scrypt hashing security.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      } as any);

      if (response.error) {
        setErrorMessage(
          response.error.message || "Unable to complete registration. User may already exist."
        );
      } else {
        onSuccess(response.data);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Registration failed due to a network or server error."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {errorMessage && (
        <div className="auth-alert auth-alert-error" role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="register-name">
          Developer Name or Handle
        </label>
        <div className="input-wrapper">
          <User className="input-icon" size={16} />
          <input
            id="register-name"
            type="text"
            required
            autoComplete="name"
            placeholder="e.g. Alex Chen"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="register-email">
          Email Address
        </label>
        <div className="input-wrapper">
          <Mail className="input-icon" size={16} />
          <input
            id="register-email"
            type="email"
            required
            autoComplete="email"
            placeholder="developer@kodedock.com"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="register-password">
          Password (min. 8 characters)
        </label>
        <div className="input-wrapper">
          <Lock className="input-icon" size={16} />
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="••••••••••••"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "-0.25rem" }}>
        <ShieldCheck size={14} style={{ color: "var(--accent-primary)" }} />
        <span>Secured via Scrypt salt + timing-safe key derivation in PostgreSQL</span>
      </div>

      <button
        type="submit"
        className="submit-btn"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Creating Developer Account...</span>
          </>
        ) : (
          <>
            <span>Register as {role === "SELLER" ? "Seller (95% Payout)" : "Buyer Developer"}</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <div className="auth-mode-switch">
        <span>Already have an account?</span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="auth-mode-btn"
        >
          Sign in
        </button>
      </div>
    </form>
  );
};
