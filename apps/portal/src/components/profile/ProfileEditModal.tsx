"use client";

import React, { useState, useEffect } from "react";
import type { DeveloperProfile } from "../../types/portal";
import { X, Save, ShieldCheck, AlertCircle } from "lucide-react";

interface ProfileEditModalProps {
  profile: DeveloperProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: DeveloperProfile) => void;
  onToast: (msg: string) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
  onToast,
}) => {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || "");
  const [githubHandle, setGithubHandle] = useState(profile.githubHandle || "");
  const [twitterHandle, setTwitterHandle] = useState(profile.twitterHandle || "");
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(profile.name);
    setBio(profile.bio || "");
    setGithubHandle(profile.githubHandle || "");
    setTwitterHandle(profile.twitterHandle || "");
    setWebsiteUrl(profile.websiteUrl || "");
    setError(null);
  }, [profile, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Full name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          githubHandle: githubHandle.trim(),
          twitterHandle: twitterHandle.trim(),
          websiteUrl: websiteUrl.trim(),
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        onSave(json.data);
        onToast("Developer credentials successfully updated in database");
        onClose();
      } else {
        setError(json.error?.message || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="profile-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div className="profile-modal-dialog">
        <div className="double-bezel">
          <div className="double-bezel-inner">
            {/* Header */}
            <div className="section-card-header" style={{ alignItems: "center" }}>
              <div>
                <h2 id="edit-profile-title" className="card-title" style={{ fontSize: "1.15rem" }}>
                  Edit Developer Credentials
                </h2>
                <div className="card-desc" style={{ fontSize: "0.78rem" }}>
                  Changes will sync directly to your verified PostgreSQL developer account
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn-ghost"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Close modal"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="section-card-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {error && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      background: "var(--danger-subtle)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--status-danger)",
                      fontSize: "0.82rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <AlertCircle size={14} aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Name */}
                <div className="form-group">
                  <label htmlFor="edit-name" className="form-label">
                    Display Name
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Priya Buyer"
                    required
                  />
                </div>

                {/* Bio */}
                <div className="form-group">
                  <label htmlFor="edit-bio" className="form-label">
                    Engineering Narrative & Bio
                  </label>
                  <textarea
                    id="edit-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="form-textarea"
                    placeholder="Describe your engineering specializations, architectural principles, or public projects..."
                    rows={3}
                  />
                </div>

                {/* Social Handles Grid */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="edit-github" className="form-label">
                      GitHub Username
                    </label>
                    <input
                      id="edit-github"
                      type="text"
                      value={githubHandle}
                      onChange={(e) => setGithubHandle(e.target.value)}
                      className="form-input font-mono"
                      placeholder="e.g. priya-dev"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-twitter" className="form-label">
                      Twitter / X Handle
                    </label>
                    <input
                      id="edit-twitter"
                      type="text"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      className="form-input font-mono"
                      placeholder="e.g. priya_codes"
                    />
                  </div>
                </div>

                {/* Portfolio URL */}
                <div className="form-group">
                  <label htmlFor="edit-website" className="form-label">
                    Portfolio / Website URL
                  </label>
                  <input
                    id="edit-website"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="form-input font-mono"
                    placeholder="https://priyadev.com"
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    paddingTop: "0.5rem",
                  }}
                >
                  <ShieldCheck size={13} color="var(--status-success)" aria-hidden="true" />
                  <span>Primary email address ({profile.email}) is locked for security. Change in Settings.</span>
                </div>
              </div>

              {/* Footer */}
              <div className="section-card-footer">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary btn-md"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-md"
                  disabled={saving}
                >
                  <Save size={14} aria-hidden="true" />
                  <span>{saving ? "Saving Changes..." : "Save Credentials"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
