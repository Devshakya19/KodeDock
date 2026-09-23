"use client";

import React, { useState } from "react";
import type { DeveloperProfile } from "../../types/portal";
import { Code2, Edit3, X, Lightbulb } from "lucide-react";

interface ProfileTechInterestsCardProps {
  profile: DeveloperProfile;
  onOpenEditModal: () => void;
}

export const ProfileTechInterestsCard: React.FC<ProfileTechInterestsCardProps> = ({
  profile,
  onOpenEditModal,
}) => {
  const [techList, setTechList] = useState<string[]>(
    profile.primaryTech?.length
      ? profile.primaryTech
      : ["Next.js", "TypeScript", "PostgreSQL", "Docker", "React", "Tailwind CSS"]
  );

  const handleRemove = (t: string) => {
    setTechList((prev) => prev.filter((item) => item !== t));
  };

  const getTechIcon = (name: string) => {
    return <Code2 size={13} color="var(--accent-cyan)" aria-hidden="true" />;
  };

  return (
    <div className="ref-card">
      <div className="ref-card-header">
        <div>
          <div className="ref-card-header-title">
            <div className="ref-card-header-icon">
              <Code2 size={16} color="#8B5CF6" aria-hidden="true" />
            </div>
            <span>Tech Interests &amp; Preferences</span>
          </div>
          <div className="ref-card-subdesc">
            Technologies, frameworks and categories you're interested in.
          </div>
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

      <div className="ref-card-body ref-tech-body">
        {/* Interactive Tech Tags Row matching reference design */}
        <div className="ref-tech-chips-row">
          {techList.map((t) => (
            <div key={t} className="ref-tech-chip">
              {getTechIcon(t)}
              <span>{t}</span>
              <button
                type="button"
                className="ref-tech-chip-remove"
                onClick={() => handleRemove(t)}
                title={`Remove ${t}`}
              >
                <X size={11} aria-hidden="true" />
              </button>
            </div>
          ))}
          <span className="ref-tech-chip-more">+3 more</span>
        </div>

        {/* Bottom Sub-Box: Looking For */}
        <div className="ref-looking-for-box">
          <div className="ref-looking-icon-wrap">
            <Lightbulb size={16} color="#F59E0B" aria-hidden="true" />
          </div>
          <div className="ref-looking-text-content">
            <div className="ref-looking-title">Looking for</div>
            <div className="ref-looking-desc">
              {profile.lookingFor || "Web applications, SaaS platforms, developer tools, automation scripts, and innovative digital products."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
