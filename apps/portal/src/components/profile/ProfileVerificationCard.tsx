"use client";

import React from "react";
import type { DeveloperProfile } from "../../types/portal";
import { ShieldCheck, Check } from "lucide-react";

interface ProfileVerificationCardProps {
  profile: DeveloperProfile;
}

export const ProfileVerificationCard: React.FC<ProfileVerificationCardProps> = ({ profile }) => {
  return (
    <div className="ref-card">
      <div className="ref-card-header">
        <div className="ref-card-header-title">
          <div className="ref-card-header-icon">
            <ShieldCheck size={16} color="#8B5CF6" aria-hidden="true" />
          </div>
          <span>Verification</span>
        </div>

        <span className="ref-pill-green-sm">
          <Check size={12} aria-hidden="true" />
          <span>Verified</span>
        </span>
      </div>

      <div className="ref-card-body ref-verif-body">
        <div className="ref-verif-item">
          <div className="ref-check-icon">
            <Check size={12} color="#10B981" aria-hidden="true" />
          </div>
          <span>Email Verified</span>
        </div>

        <div className="ref-verif-item">
          <div className="ref-check-icon">
            <Check size={12} color="#10B981" aria-hidden="true" />
          </div>
          <span>Phone Verified</span>
        </div>

        <div className="ref-verif-item">
          <div className="ref-check-icon">
            <Check size={12} color="#10B981" aria-hidden="true" />
          </div>
          <span>Identity Verified</span>
        </div>
      </div>
    </div>
  );
};
