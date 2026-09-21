import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { signIn } from "@kodedock/auth";
import type { UserRole } from "@kodedock/types";

interface LoginFormProps {
  role: UserRole;
  onSuccess: (data: any) => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  role,
  onSuccess,
  onSwitchToRegister,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await signIn.email({
        email,
        password,
      });

      if (response.error) {
        setErrorMessage(
          response.error.message || "Invalid credentials. Please verify your email and password."
        );
      } else {
        onSuccess(response.data);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "An unexpected error occurred during sign-in. Please try again."
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
        <label className="form-label" htmlFor="login-email">
          Work Email
        </label>
        <div className="input-wrapper">
          <Mail className="input-icon" size={16} />
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            placeholder="developer@company.com"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label className="form-label" htmlFor="login-password">
            Password
          </label>
          <a
            href="#forgot"
            onClick={(e) => {
              e.preventDefault();
              alert("Password reset OTP can be sent via our API endpoint /api/auth/otp/send");
            }}
            className="form-link"
          >
            Forgot password?
          </a>
        </div>
        <div className="input-wrapper">
          <Lock className="input-icon" size={16} />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
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

      <button
        type="submit"
        className="submit-btn"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <span>Sign In as {role === "SELLER" ? "Seller" : "Buyer"}</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <div className="auth-mode-switch">
        <span>Don't have an account yet?</span>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="auth-mode-btn"
        >
          Create account
        </button>
      </div>
    </form>
  );
};
