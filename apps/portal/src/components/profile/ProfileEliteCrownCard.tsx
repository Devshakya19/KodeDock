"use client";

import React from "react";
import { Check } from "lucide-react";

export const ProfileEliteCrownCard: React.FC = () => {
  return (
    <div className="ref-crown-card">
      <div className="ref-crown-bg-glow" aria-hidden="true" />

      {/* 3D Glowing Crown Graphic */}
      <div className="ref-crown-graphic" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="crown-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <path
            d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"
            fill="url(#crown-grad)"
            filter="drop-shadow(0 0 12px rgba(192, 132, 252, 0.6))"
          />
        </svg>
      </div>

      <div className="ref-crown-content">
        <div className="ref-crown-title-row">
          <span className="ref-crown-emoji">👑</span>
          <span className="ref-crown-title">Elite Buyer</span>
        </div>

        <div className="ref-crown-subtitle">
          Supports and empowers developers on KodeDock.
        </div>

        <div className="ref-crown-bullets">
          <div className="ref-crown-bullet">
            <Check size={13} color="#C084FC" aria-hidden="true" />
            <span>Priority Support</span>
          </div>

          <div className="ref-crown-bullet">
            <Check size={13} color="#C084FC" aria-hidden="true" />
            <span>Exclusive Deals</span>
          </div>

          <div className="ref-crown-bullet">
            <Check size={13} color="#C084FC" aria-hidden="true" />
            <span>Early Access to Projects</span>
          </div>

          <div className="ref-crown-bullet">
            <Check size={13} color="#C084FC" aria-hidden="true" />
            <span>Verified &amp; Trusted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
