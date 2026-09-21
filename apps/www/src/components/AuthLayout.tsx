import React from "react";
import { DollarSign, ShieldCheck, Zap } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-page-root">
      {/* Dynamic atmospheric ambient orbs */}
      <div className="glow-orb-purple" />
      <div className="glow-orb-cyan" />
      <div className="grid-overlay" />

      <div className="auth-container">
        {/* Left Column: Brand & Engineering Showcase */}
        <aside className="brand-showcase">
          <div className="brand-showcase-header">
            <a href="/" className="brand-logo-wrap">
              <img
                src="/kodedock.svg"
                alt="Kodedock Logo"
                className="brand-logo-img"
              />
            </a>
            <div className="brand-live-tag">
              <span className="pulsing-dot" />
              <span>POSTGRES V16 LIVE</span>
            </div>
          </div>

          <div className="brand-showcase-main">
            <div>
              <h1 className="brand-heading">
                The Zero-Markup Code Marketplace for{" "}
                <span className="brand-heading-gradient">Engineers.</span>
              </h1>
              <p className="brand-subtitle">
                Acquire production-grade SaaS boilerplates, AI agents, MCPs, and backend microservices. Or list your software and retain 95% of your sales in INR.
              </p>
            </div>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon-box">
                  <DollarSign size={18} />
                </div>
                <div className="feature-text">
                  <h4>95% Creator Take Rate (5% Flat Platform Fee)</h4>
                  <p>
                    Unlike legacy platforms taking 30-70%, Kodedock caps total fees at 5% with instant INR payouts via UPI & bank transfer.
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box">
                  <ShieldCheck size={18} />
                </div>
                <div className="feature-text">
                  <h4>Cryptographic Licensing & Real Database</h4>
                  <p>
                    Zero mock data, zero placeholders. Every transaction and download link is backed by real PostgreSQL tables and signed tokens.
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box">
                  <Zap size={18} />
                </div>
                <div className="feature-text">
                  <h4>Single Sign-On for Buyers & Creators</h4>
                  <p>
                    Switch roles seamlessly between buying developer tools and publishing codebases in your Studio dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Azeret Mono Terminal Preview */}
            <div className="brand-terminal-card">
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span className="terminal-dot dot-red" />
                  <span className="terminal-dot dot-yellow" />
                  <span className="terminal-dot dot-green" />
                </div>
                <span className="terminal-title">kodedock-auth-engine ~ zsh</span>
              </div>
              <div className="terminal-code">
                <p>
                  <span className="t-cyan">$</span> kd auth verify --role <span className="t-purple">SELLER</span>
                </p>
                <p className="t-green">✔ Connected to PostgreSQL cluster (localhost:5432)</p>
                <p className="t-muted">ℹ Payout Model: 95% Creator / 5% Platform</p>
                <p className="t-cyan">✔ Session token verified: Scrypt + HMAC-SHA256</p>
              </div>
            </div>
          </div>

          <div className="brand-showcase-footer">
            <span>© 2026 Kodedock Inc. Zero-Markup Marketplace.</span>
            <span className="fee-highlight-badge">₹ INR Standard • 5% Max Fee</span>
          </div>
        </aside>

        {/* Right Column: Dynamic Form Container */}
        <main className="auth-form-column">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
