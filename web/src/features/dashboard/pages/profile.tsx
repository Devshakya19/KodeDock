"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Camera, ArrowLeft, User, AlignLeft, MapPin } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { auth } from "@/shared/lib/auth";
import { apiGet, apiPut } from "@/shared/lib/api";
import { uploadFile } from "@/shared/lib/upload";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

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
    } catch {
      setError("Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  useEffect(() => {
    async function loadProfile() {
      const user = await auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      const result = await apiGet<any>(`/profile/${user.id}`);

      if (result.success && result.data) {
        setFullName(result.data.full_name || user.full_name || "");
        setBio(result.data.bio || "");
        setLocation(result.data.location || "");
        setAvatarUrl(result.data.avatar_url || "");
      } else {
        setFullName(user.full_name || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError("");

    const result = await apiPut("/profile", {
      id: userId,
      full_name: fullName,
      bio,
      location,
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
    <div className="max-w-4xl mx-auto py-8 font-sans">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Personal Details</h1>
        <p className="text-slate-500 mt-1 text-[15px]">Manage your buyer profile and identity</p>
      </div>

      <div className="bg-white rounded-[24px] p-6 sm:p-10 border border-slate-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] relative overflow-hidden">
        
        {/* Decorative background shape */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none" />

        {success && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-100/50 text-sm font-medium text-emerald-800 flex items-center gap-3 relative z-10">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Profile updated successfully.
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100/50 text-sm font-medium text-red-800 flex items-center gap-3 relative z-10">
            {error}
          </div>
        )}

        {/* Avatar Upload Section - Circular and soft for buyer */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 pb-8 border-b border-slate-100/60 relative z-10">
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm border-[4px] border-white ring-1 ring-slate-200">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-extrabold text-slate-400">
                  {(fullName || "U").charAt(0).toUpperCase()}
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
              className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
          <div className="text-center sm:text-left mt-2">
            <h3 className="text-lg font-bold text-slate-900">Your Photo</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Upload a recognizable photo. Max size 2MB.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-bold hover:bg-slate-200 transition-colors"
            >
              Change Picture
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10 max-w-2xl">
          
          <div className="space-y-2">
            <label htmlFor="fullName" className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
              <User className="w-4 h-4 text-slate-400" />
              Full Name
            </label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Smith"
              className="h-12 border-slate-200 bg-slate-50 focus-visible:bg-white rounded-xl text-[15px]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
              <AlignLeft className="w-4 h-4 text-slate-400" />
              A little about you
            </label>
            <textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Software Engineer, designer, learner..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 focus-visible:bg-white px-4 py-3 text-[15px] shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-slate-400" />
              Location
            </label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. New York, USA"
              className="h-12 border-slate-200 bg-slate-50 focus-visible:bg-white rounded-xl text-[15px]"
            />
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-start gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-bold shadow-sm transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="h-12 px-6 rounded-xl text-[14px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              Discard
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
