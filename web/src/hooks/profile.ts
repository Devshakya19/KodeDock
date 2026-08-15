"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth/client";
import { apiGet, apiPut } from "@/lib/api/client";
import { uploadFile } from "@/lib/api/upload";

export interface ProfileData {
  full_name: string;
  bio: string;
  location: string;
  avatar_url: string;
  website: string;
  github_username: string;
  is_github_connected: boolean;
}

export function useProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const [formData, setFormData] = useState<ProfileData>({
    full_name: "",
    bio: "",
    location: "",
    avatar_url: "",
    website: "",
    github_username: "",
    is_github_connected: false,
  });

  const [userId, setUserId] = useState<string | null>(null);

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
        setFormData({
          full_name: result.data.full_name || user.full_name || "",
          bio: result.data.bio || "",
          location: result.data.location || "",
          avatar_url: result.data.avatar_url || "",
          website: result.data.website || "",
          github_username: result.data.github_username || "",
          is_github_connected: result.data.is_github_connected || false,
        });
      } else {
        setFormData((prev) => ({ ...prev, full_name: user.full_name || "" }));
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  function updateField<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

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
      updateField("avatar_url", result.public_url);
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
              updateField("location", `${city}, ${country}`);
            } else if (data.display_name) {
              updateField("location", data.display_name.split(",").slice(0, 2).join(", "));
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError("");

    const result = await apiPut("/profile", {
      id: userId,
      ...formData
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  return {
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
  };
}
