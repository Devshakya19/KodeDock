"use client";

import React from "react";
import type { DeveloperProfile } from "../../types/portal";
import { User, Edit3, MapPin, Calendar } from "lucide-react";

interface ProfileAboutCardProps {
  profile: DeveloperProfile;
  onOpenEditModal: () => void;
}

export const ProfileAboutCard: React.FC<ProfileAboutCardProps> = ({
  profile,
  onOpenEditModal,
}) => {
  const memberMonthYear = new Date(profile.joinedAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="ref-card">
      <div className="ref-card-header">
        <div className="ref-card-header-title">
          <div className="ref-card-header-icon">
            <User size={16} color="#8B5CF6" aria-hidden="true" />
          </div>
          <span>About Buyer</span>
        </div>

        <button
          type="button"
          className="ref-ghost-edit-btn"
          onClick={onOpenEditModal}
        >
          <Edit3 size={13} aria-hidden="true" />
          <span>Edit</span>
        </button>
      </div>

      <div className="ref-card-body ref-about-body">
        {/* Full Name */}
        <div className="ref-field-row">
          <span className="ref-field-label">Full Name</span>
          <span className="ref-field-val">{profile.name}</span>
        </div>

        {/* Bio */}
        <div className="ref-field-row">
          <span className="ref-field-label">Bio</span>
          <span className="ref-field-val ref-bio-text">
            {profile.bio || "Loves to build, buy and explore cool digital products. Focused on web, apps and modern tech."}
          </span>
        </div>

        {/* Location */}
        <div className="ref-field-row">
          <span className="ref-field-label">Location</span>
          <span className="ref-field-val ref-icon-val">
            <MapPin size={13} color="var(--accent-primary)" aria-hidden="true" />
            <span>{profile.location || "India"}</span>
          </span>
        </div>

        {/* Member Since */}
        <div className="ref-field-row">
          <span className="ref-field-label">Member Since</span>
          <span className="ref-field-val ref-icon-val">
            <Calendar size={13} color="var(--text-muted)" aria-hidden="true" />
            <span>{memberMonthYear}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
