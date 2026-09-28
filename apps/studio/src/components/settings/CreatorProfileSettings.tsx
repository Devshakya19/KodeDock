"use client";

import React, { useState, useEffect } from "react";
import { User, Check, Globe, Sparkles, ShieldCheck } from "lucide-react";
import { DEVELOPER_AVATARS } from "@/lib/avatars";

export const CreatorProfileSettings: React.FC = () => {
  const [name, setName]                   = useState("");
  const [email, setEmail]                 = useState("");
  const [bio, setBio]                     = useState("");
  const [githubHandle, setGithubHandle]   = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [websiteUrl, setWebsiteUrl]       = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [success, setSuccess]             = useState(false);
  const [errorMsg, setErrorMsg]           = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/studio/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.profile) {
          const p = d.data.profile;
          setName(p.name || "");
          setEmail(p.email || "");
          setBio(p.bio || "");
          setGithubHandle(p.github_handle || "");
          setTwitterHandle(p.twitter_handle || "");
          setWebsiteUrl(p.website_url || "");
          setSelectedAvatar(p.image || "");
        }
      })
      .catch(() => {
        setErrorMsg("Failed to connect to PostgreSQL settings service");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/studio/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            name: name.trim(),
            image: selectedAvatar,
            bio: bio.trim(),
            github_handle: githubHandle.trim(),
            twitter_handle: twitterHandle.trim(),
            website_url: websiteUrl.trim(),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      } else {
        setErrorMsg(data.error?.message || "Failed to update profile");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while saving profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-card" id="settings-creator-profile">
      <div className="section-card-header">
        <div>
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Creator Architectural Profile</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.2rem 0.5rem",
                fontSize: "0.68rem",
                fontFamily: "var(--font-mono)",
                background: "rgba(56, 189, 248, 0.12)",
                color: "var(--accent-cyan)",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}
            >
              <ShieldCheck size={11} /> VERIFIED CREATOR
            </span>
          </div>
          <div className="card-desc">
            Your public developer identity displayed on the KodeDock marketplace across your published architectures.
          </div>
        </div>
        <User size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <form onSubmit={handleSave}>
        <div className="section-card-body">
          {loading ? (
            <div
              style={{
                padding: "2rem 0",
                textTransform: "uppercase",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
              }}
            >
              Syncing PostgreSQL Creator Profile...
            </div>
          ) : (
            <>
              {errorMsg && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    marginBottom: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    color: "var(--status-danger)",
                    fontSize: "0.82rem",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Avatar Selection */}
              <div className="form-group" style={{ marginBottom: "1.75rem" }}>
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Architect Avatar Preset</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    10 IDENTITIES AVAILABLE
                  </span>
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))",
                    gap: "0.75rem",
                    marginTop: "0.6rem",
                  }}
                >
                  {DEVELOPER_AVATARS.map((av) => {
                    const isSelected = selectedAvatar === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.url)}
                        title={av.name}
                        style={{
                          position: "relative",
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          border: isSelected
                            ? "2.5px solid var(--accent-cyan)"
                            : "1px solid var(--border-subtle)",
                          background: "var(--bg-surface-elevated)",
                          padding: "2px",
                          cursor: "pointer",
                          boxShadow: isSelected
                            ? "0 0 16px rgba(56, 189, 248, 0.45)"
                            : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <img
                          src={av.url}
                          alt={av.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        {isSelected && (
                          <span
                            style={{
                              position: "absolute",
                              bottom: "-2px",
                              right: "-2px",
                              width: "18px",
                              height: "18px",
                              background: "var(--accent-cyan)",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#000",
                            }}
                          >
                            <Check size={11} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Creator Name & Email Grid */}
              <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                <div className="form-group">
                  <label htmlFor="creator-name" className="form-label">
                    Studio Display / Brand Name
                  </label>
                  <input
                    id="creator-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Nexus Architecture Lab"
                  />
                  <div className="form-helper">Public creator brand or lead architect handle.</div>
                </div>

                <div className="form-group">
                  <label htmlFor="creator-email" className="form-label">
                    Primary Verified Email
                  </label>
                  <input
                    id="creator-email"
                    type="email"
                    disabled
                    value={email}
                    className="form-input"
                    style={{ opacity: 0.7, cursor: "not-allowed", fontFamily: "var(--font-mono)" }}
                  />
                  <div className="form-helper">Primary authentication account email in PostgreSQL.</div>
                </div>
              </div>

              {/* Bio & Manifesto */}
              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label htmlFor="creator-bio" className="form-label">
                    Architectural Manifesto / Bio
                  </label>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {bio.length}/300
                  </span>
                </div>
                <textarea
                  id="creator-bio"
                  rows={3}
                  maxLength={300}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="form-input"
                  placeholder="Senior Distributed Systems Architect building low-latency microservices, high-concurrency Rust crates, and Next.js fullstack systems..."
                  style={{ resize: "vertical", minHeight: "84px" }}
                />
                <div className="form-helper">
                  Brief description of your engineering experience, published packages, and software specializations.
                </div>
              </div>

              {/* Social Channels & Links */}
              <div
                style={{
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="creator-github" className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                    GitHub Username
                  </label>
                  <input
                    id="creator-github"
                    type="text"
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                    className="form-input font-mono"
                    placeholder="e.g. torvalds"
                    style={{ fontSize: "0.82rem" }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="creator-twitter" className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                    </svg>
                    Twitter / X Handle
                  </label>
                  <input
                    id="creator-twitter"
                    type="text"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    className="form-input font-mono"
                    placeholder="e.g. @architect_kd"
                    style={{ fontSize: "0.82rem" }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="creator-website" className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Globe size={13} /> Portfolio / Docs URL
                  </label>
                  <input
                    id="creator-website"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="form-input font-mono"
                    placeholder="https://engineering.dev"
                    style={{ fontSize: "0.82rem" }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="section-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {success && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "var(--accent-cyan)",
                  fontSize: "0.82rem",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <Check size={14} /> PROFILE PERSISTED TO POSTGRESQL
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || saving}
            className="btn btn-primary"
            style={{
              padding: "0.55rem 1.4rem",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                SAVING...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                SAVE PROFILE
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
