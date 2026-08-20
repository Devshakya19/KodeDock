"use client";

import { useState, useEffect } from "react";
import { GithubIcon } from "@/shared/components/icons/github";
import { Link as LinkIcon, Mail, Loader2 } from "lucide-react";
import { auth, User } from "@/shared/lib/auth/client";
import { apiPost } from "@/shared/lib/api/client";
import { theme } from "@/shared/lib/theme";

export function ConnectionsSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [unlinking, setUnlinking] = useState(false);

  useEffect(() => {
    // Read potential errors or success messages from the OAuth redirect URL
    const params = new URLSearchParams(window.location.search);
    const errParam = params.get("error");
    const successParam = params.get("success");
    if (errParam) setError(decodeURIComponent(errParam));
    if (successParam) setSuccess(decodeURIComponent(successParam));

    // Remove query params to clean up URL
    if (errParam || successParam) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Fetch user profile to see if GitHub is linked
    auth.getUser().then((userData) => {
      setUser(userData);
      setLoading(false);
    });
  }, []);

  function handleConnectGithub() {
    setError("");
    setSuccess("");
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!clientId || clientId === "your_github_client_id") {
      setError("GitHub Client ID is not configured in environment variables.");
      return;
    }
    
    // Pass 'link' in state so the callback knows this is a linking action, not a login action
    const state = btoa("link|/seller/settings/connections");
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${window.location.origin}/api/auth/callback&scope=repo&state=${state}`;
  }

  async function handleUnlinkGithub() {
    setUnlinking(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiPost<{}>("/auth/github/unlink", {});
      if (!res.success) {
        throw new Error(res.error || res.message || "Failed to unlink GitHub");
      }
      setSuccess("GitHub account unlinked successfully");
      // Update local state so UI updates
      if (user) {
        setUser({ ...user, github_username: null });
      }
    } catch (e: any) {
      setError(e.message || "An error occurred while unlinking.");
    } finally {
      setUnlinking(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/80" />
      </div>
    );
  }

  const isGithubLinked = !!user?.github_username;

  return (
    <div className="w-full">
      <div className={theme.components.card}>
        <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Connected Accounts</h2>
            <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Link third-party accounts for login and integrations</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-red-100/50 text-[13px] font-medium text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-success/10 border border-emerald-100/50 text-[13px] font-medium text-success-foreground">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* GitHub Connection */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-colors ${
            isGithubLinked ? "border-emerald-200/60 bg-emerald-50/30" : "border-border/60 bg-background"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                isGithubLinked ? "bg-background border-success/20" : "bg-secondary/50 border-border"
              }`}>
                <GithubIcon className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-foreground">GitHub</h3>
                {isGithubLinked ? (
                  <p className="text-[13px] text-success font-medium mt-0.5">
                    Linked to <span className="font-bold text-success">@{user?.github_username}</span>
                  </p>
                ) : (
                  <p className="text-[13px] text-muted-foreground mt-0.5 max-w-[280px]">
                    Connect your GitHub account to sync repositories directly. Requires public and private repository access.
                  </p>
                )}
              </div>
            </div>
            
            {isGithubLinked ? (
              <button 
                onClick={handleUnlinkGithub}
                disabled={unlinking}
                className="h-10 px-6 rounded-xl border border-border hover:bg-secondary text-foreground text-[13px] font-semibold transition-all w-full sm:w-auto disabled:opacity-50"
              >
                {unlinking ? "Unlinking..." : "Unlink"}
              </button>
            ) : (
              <button 
                onClick={handleConnectGithub}
                className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[13px] font-semibold transition-all w-full sm:w-auto"
              >
                Connect
              </button>
            )}
          </div>

          {/* Google Connection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/60 bg-background">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/50 border border-border flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-foreground">Google</h3>
                <p className="text-[13px] text-muted-foreground mt-0.5 max-w-[280px]">
                  Use Google to securely log into your KodeDock account.
                </p>
              </div>
            </div>
            <button className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[13px] font-semibold transition-all w-full sm:w-auto">
              Connect
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
