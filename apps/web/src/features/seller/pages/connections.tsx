"use client";

import { useState } from "react";
import { GithubIcon } from "@/shared/components/github-icon";
import { Link as LinkIcon, Mail } from "lucide-react";

export default function SellerConnectionsPage() {
  const [error, setError] = useState("");

  function handleConnectGithub() {
    setError("");
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!clientId || clientId === "your_github_client_id") {
      setError("GitHub Client ID is not configured in environment variables.");
      return;
    }
    
    // We pass 'repo' scope to request full control of private and public repositories
    const state = btoa("seller|/seller/settings/connections");
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${window.location.origin}/api/auth/callback&scope=repo&state=${state}`;
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Connected Accounts</h2>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">Link third-party accounts for login and integrations</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100/50 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* GitHub Connection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/60 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <GithubIcon className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">GitHub</h3>
                <p className="text-[13px] text-slate-500 mt-0.5 max-w-[280px]">
                  Connect your GitHub account to sync repositories directly. Requires public and private repository access.
                </p>
              </div>
            </div>
            <button 
              onClick={handleConnectGithub}
              className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold transition-all w-full sm:w-auto"
            >
              Connect
            </button>
          </div>

          {/* Google Connection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/60 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">Google</h3>
                <p className="text-[13px] text-slate-500 mt-0.5 max-w-[280px]">
                  Use Google to securely log into your CodeHaat account.
                </p>
              </div>
            </div>
            <button className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold transition-all w-full sm:w-auto">
              Connect
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
