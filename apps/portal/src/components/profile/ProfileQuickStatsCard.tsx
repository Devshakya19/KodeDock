"use client";

import React from "react";
import type { DeveloperProfile } from "../../types/portal";
import { BarChart2, Clock, AppWindow } from "lucide-react";

interface ProfileQuickStatsCardProps {
  profile: DeveloperProfile;
}

export const ProfileQuickStatsCard: React.FC<ProfileQuickStatsCardProps> = ({ profile }) => {
  return (
    <div className="ref-card">
      <div className="ref-card-header">
        <div className="ref-card-header-title">
          <div className="ref-card-header-icon">
            <BarChart2 size={16} color="#8B5CF6" aria-hidden="true" />
          </div>
          <span>Quick Stats</span>
        </div>
      </div>

      <div className="ref-card-body ref-quick-body">
        {/* Item 1: Average Response Time */}
        <div className="ref-quick-row">
          <div className="ref-quick-label-group">
            <Clock size={14} color="var(--text-muted)" aria-hidden="true" />
            <span>Average Response Time</span>
          </div>
          <div className="ref-quick-val-group">
            <span className="ref-green-dot" />
            <span className="ref-quick-val">{profile.avgResponseTime || "< 2 hours"}</span>
          </div>
        </div>

        {/* Item 2: Favorite Category */}
        <div className="ref-quick-row">
          <div className="ref-quick-label-group">
            <AppWindow size={14} color="var(--text-muted)" aria-hidden="true" />
            <span>Favorite Category</span>
          </div>
          <div className="ref-quick-val-group">
            <span className="ref-purple-chip">{profile.favoriteCategory || "Web Apps"}</span>
          </div>
        </div>

        {/* Item 3: Last Activity */}
        <div className="ref-quick-row">
          <div className="ref-quick-label-group">
            <Clock size={14} color="var(--text-muted)" aria-hidden="true" />
            <span>Last Activity</span>
          </div>
          <div className="ref-quick-val-group">
            <span className="ref-quick-val">{profile.lastActivity || "2 days ago"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
