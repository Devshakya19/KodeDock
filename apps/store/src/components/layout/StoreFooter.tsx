import React from "react";
import Link from "next/link";
import { ShieldCheck, Terminal, Heart, Code2 } from "lucide-react";

export const StoreFooter: React.FC = () => {
  return (
    <footer className="store-footer">
      <div className="store-container store-container-full">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <img src="/kd.svg" alt="KodeDock" style={{ width: 28, height: 28 }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", color: "#ffffff" }}>
                KodeDock
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6, maxWidth: "340px", marginBottom: "1.25rem" }}>
              The high-velocity marketplace for verified, production-grade software codebases, micro-SaaS architectures, and developer tools.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--status-success)", fontSize: "0.78rem", fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>100% Real PostgreSQL 16 &amp; Ed25519 Cryptographic Licenses</span>
            </div>
          </div>

          {/* Column 1: Marketplace */}
          <div>
            <div className="footer-col-title">Marketplace</div>
            <ul className="footer-links-list">
              <li><Link href="/" className="footer-link">Explore Catalog</Link></li>
              <li><Link href="/?category=SaaS" className="footer-link">SaaS Boilerplates</Link></li>
              <li><Link href="/?category=Developer+Tools" className="footer-link">Developer Tools</Link></li>
              <li><Link href="/?category=AI" className="footer-link">AI &amp; ML Starters</Link></li>
              <li><Link href="/?priceRange=free" className="footer-link">Community Free Tools</Link></li>
            </ul>
          </div>

          {/* Column 2: Ecosystem */}
          <div>
            <div className="footer-col-title">Ecosystem</div>
            <ul className="footer-links-list">
              <li><a href="http://localhost:3002" className="footer-link">Buyer Developer Portal</a></li>
              <li><a href="http://localhost:3001" className="footer-link">Creator Studio</a></li>
              <li><a href="http://localhost:3000" className="footer-link">Marketing Hub</a></li>
              <li><Link href="/wishlist" className="footer-link">Saved Wishlist</Link></li>
              <li><Link href="/cart" className="footer-link">Checkout Bag</Link></li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div>
            <div className="footer-col-title">Trust &amp; Security</div>
            <ul className="footer-links-list">
              <li><Link href="/licenses" className="footer-link">Commercial License Terms</Link></li>
              <li><Link href="/gst-invoicing" className="footer-link">Indian B2B GST Invoicing</Link></li>
              <li><Link href="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link href="/terms" className="footer-link">Terms of Service</Link></li>
              <li><Link href="/security" className="footer-link">Security Audits</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>
            © {new Date().getFullYear()} KodeDock Technologies Inc. All rights reserved. Indian Rupee (INR) currency compliant.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>v1.0.0</span>
            <span style={{ color: "var(--accent-primary)" }}>●</span>
            <span>Obsidian 60-30-10</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
