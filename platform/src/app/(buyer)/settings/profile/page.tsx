"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { authApi } from "@/lib/api/client";
import { UserProfile } from "@/lib/types";

export default function SettingsProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("/avatars/avatar-1.svg");
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 5000);
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await authApi.getMe();
        if (res?.data) {
          const u = res.data;
          setProfile(u);
          setFullName(u.full_name || "");
          setBio(u.bio || "");
          setPanNumber(u.pan_number || "");
          setGstNumber(u.gst_number || "");
          if (u.avatar_url) setSelectedAvatar(u.avatar_url);
        }
      } catch {
        const stored = localStorage.getItem("kd_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setProfile(parsed);
            setFullName(parsed.full_name || "");
            setBio(parsed.bio || "");
          } catch {}
        }
      }
    }

    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (panNumber.trim() && panNumber.trim().length !== 10) {
      showToast("PAN Card Number must be precisely 10 characters (e.g. ABCDE1234F)", "error");
      setIsSaving(false);
      return;
    }

    if (gstNumber.trim() && gstNumber.trim().length !== 15) {
      showToast("GSTIN must be precisely 15 characters (e.g. 29ABCDE1234F1Z5)", "error");
      setIsSaving(false);
      return;
    }

    try {
      await authApi.updateProfile({
        full_name: fullName.trim(),
        bio: bio.trim(),
        avatar_url: selectedAvatar,
        pan_number: panNumber.trim().toUpperCase(),
        gst_number: gstNumber.trim().toUpperCase(),
      });

      const updatedUser = {
        ...(profile || {}),
        full_name: fullName.trim(),
        bio: bio.trim(),
        avatar_url: selectedAvatar,
        pan_number: panNumber.trim().toUpperCase(),
        gst_number: gstNumber.trim().toUpperCase(),
      };
      localStorage.setItem("kd_user", JSON.stringify(updatedUser));
      setProfile(updatedUser as any);
      showToast("Developer profile and statutory tax settings committed successfully!");
    } catch (err: any) {
      showToast(`Save failed: ${err.message || "Failed to update profile"}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Dynamic Toast Feedback Notification */}
      {notice && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium border backdrop-blur-xl shadow-xl transition-all duration-300 animate-in slide-in-from-top-2 ${
            notice.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200 shadow-emerald-950/30"
              : "bg-rose-950/60 border-rose-500/40 text-rose-200 shadow-rose-950/30"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">{notice.type === "success" ? "⚡" : "⚠️"}</span>
            <span>{notice.text}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-xs opacity-70 hover:opacity-100 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* HOLOGRAPHIC DEVELOPER ID PASS PREVIEW */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1C1C24] via-[#16161D] to-[#121217] border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden group">
        {/* Holographic accent shimmer & circuit watermark */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-600/25 transition-all duration-700" />
        <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Live Holographic Avatar with Interactive Trigger */}
            <div className="relative group/avatar cursor-pointer" onClick={() => setAvatarPickerOpen(!avatarPickerOpen)}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-[0_0_25px_rgba(133,53,252,0.4)] relative">
                <div className="w-full h-full rounded-xl bg-[#141419] overflow-hidden flex items-center justify-center relative">
                  <Image
                    src={selectedAvatar}
                    alt="Developer Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-mono text-white">
                    <span>CHANGE</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-[#121217] border border-violet-500/40 text-[9px] font-mono text-violet-300 shadow-md">
                AVATAR
              </div>
            </div>

            {/* Developer Metadata */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
                  {fullName.trim() || profile?.full_name || "Developer"}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  VERIFIED
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#A1A1AA] font-mono">
                {profile?.email || "developer@kodedock.internal"}
              </p>
              <p className="text-xs text-[#71717A] max-w-md line-clamp-1 italic mt-1">
                &ldquo;{bio.trim() || profile?.bio || "Building enterprise solutions on KodeDock."}&rdquo;
              </p>
            </div>
          </div>

          {/* Quick Action Button to Open Avatar Vault */}
          <button
            type="button"
            onClick={() => setAvatarPickerOpen(!avatarPickerOpen)}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/40 text-xs font-mono font-medium text-white transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(133,53,252,0.2)]"
          >
            <span>🎨</span>
            <span>{avatarPickerOpen ? "Close Avatar Vault" : "Switch Avatar"}</span>
          </button>
        </div>

        {/* INTERACTIVE AVATAR VAULT DRAWER */}
        {avatarPickerOpen && (
          <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span>Select Cryptographic Avatar (24 Unique Sets)</span>
              </div>
              <span className="text-[10px] font-mono text-[#71717A]">PNG/SVG High-Res</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3 max-h-56 overflow-y-auto pr-1 p-2 rounded-2xl bg-[#121217]/80 border border-white/5 scrollbar-thin">
              {Array.from({ length: 24 }).map((_, i) => {
                const avatarPath = `/avatars/avatar-${i + 1}.svg`;
                const isCurrent = selectedAvatar === avatarPath;
                return (
                  <button
                    key={avatarPath}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(avatarPath);
                      showToast(`Avatar selected: Avatar #${i + 1}`);
                    }}
                    className={`relative aspect-square rounded-xl p-1 transition-all duration-200 cursor-pointer ${
                      isCurrent
                        ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 ring-2 ring-violet-400 scale-105 shadow-[0_0_15px_rgba(133,53,252,0.6)]"
                        : "bg-[#1C1C24] hover:bg-[#252532] border border-white/5 hover:border-violet-500/40 hover:scale-105"
                    }`}
                  >
                    <div className="w-full h-full rounded-lg bg-[#141419] overflow-hidden flex items-center justify-center">
                      <Image
                        src={avatarPath}
                        alt={`Avatar ${i + 1}`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* DEVELOPER PROFILE & STATUTORY FORM */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* SECTION 1: PUBLIC IDENTITY */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#17171E]/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-violet-400 tracking-wider">NODE // PROFILE_CORE</div>
              <h3 className="text-lg font-heading font-bold text-white tracking-tight">Public Developer Identity</h3>
            </div>
            <span className="text-xs font-mono text-[#71717A]">VISIBLE IN MARKETPLACE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#A1A1AA] flex items-center justify-between">
                <span>[FIELD: FULL_NAME]</span>
                <span className="text-[#71717A] text-[10px]">REQUIRED</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Satoshi Nakamoto"
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#101015]/90 border border-white/10 text-white placeholder-[#52525B] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 transition-all duration-300"
                />
              </div>
            </div>

            {/* Email (Immutable Display) */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#A1A1AA] flex items-center justify-between">
                <span>[FIELD: PRIMARY_EMAIL]</span>
                <span className="text-emerald-400 text-[10px]">VERIFIED (READ-ONLY)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={profile?.email || "developer@kodedock.internal"}
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#141419]/50 border border-white/5 text-[#71717A] text-sm cursor-not-allowed font-mono"
                />
                <span className="absolute right-3.5 top-3.5 text-xs text-[#52525B]">🔒</span>
              </div>
            </div>
          </div>

          {/* Developer Bio */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#A1A1AA] flex items-center justify-between">
              <span>[FIELD: DEVELOPER_BIO]</span>
              <span className="text-[#71717A] text-[10px]">MAX 300 CHARS</span>
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              placeholder="Tell other builders what tech stacks, smart contracts, or distributed backends you specialize in..."
              className="w-full px-4 py-3.5 rounded-2xl bg-[#101015]/90 border border-white/10 text-white placeholder-[#52525B] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 transition-all duration-300 resize-none"
            />
          </div>
        </div>

        {/* SECTION 2: STATUTORY TAX & B2B COMPLIANCE (INDIA SECTION 194-O) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#17171E]/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">NODE // TAX_COMPLIANCE</div>
              <h3 className="text-lg font-heading font-bold text-white tracking-tight">Statutory Indian Tax & Invoicing</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400/80">SECTION 194-O COMPLIANT</span>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Provide statutory PAN and GSTIN identifiers to claim input tax credits (ITC) on all marketplace code purchases and escrow settlements.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PAN Card */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#A1A1AA] flex items-center justify-between">
                <span>[FIELD: PAN_CARD_NUMBER]</span>
                <span className="text-[#71717A] text-[10px]">10 CHARS (e.g. ABCDE1234F)</span>
              </label>
              <input
                type="text"
                maxLength={10}
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#101015]/90 border border-white/10 text-white placeholder-[#52525B] text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 transition-all duration-300"
              />
            </div>

            {/* GSTIN */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#A1A1AA] flex items-center justify-between">
                <span>[FIELD: GSTIN_IDENTIFIER]</span>
                <span className="text-[#71717A] text-[10px]">15 CHARS (e.g. 29ABCDE1234F1Z5)</span>
              </label>
              <input
                type="text"
                maxLength={15}
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="29ABCDE1234F1Z5"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#101015]/90 border border-white/10 text-white placeholder-[#52525B] text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT COMMAND ACTION */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-heading font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(133,53,252,0.4)] border border-violet-400/40 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>COMMITTING TO POSTGRESQL...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>SAVE IDENTIFIER SETTINGS</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
