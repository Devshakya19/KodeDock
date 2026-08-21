"use client";
import { GithubIcon } from "@/shared/components/icons/github";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, ExternalLink, Camera, User, Link as LinkIcon, MapPin, AlignLeft, Info, LocateFixed } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useProfile } from "@/shared/hooks/profile";
import { theme } from "@/shared/lib/theme";

export function ProfileSettings() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    loading,
    saving,
    uploadingAvatar,
    fetchingLocation,
    success,
    error,
    formData,
    updateField,
    handleAvatarUpload,
    handleAutoFetchLocation,
    handleSubmit
  } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={theme.components.card}>
        {success && (
          <div className={`mb-8 ${theme.alerts.success}`}>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Profile updated successfully. Changes are now live.
          </div>
        )}

        {error && (
          <div className={`mb-8 ${theme.alerts.error}`}>
            <Info className="w-5 h-5 text-destructive" />
            {error}
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-border">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center overflow-hidden shadow-md border-4 border-white ring-1 ring-slate-100">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold text-primary-foreground">
                  {(formData.full_name || "S").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
              ) : (
                <>
                  <Camera className="w-6 h-6 text-primary-foreground mb-1" />
                  <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-wider">Change</span>
                </>
              )}
            </button>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">{formData.full_name || "User Profile"}</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="fullName" className={theme.typography.label}>
                <User className="w-4 h-4 text-muted-foreground" />
                Display Name
              </label>
              <Input
                id="fullName"
                value={formData.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
                placeholder="E.g. John Doe"
                className={theme.inputs.base}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="githubUsername" className={theme.typography.label}>
                  <GithubIcon className="w-4 h-4 text-muted-foreground" />
                  GitHub Username
                </label>
                {formData.is_github_connected && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Linked
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-[15px] font-medium">@</span>
                <Input
                  id="githubUsername"
                  value={formData.github_username}
                  onChange={(e) => updateField("github_username", e.target.value)}
                  placeholder="username"
                  disabled={formData.is_github_connected}
                  className={`h-12 border-border bg-secondary/50 focus-visible:bg-background rounded-xl text-[15px] pl-9 ${formData.is_github_connected ? "opacity-70 cursor-not-allowed bg-secondary" : ""}`}
                />
              </div>
              {formData.github_username && (
                <div className="flex items-center justify-between mt-2">
                  <a
                   href={`https://github.com/${formData.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:text-blue-700 transition-colors"
                  >
                    Verify Profile <ExternalLink className="w-3 h-3" />
                  </a>
                  {formData.is_github_connected && (
                    <span className="text-[11px] text-muted-foreground font-medium">Auto-synced from connected account</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className={theme.typography.label}>
              <AlignLeft className="w-4 h-4 text-muted-foreground" />
              About You
            </label>
            <textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Tell buyers about your expertise, background, and what kind of projects you build..."
              className={theme.inputs.textarea}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="website" className={theme.typography.label}>
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                Personal Website
              </label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="https://yourportfolio.com"
                className={theme.inputs.base}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="location" className={theme.typography.label}>
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Location
                </label>
                <button
                  type="button"
                  onClick={handleAutoFetchLocation}
                  disabled={fetchingLocation}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-accent hover:text-blue-700 transition-colors disabled:opacity-50"
                >
                  {fetchingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                  Auto Detect
                </button>
              </div>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="E.g. Bangalore, India"
                className={theme.inputs.base}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="h-12 px-6 rounded-xl text-[14px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[14px] font-semibold shadow-md transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving Changes...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
