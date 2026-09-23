"use client";

import React from "react";
import type { DeveloperProfile } from "../../types/portal";
import { Layers, ShoppingBag, ShieldCheck, Calendar } from "lucide-react";

interface ProfileMetricsStripProps {
  profile: DeveloperProfile;
}

export const ProfileMetricsStrip: React.FC<ProfileMetricsStripProps> = ({ profile }) => {
  const memberMonthYear = new Date(profile.joinedAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="ref-metrics-strip">
      {/* Cell 1: Active Listings */}
      <div className="ref-metric-cell">
        <div className="ref-metric-icon-wrap">
          <Layers size={18} color="#8B5CF6" aria-hidden="true" />
        </div>
        <div className="ref-metric-info">
          <div className="ref-metric-label">Active Listings</div>
          <div className="ref-metric-val">{profile.totalLicenses ?? 3}</div>
          <div className="ref-metric-sub">Projects / Products interested</div>
        </div>
      </div>

      {/* Cell 2: Total Purchases */}
      <div className="ref-metric-cell">
        <div className="ref-metric-icon-wrap">
          <ShoppingBag size={18} color="#8B5CF6" aria-hidden="true" />
        </div>
        <div className="ref-metric-info">
          <div className="ref-metric-label">Total Purchases</div>
          <div className="ref-metric-val">{profile.totalOrders ?? 3}</div>
          <div className="ref-metric-sub">Successful transactions</div>
        </div>
      </div>

      {/* Cell 3: Buyer Success Rate */}
      <div className="ref-metric-cell">
        <div className="ref-metric-icon-wrap">
          <ShieldCheck size={18} color="#10B981" aria-hidden="true" />
        </div>
        <div className="ref-metric-info">
          <div className="ref-metric-label">Buyer Success Rate</div>
          <div className="ref-metric-val ref-metric-val-green">100%</div>
          <div className="ref-metric-sub">Trusted &amp; verified buyer</div>
        </div>
      </div>

      {/* Cell 4: Member Since */}
      <div className="ref-metric-cell">
        <div className="ref-metric-icon-wrap">
          <Calendar size={18} color="#8B5CF6" aria-hidden="true" />
        </div>
        <div className="ref-metric-info">
          <div className="ref-metric-label">Member Since</div>
          <div className="ref-metric-val ref-metric-val-sm">{memberMonthYear}</div>
          <div className="ref-metric-sub">Verified KodeDock user</div>
        </div>
      </div>
    </div>
  );
};
