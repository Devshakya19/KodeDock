"use client";
import { GithubIcon } from "@/shared/components/github-icon";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, ExternalLink, Camera, ArrowLeft, User, Link as LinkIcon, MapPin, AlignLeft, Info, LocateFixed } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { auth } from "@/shared/lib/auth";
import { apiGet, apiPut } from "@/shared/lib/api";
import { uploadFile } from "@/shared/lib/upload";
import Link from "next/link";

export default function SellerProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar must be less than 2MB");
      return;
    }

    setUploadingAvatar(true);
    setError("");
    try {
      const result = await uploadFile(file, "avatar");
      setAvatarUrl(result.public_url);
    } catch (err) {
      setError("Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleAutoFetchLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setFetchingLocation(true);
    setError("");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`);
          const data = await res.json();
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.state_district || data.address.county;
            const country = data.address.country;
            if (city && country) {
              setLocation(`${city}, ${country}`);
            } else if (data.display_name) {
              setLocation(data.display_name.split(",").slice(0, 2).join(", "));
            }
          }
        } catch (err) {
          setError("Failed to resolve location automatically.");
        } finally {
          setFetchingLocation(false);
        }
      },
      (err) => {
        setFetchingLocation(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Permission to access location was denied. Please allow location access in your browser settings and try again.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable. Please check your network or try again later.");
            break;
          case err.TIMEOUT:
            setError("The request to get your location timed out.");
            break;
          default:
            setError("An unknown error occurred while accessing location.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  useEffect(() => {
    async function loadProfile() {
      const user = await auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const result = await apiGet<any>(`/profile/${user.id}`);

      if (result.success && result.data) {
        setFullName(result.data.full_name || user.full_name || "");
        setBio(result.data.bio || "");
        setWebsite(result.data.website || "");
        setLocation(result.data.location || "");
        setGithubUsername(result.data.github_username || "");
        setIsGithubConnected(result.data.is_github_connected || false);
        setAvatarUrl(result.data.avatar_url || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const user = await auth.getUser();
    if (!user) return;

    const result = await apiPut("/profile", {
      id: user.id,
      full_name: fullName,
      bio,
      website,
      location,
      github_username: githubUsername,
      avatar_url: avatarUrl,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">

      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
        {success && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-100/50 text-sm font-medium text-emerald-800 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Profile updated successfully. Changes are now live.
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100/50 text-sm font-medium text-red-800 flex items-center gap-3">
            <Info className="w-5 h-5 text-red-500" />
            {error}
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-100">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center overflow-hidden shadow-md border-4 border-white ring-1 ring-slate-100">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold text-white">
                  {(fullName || "S").charAt(0).toUpperCase()}
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
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <>
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                </>
              )}
            </button>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{fullName || "User Profile"}</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="fullName" className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
                <User className="w-4 h-4 text-slate-400" />
                Display Name
              </label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="E.g. John Doe"
                className="h-12 border-slate-200 bg-slate-50/50 focus-visible:bg-white rounded-xl text-[15px]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="githubUsername" className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
                  <GithubIcon className="w-4 h-4 text-slate-400" />
                  GitHub Username
                </label>
                {isGithubConnected && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Linked
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[15px] font-medium">@</span>
                <Input
                  id="githubUsername"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="username"
                  disabled={isGithubConnected}
                  className={`h-12 border-slate-200 bg-slate-50/50 focus-visible:bg-white rounded-xl text-[15px] pl-9 ${isGithubConnected ? "opacity-70 cursor-not-allowed bg-slate-100" : ""}`}
                />
              </div>
              {githubUsername && (
                <div className="flex items-center justify-between mt-2">
                  <a
                    href={`https://github.com/${githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Verify Profile <ExternalLink className="w-3 h-3" />
                  </a>
                  {isGithubConnected && (
                    <span className="text-[11px] text-slate-500 font-medium">Auto-synced from connected account</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
              <AlignLeft className="w-4 h-4 text-slate-400" />
              About You
            </label>
            <textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell buyers about your expertise, background, and what kind of projects you build..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus-visible:bg-white px-4 py-3 text-[15px] shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="website" className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                Personal Website
              </label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourportfolio.com"
                className="h-12 border-slate-200 bg-slate-50/50 focus-visible:bg-white rounded-xl text-[15px]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="location" className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Location
                </label>
                <button
                  type="button"
                  onClick={handleAutoFetchLocation}
                  disabled={fetchingLocation}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                >
                  {fetchingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                  Auto Detect
                </button>
              </div>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="E.g. Bangalore, India"
                className="h-12 border-slate-200 bg-slate-50/50 focus-visible:bg-white rounded-xl text-[15px]"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="h-12 px-6 rounded-xl text-[14px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-semibold shadow-md transition-all"
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
